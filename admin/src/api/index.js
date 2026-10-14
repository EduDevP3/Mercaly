import axios from 'axios';

const apiBaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || process.env.REACT_APP_API_URL || 'http://localhost:82/api/v1';

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // This is important for sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones para inyectar token JWT y header de tenant
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const storeSlug = localStorage.getItem('storeSlug');
  if (storeSlug) {
    config.headers['x-tenant-slug'] = storeSlug;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;

