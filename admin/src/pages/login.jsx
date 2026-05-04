import { useState } from 'react';
import api from '../services/api';

/** Lấy nội dung lỗi từ JSON API (Laravel: errors trước, rồi message). */
function getLoginErrorMessage(err) {
  const d = err.response?.data;
  if (!d) return null;
  const fieldErrors = d.errors
    ? Object.values(d.errors)
        .flat()
        .filter((x) => typeof x === 'string' && x.trim())
    : [];
  const firstField = fieldErrors[0];
  const top = typeof d.message === 'string' ? d.message.trim() : '';
  const raw = firstField || top || null;
  if (!raw) return null;
  if (/credentials are incorrect|provided credentials/i.test(raw)) {
    return 'Sai email hoặc mật khẩu.';
  }
  return raw;
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authRequestConfig = { skipAuthRedirect: true };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/login', { email, password }, authRequestConfig);
      if (res.data && res.data.status && res.data.data && res.data.data.token) {
        const userRes = await api.get('/me', {
          ...authRequestConfig,
          headers: { Authorization: `Bearer ${res.data.data.token}` }
        });
        if (userRes.data && userRes.data.status && userRes.data.data && userRes.data.data.role === 'admin') {
          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('user', JSON.stringify(userRes.data.data));
          window.location.href = '/';
        } else {
          setError('Bạn không có quyền truy cập trang admin!');
        }
      } else {
        setError(res.data?.message || 'Đăng nhập thất bại!');
      }
    } catch (err) {
      setError(getLoginErrorMessage(err) || 'Sai email hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7fa' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 340 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, fontSize: 24 }}>Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: 10, marginBottom: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }}
        />
        {error && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              color: '#b00020',
              marginBottom: 12,
              padding: '10px 12px',
              borderRadius: 8,
              background: '#ffebee',
              border: '1px solid #ffcdd2',
              fontSize: 15,
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: 12, borderRadius: 8, background: '#1a94ff', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer' }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
} 