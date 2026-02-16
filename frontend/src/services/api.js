import axios from 'axios';

// Use environment variable for API URL with fallback
const getApiUrl = () => {
  // For production (Vercel/Netlify)
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://flash-taxi-backend.onrender.com/api';
  }
  // For development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

console.log('🌐 API URL:', API_URL); // Helpful for debugging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Request:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('❌ Response error:', error.response.status, error.response.data);
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response:', error.request);
    } else {
      // Something else happened
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;