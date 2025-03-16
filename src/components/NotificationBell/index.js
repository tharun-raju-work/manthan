import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../../services/notificationService';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const bellRef = useRef(null);

  // Define fetchNotifications with useCallback to prevent dependency cycles
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching notifications...');
      console.log('User authenticated:', !!user);
      if (user.data?.token) {
        console.log('Token available, first few characters:', user.data.token.substring(0, 10) + '...');
      } else {
        console.log('No token found in user object');
      }
      
      const response = await getNotifications();
      console.log('Notification response:', response);
      
      if (response && response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.pagination.unreadCount);
        setAuthChecked(true); // Successfully authenticated request
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // Check if this is an auth error
      if (err.message && (
          err.message.includes('token') || 
          err.message.includes('access denied') || 
          err.message.includes('unauthorized') ||
          err.message.includes('expired') ||
          err.message.includes('Unauthorized'))) {
        // It's an auth error, let's not show an error message to the user
        // Just mark as checked to prevent retries
        setAuthChecked(true);
        console.log('Authentication error detected, marking as checked');
        
        // If it's an expiration error, we might want to navigate to login
        if (err.message.includes('expired')) {
          console.log('Token appears to be expired');
        }
      } else {
        // For non-auth errors, display to the user
        setError('Could not load notifications. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Define fetchUnreadCount with useCallback
  const fetchUnreadCount = useCallback(async () => {
    if (!user || !authChecked) return;
    
    try {
      const response = await getNotifications();
      if (response.success) {
        setUnreadCount(response.data.pagination.unreadCount);
      }
    } catch (err) {
      // Just log the error but don't update UI for background polling
      console.error('Error fetching unread count:', err);
    }
  }, [user, authChecked]);

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up polling to check for new notifications
      const interval = setInterval(fetchUnreadCount, 60000); // Poll every minute
      
      return () => clearInterval(interval);
    } else {
      // Mark as auth checked so we don't keep trying if user is not logged in
      setAuthChecked(true);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Add click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      if (!notification.read) {
        await markNotificationAsRead(notification._id);
        
        // Update local state
        setNotifications(
          notifications.map(n => 
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      
      // Navigate to the URL if provided
      if (notification.url) {
        setIsOpen(false);
        navigate(notification.url);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(
        notifications.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Calculate time ago for notifications
  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return 'just now';
  };

  if (!user) return null;

  return (
    <div className="notification-bell" ref={bellRef}>
      <button 
        className="notification-bell-button" 
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="bell-icon" />
        ) : (
          <BellIcon className="bell-icon" />
        )}
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="mark-all-read" 
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {isLoading ? (
              <div className="notification-loading">Loading...</div>
            ) : error ? (
              <div className="notification-error">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">No notifications yet</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.image ? (
                    <img 
                      src={notification.image} 
                      alt="" 
                      className="notification-image"
                    />
                  ) : notification.sender ? (
                    <div className="notification-avatar">
                      {notification.sender.name?.charAt(0) || '?'}
                    </div>
                  ) : (
                    <div className="notification-icon">
                      <BellIcon />
                    </div>
                  )}
                  
                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{getTimeAgo(notification.createdAt)}</div>
                  </div>
                  
                  {!notification.read && (
                    <div className="notification-unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 