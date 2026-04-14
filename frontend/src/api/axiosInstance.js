import axios from 'axios';

const isLocalHost = () => {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
};

const isLocalApiUrl = (url) => /(^|\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(\/|$)/.test(url);

const resolveApiBaseUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_URL?.trim();

  if (configuredUrl) {
    const normalizedUrl = configuredUrl.replace(/\/$/, '');

    if (isLocalHost() || !isLocalApiUrl(normalizedUrl)) {
      return `${normalizedUrl}/api`;
    }
  }

  if (isLocalHost()) {
    return 'http://localhost:5000/api';
  }

  return '/api';
};

const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.replace(/^\/api/, '');
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(localStorage.getItem('token'));
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;