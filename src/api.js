// Notification API functions
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
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch unread notification count');
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read/all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete notification');
  }
};

export const createTestNotification = async (type = 'system') => {
  try {
    const response = await api.post('/notifications/test', { type });
    return response.data;
  } catch (error) {
    console.error('Error creating test notification:', error);
    throw new Error(error.response?.data?.message || 'Failed to create test notification');
  }
};

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage - try both formats as seen in different apps
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      // Make sure the token is prefixed with 'Bearer ' if it's not already
      config.headers.Authorization = token.startsWith('Bearer ') 
        ? token 
        : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
); 