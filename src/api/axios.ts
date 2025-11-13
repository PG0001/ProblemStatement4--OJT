// api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7022/api', // or your backend URL
});

// Add request interceptor for JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Add response interceptor (optional)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401&&
      window.location.pathname !== '/login') {
      // Handle unauthorized: auto logout or redirect to login
      window.location.href = '/login'; // Adjust your route as needed
    }
    return Promise.reject(error);
  }
);

export default api;
