import { showErrorPopup } from '../components/Popup';

const AUTH_FREE_PATHS = ['/user/login', '/user/signup', '/user/resetpassword'];

export async function apiRequest(url, options = {}) {
  const { silent = false, ...fetchOptions } = options;

  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  const headers = {
    Accept: 'application/json',
    ...(fetchOptions.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  });

  const parseBody = async () => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  if (response.status === 401) {
    const data = await parseBody();
    const message = data.message || 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
    if (!silent) showErrorPopup(message);

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname || '';
      const isOnAuthPage = AUTH_FREE_PATHS.some((p) => currentPath.startsWith(p));
      if (!isOnAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        const redirect = encodeURIComponent(currentPath);
        window.location.href = `/user/login?redirect=${redirect}`;
      }
    }
    throw new Error(message);
  }

  if (!response.ok) {
    const data = await parseBody();
    const message = data.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
    if (!silent) showErrorPopup(message);
    const err = new Error(message);
    err.data = data;
    throw err;
  }

  return response.json();
}
