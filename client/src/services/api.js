import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://dentalcareplus.up.railway.app/api'),
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only logout if the error is specifically about an invalid/expired token
      const message = error.response.data?.message;
      if (message === 'Token is not valid' || message === 'No token, authorization denied') {
        console.warn('Session expired or invalid token. Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // We don't use window.location.href here to avoid infinite loops
        // but the app should react to the missing token
      }
    }
    return Promise.reject(error);
  }
);

export default api;
