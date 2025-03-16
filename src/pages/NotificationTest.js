import React, { useState, useEffect } from 'react';
import { createTestNotification } from '../services/notificationService';
import NotificationBell from '../components/NotificationBell';

const NotificationTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    user: null,
    token: null,
    tokenExpiration: null,
    storageKeys: [],
    currentTime: null
  });

  useEffect(() => {
    if (showDebug) {
      // Get debug information
      try {
        const user = localStorage.getItem('user');
        let parsedUser = null;
        let token = null;
        let tokenExpiration = null;
        
        if (user) {
          parsedUser = JSON.parse(user);
          // Hide sensitive parts of the user object
          if (parsedUser.data?.token) {
            token = `${parsedUser.data.token.substring(0, 15)}...`;
            
            // Try to decode the token to get expiration date
            try {
              const tokenData = JSON.parse(atob(parsedUser.data.token.split('.')[1]));
              if (tokenData.exp) {
                const expiryDate = new Date(tokenData.exp * 1000);
                tokenExpiration = {
                  expiryDate: expiryDate.toLocaleString(),
                  isExpired: expiryDate < new Date(),
                  timeLeft: Math.floor((expiryDate - new Date()) / 1000 / 60) // minutes
                };
              }
            } catch (e) {
              tokenExpiration = { error: "Could not decode token" };
            }
            
            parsedUser = {
              ...parsedUser,
              data: { ...parsedUser.data, token: token }
            };
          }
        }
        
        // Get all localStorage keys
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i));
        }
        
        setDebugInfo({
          user: parsedUser,
          token: token,
          tokenExpiration: tokenExpiration,
          storageKeys: keys,
          currentTime: new Date().toLocaleString()
        });
      } catch (err) {
        console.error('Error getting debug info:', err);
      }
    }
  }, [showDebug]);

  const handleCreateNotification = async (type) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await createTestNotification(type);
      setSuccess(`Successfully created a ${type} notification!`);
    } catch (err) {
      setError(err.message || 'Failed to create notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notification Test Page</h1>
        <NotificationBell />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Create Test Notifications</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => handleCreateNotification('comment')}
            disabled={isLoading}
          >
            Comment Notification
          </button>
          
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => handleCreateNotification('follower')}
            disabled={isLoading}
          >
            Follower Notification
          </button>
          
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => handleCreateNotification('vote')}
            disabled={isLoading}
          >
            Vote Notification
          </button>
          
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => handleCreateNotification('system')}
            disabled={isLoading}
          >
            System Notification
          </button>
        </div>
        
        {isLoading && (
          <div className="text-center mt-4">
            <p className="text-gray-600">Creating notification...</p>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Click any of the buttons above to create a test notification.</li>
          <li>The notification will appear in the bell icon in the top right.</li>
          <li>Click on the bell icon to view your notifications.</li>
          <li>Click on a notification to mark it as read.</li>
          <li>Use "Mark all as read" to clear all notifications.</li>
        </ol>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Debug Information</h2>
          <button 
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
            onClick={() => setShowDebug(!showDebug)}
          >
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
        </div>
        
        {showDebug && (
          <div className="debug-info">
            <div className="mb-4">
              <h3 className="text-lg font-medium">LocalStorage Keys:</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo.storageKeys, null, 2)}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium">User Data:</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium">Authorization Token:</h3>
              <p className="bg-gray-100 p-3 rounded">
                {debugInfo.token || "No token found"}
              </p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium">Token Expiration:</h3>
              {debugInfo.tokenExpiration ? (
                debugInfo.tokenExpiration.error ? (
                  <p className="bg-gray-100 p-3 rounded text-red-500">
                    {debugInfo.tokenExpiration.error}
                  </p>
                ) : (
                  <div className="bg-gray-100 p-3 rounded">
                    <p><strong>Expires:</strong> {debugInfo.tokenExpiration.expiryDate}</p>
                    <p><strong>Status:</strong> {debugInfo.tokenExpiration.isExpired ? 
                      <span className="text-red-600 font-bold">EXPIRED</span> : 
                      <span className="text-green-600 font-bold">VALID</span>}
                    </p>
                    {!debugInfo.tokenExpiration.isExpired && (
                      <p><strong>Time left:</strong> {debugInfo.tokenExpiration.timeLeft} minutes</p>
                    )}
                    <p><strong>Current time:</strong> {debugInfo.currentTime}</p>
                  </div>
                )
              ) : (
                <p className="bg-gray-100 p-3 rounded">No expiration information found</p>
              )}
            </div>
            
            <div className="my-4">
              <h3 className="text-lg font-medium">Troubleshooting Steps:</h3>
              <ol className="list-decimal pl-6 space-y-2 mt-2">
                <li>Verify that user data is present in localStorage</li>
                <li>Check that the token is included in the user data</li>
                <li>Make sure the token is properly formatted (starts with "Bearer ")</li>
                <li><strong>Token Expiration: </strong>
                  {debugInfo.tokenExpiration?.isExpired ? 
                    <span className="text-red-600 font-bold">YOUR TOKEN IS EXPIRED! Please log out and log in again to refresh your token.</span> :
                    <span>If your token is expired, log out and log in again to refresh it</span>
                  }
                </li>
                <li>Check if server and client system clocks are in sync (server time might be different)</li>
                <li><strong>CORS Issues:</strong> If you see "Network Error" messages, verify the server's CORS settings allow the appropriate methods (GET, POST, PUT, DELETE, PATCH)</li>
                <li>Restart the server after updating CORS configuration</li>
                <li>Ensure that both frontend and backend are running (check ports 3000 and 5001)</li>
              </ol>
            </div>
            
            {debugInfo.tokenExpiration?.isExpired && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <h3 className="font-bold">Token Expired Action Required</h3>
                <p className="mt-2">Your authentication token has expired. To resolve this issue:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Click the logout button in the navigation bar</li>
                  <li>Log in again with your credentials</li>
                  <li>Return to this page to continue testing</li>
                </ol>
                <button 
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                  onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                >
                  Logout Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationTest; 