import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://dentalcareplus.up.railway.app/api',
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Platform'] = 'web';
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      const message = error.response.data?.message;
      if (message === 'Token is not valid' || message === 'No token, authorization denied') {
        console.warn('Session expired or invalid token. Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
       
        
      }
    }
    return Promise.reject(error);
  }
);

export default api;
