import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Thêm interceptor để tự động lấy token từ localStorage và thêm vào header
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isLoginApiRequest(config) {
  if (!config?.url) return false;
  const path = String(config.url).split('?')[0];
  return path === '/login' || path.endsWith('/login');
}

// Interceptor: 401 → đăng xuất và về trang login (trừ khi đang gọi API login / caller yêu cầu giữ trang)
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const cfg = error.config;
    if (status === 401 && !cfg?.skipAuthRedirect && !isLoginApiRequest(cfg)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api; 