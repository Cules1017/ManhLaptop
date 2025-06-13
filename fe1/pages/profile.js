import { useEffect, useState } from 'react';
import Page from '../components/page';
import Title from '../components/title';
import { apiRequest } from '../utils/apiRequest';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await apiRequest('http://127.0.0.1:8000/api/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status) {
          setUser(res.data);
        } else {
          setError(res.message || 'Không lấy được thông tin user');
        }
      } catch (err) {
        setError('Lỗi kết nối server');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    await apiRequest('http://127.0.0.1:8000/api/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/user/login');
  };

  return (
    <Page>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: 32 }}>
        <Title title="Thông tin tài khoản" />
        {loading && <div>Đang tải...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && user && (
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div><b>Họ tên:</b> {user.name}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Số điện thoại:</b> {user.phone || <span style={{ color: '#bbb' }}>(Chưa cập nhật)</span>}</div>
            <div><b>Địa chỉ:</b> {user.address || <span style={{ color: '#bbb' }}>(Chưa cập nhật)</span>}</div>
            <button
              onClick={handleLogout}
              style={{
                marginTop: 18,
                padding: '12px 0',
                background: '#e53935',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(229,57,53,0.08)'
              }}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </Page>
  );
} 