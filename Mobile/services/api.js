import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const BASE_URL = 'https://dentalcareplus.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
});


const AUTH_TOKEN_KEY = '@dentalcare:auth_token';
const USER_DATA_KEY = '@dentalcare:user_data';
const LOGIN_TIMESTAMP_KEY = '@dentalcare:login_timestamp';


const SESSION_EXPIRY_DAYS = 7;
const SESSION_EXPIRY_MS = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;


let authToken = null;
let userData = null;


export const initializeAuth = async () => {
  try {
    const [token, user, timestampStr] = await Promise.all([
      AsyncStorage.getItem(AUTH_TOKEN_KEY),
      AsyncStorage.getItem(USER_DATA_KEY),
      AsyncStorage.getItem(LOGIN_TIMESTAMP_KEY),
    ]);

    if (token && user && timestampStr) {
      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();

      
      if (now - timestamp > SESSION_EXPIRY_MS) {
        await clearAuth();
        return false;
      }

      authToken = token;
      userData = JSON.parse(user);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    await clearAuth();
    return false;
  }
};

export const setAuthToken = async (token) => {
  authToken = token;
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

export const setUserInfo = async (user) => {
  userData = user;
  try {
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to save user info:', error);
  }
};

export const getUserInfo = () => userData;

export const clearAuth = async () => {
  authToken = null;
  userData = null;
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_DATA_KEY, LOGIN_TIMESTAMP_KEY]);
  } catch (error) {
    console.error('Failed to clear auth:', error);
  }
};

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    config.headers['X-Platform'] = 'mobile';
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    
    if (error.response?.status === 401) {
      await clearAuth();
    }
    
    return Promise.reject(error);
  }
);

export default api;
