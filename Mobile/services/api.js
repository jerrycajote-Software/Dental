import axios from 'axios';

// Use your computer's local IP address for physical device testing
// For Android Emulator: http://10.0.2.2:5000/api
// For iOS Simulator: http://localhost:5000/api
// Detected Local IP: 192.168.1.54
const BASE_URL = 'http://192.168.1.54:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Simple in-memory token storage for now as AsyncStorage is not installed
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
