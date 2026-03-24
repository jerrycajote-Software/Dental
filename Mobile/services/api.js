import axios from 'axios';

// Replace with your computer's local IP address for USB/WiFi testing
// e.g., 'http://192.168.1.XX:5000/api'
const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
