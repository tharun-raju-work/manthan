import axios from 'axios';

const api = axios.create({
  baseURL: 'https://manthan-final-oa9p-8unwdqlni-rahultharun2024-gmailcoms-projects.vercel.app/api/v1', // Add default baseURL
  headers: {
    'Content-Type': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
  }
});

let authContext = null;

export const setAuthContext = (context) => {
  authContext = context;
};

// Add request interceptor for auth token
api.interceptors.request.use(
  config => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.data?.token) {
      config.headers.Authorization = `Bearer ${user.data.token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh');
        const { data } = response.data;
        
        if (data?.token) {
          // Update local storage with new token
          const user = JSON.parse(localStorage.getItem('user'));
          const updatedUser = {
            ...user,
            data: {
              ...user.data,
              token: data.token
            }
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update the failed request's authorization header
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        if (authContext) {
          authContext.logout();
        } else {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Function to get the API URL with better error handling
export const initializeApi = async () => {
  const ports = [5001];
  const errors = [];
  
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}/api/v1/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        api.defaults.baseURL = `http://localhost:${port}/api/v1`;
        return;
      }
    } catch (error) {
      errors.push(`Port ${port}: ${error.message}`);
      continue;
    }
  }
  console.error('Connection errors:', errors);
  throw new Error('Backend server not found on any port');
};



export const fetchTestData = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'An error occurred');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Log the response for debugging
    console.log('Login API response:', response);

    // Check for nested data structure
    if (!response.data?.success || !response.data?.data?.token) {
      throw new Error('Invalid response from server');
    }

    // Return just the data object
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// Update the fetchPosts function with better error handling
export const fetchPosts = async () => {
  try {
    const response = await api.get('/posts');
    return response.data;

  } catch (error) {
    if (error.response?.status === 404) {
      // Return empty array if posts endpoint doesn't exist yet
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch posts');
  }
};

// Update other API functions with proper error handling
export const votePost = async (postId, direction) => {
  try {
    const response = await api.post(`/posts/${postId}/vote`, { direction });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to vote on post');
  }
};

export const likePost = async (postId, liked) => {
  try {
    const response = await api.post(`/posts/${postId}/like`, { liked });
    // console.log('Like post API response:', api.getUri());
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to like post');
  }
};

export const sharePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/share`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to share post');
  }
};

export const addComment = async (postId, content) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Please login to add a comment');
    }
    throw new Error(error.response?.data?.message || 'Failed to add comment');
  }
};

export const likeComment = async (postId, commentId) => {
  try {
    const response = await api.post(`/posts/${postId}/comments/${commentId}/like`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to like comment');
  }
};

export const createPost = async (formData) => {
  try {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create post');
  }
};

export const getUserProfile = async (username) => {
  try {
    const endpoint = username ? `/users/profile/${username}` : '/users/profile';
    const response = await api.get(endpoint);
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

export const updateUserProfile = async (formData) => {
  try {
    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

export const getTopContributors = async () => {
  try {
    const response = await api.get('/users/top-contributors');
    return response.data.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch top contributors';
  }
};

// Initialize auth context in your App component
// export const initializeApi = (context) => {
//   setAuthContext(context);
//   api.defaults.baseURL = 'http://localhost:5000/api/v1';
// };

export default api; 