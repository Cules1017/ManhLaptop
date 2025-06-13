import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { apiRequest } from '../../utils/apiRequest';

function SignOut() {
  const client = useApolloClient();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await apiRequest('http://127.0.0.1:8000/api/logout', { method: 'POST' });
      } catch (err) {
        // Có thể bỏ qua lỗi này, vẫn tiếp tục xóa token và reset cache
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
      }
      await client.clearStore();
      router.replace('/user/login');
    };
    logout();
  }, [client, router]);

  return <p>Signing out...</p>;
}

export default SignOut;
