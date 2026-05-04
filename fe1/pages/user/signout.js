import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiRequest } from '../../utils/apiRequest';
import { useCart } from '../../context/CartContext';

function SignOut() {
  const router = useRouter();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    const logout = async () => {
      try {
        await apiRequest('http://127.0.0.1:8000/api/logout', { method: 'POST' });
      } catch {
        // Bỏ qua lỗi server, vẫn đăng xuất phía client
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
      }
      await refreshCartCount?.();
      router.replace('/user/login');
    };
    logout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang đăng xuất...</p>
  );
}

export default SignOut;
