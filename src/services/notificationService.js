import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  // In production (on Vercel), use a relative path to avoid CORS issues
  // In development, use the full URL
  baseURL: process.env.NODE_ENV === 'development' 
    ? (process.env.REACT_APP_API_URL || 'https://manthan-final-oa9p-nhjm59b9o-rahultharun2024-gmailcoms-projects.vercel.app/api/v1')
    : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get the user object from localStorage which contains the token
    const user = localStorage.getItem('user');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        // The token is stored inside user.data.token based on the auth system
        if (userData.data?.token) {
          config.headers.Authorization = `Bearer ${userData.data.token}`;
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Improve error handling to provide more detailed errors
const handleApiError = (error, defaultMessage) => {
  console.error(defaultMessage, error);
  
  // Special handling for CORS errors
  if (error.message === 'Network Error') {
    // This is often a CORS error
    console.error('This appears to be a CORS error. Check that your server allows cross-origin requests and the correct HTTP methods.');
    return new Error('Network error: Could not connect to the server. This might be a CORS issue.');
  }
  
  if (error.response) {
    // Handle token expired error
    if (error.response.status === 401) {
      console.log('Authentication error. Token may be expired.');
      
      // Try to get auth context or redirect to login
      if (window.location.pathname !== '/login') {
        // Store the current location to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        
        // Check if we need to force logout
        const message = error.response.data?.message || '';
        if (message.includes('expired') || message.includes('invalid') || error.response.data?.error === 'token_expired') {
          console.log('Token is expired. Redirecting to login page...');
          localStorage.removeItem('user'); // Clear the expired token
          
          // Give some time for console logs to appear before redirecting
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
          
          return new Error('Your session has expired. Please log in again.');
        }
      }
    }
    
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data?.message || defaultMessage;
    throw new Error(message);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from server. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || defaultMessage);
  }
};

/**
 * Get notifications for the current user
 * @param {Object} options - Query options (limit, skip, read)
 * @returns {Promise} API response
 */
export const getNotifications = async (options = {}) => {
  try {
    const { limit, skip, read } = options;
    let queryParams = new URLSearchParams();
    
    if (limit) queryParams.append('limit', limit);
    if (skip) queryParams.append('skip', skip);
    if (read !== undefined) queryParams.append('read', read);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
    
    const response = await api.get(endpoint);
    console.log(response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch notifications');
  }
};

/**
 * Get unread notification count
 * @returns {Promise} API response with count
 */
export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to fetch unread notification count');
  }
};

/**
 * Mark a notification as read
 * @param {String} notificationId - ID of the notification to mark as read
 * @returns {Promise} API response
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // Using PUT instead of PATCH to avoid CORS issues
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} API response
 */
export const markAllNotificationsAsRead = async () => {
  try {
    // Using PUT instead of PATCH to avoid CORS issues
    const response = await api.put('/notifications/read/all');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to mark all notifications as read');
  }
};

/**
 * Delete a notification
 * @param {String} notificationId - ID of the notification to delete
 * @returns {Promise} API response
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to delete notification');
  }
};

/**
 * Create a test notification (for development)
 * @param {String} type - Type of notification to create (comment, follower, vote, system)
 * @returns {Promise} API response
 */
export const createTestNotification = async (type = 'system') => {
  try {
    const response = await api.post('/notifications/test', { type });
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Failed to create test notification');
  }
}; 