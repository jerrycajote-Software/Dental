import axios from 'axios';

// Production backend deployed on Railway
const BASE_URL = 'https://dentalcareplus.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Simple in-memory token storage for now as AsyncStorage is not installed
let authToken = null;
let userData = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const setUserInfo = (user) => {
  userData = user;
};

export const getUserInfo = () => userData;

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
