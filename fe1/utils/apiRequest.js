import { showErrorPopup } from '../components/Popup';

export async function apiRequest(url, options = {}) {
  // Get token from localStorage if available
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    let data = {};
    try {
      data = await response.json();
    } catch {}
    showErrorPopup(data.message || 'Bạn cần đăng nhập để thực hiện thao tác này!');
    //CHUYỂN VỀ TRANG ĐĂNG NHẬP
    window.location.href = '/user/login';  
    throw new Error(data.message || 'Unauthorized');
  }

  if (!response.ok) {
    let data = {};
    try {
      data = await response.json();
      } catch { }
    showErrorPopup(data.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return response.json();
} 