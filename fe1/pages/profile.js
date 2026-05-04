import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Page from '../components/page';
import Title from '../components/title';
import { apiRequest } from '../utils/apiRequest';
import { useCart } from '../context/CartContext';

const API_URL = 'http://127.0.0.1:8000/api';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    const fetchUser = async () => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/user/login?redirect=/profile');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`${API_URL}/me`);
        if (res.status) {
          setUser(res.data);
          setForm({
            name: res.data.name || '',
            phone: res.data.phone || '',
            address: res.data.address || '',
          });
        } else {
          setError(res.message || 'Không lấy được thông tin tài khoản');
        }
      } catch {
        setError('Không thể kết nối tới máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.warn('Vui lòng nhập họ tên', { position: 'top-center' });
      return;
    }
    setSaving(true);
    try {
      const res = await apiRequest(`${API_URL}/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        }),
      });
      if (res?.status) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        window.dispatchEvent(new Event('storage'));
        toast.success('Cập nhật thông tin thành công', { position: 'top-center' });
        setEditing(false);
      }
    } catch {
      // apiRequest đã popup lỗi
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Bạn có chắc muốn đăng xuất?')) return;
    try {
      await apiRequest(`${API_URL}/logout`, { method: 'POST', silent: true });
    } catch {
      // bỏ qua lỗi server khi logout
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    await refreshCartCount?.();
    toast.info('Đã đăng xuất', { position: 'top-center', autoClose: 1500 });
    router.push('/user/login');
  };

  return (
    <Page>
      <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
        <Title title="Thông tin tài khoản" />
        {loading && <div style={{ textAlign: 'center', padding: 24 }}>Đang tải...</div>}
        {error && (
          <div style={{ color: '#e53935', textAlign: 'center', padding: 16 }}>{error}</div>
        )}
        {!loading && !error && user && (
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 18 }}>Thông tin cá nhân</strong>
              {!editing ? (
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                  Chỉnh sửa
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-cancel"
                    onClick={() => {
                      setEditing(false);
                      setForm({
                        name: user.name || '',
                        phone: user.phone || '',
                        address: user.address || '',
                      });
                    }}
                  >
                    Huỷ
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>

            <div className="field">
              <label>Họ tên</label>
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              ) : (
                <div className="val">{user.name}</div>
              )}
            </div>

            <div className="field">
              <label>Email</label>
              <div className="val" style={{ color: '#888' }}>
                {user.email}
              </div>
            </div>

            <div className="field">
              <label>Số điện thoại</label>
              {editing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              ) : (
                <div className="val">
                  {user.phone || <span style={{ color: '#bbb' }}>(Chưa cập nhật)</span>}
                </div>
              )}
            </div>

            <div className="field">
              <label>Địa chỉ</label>
              {editing ? (
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              ) : (
                <div className="val">
                  {user.address || <span style={{ color: '#bbb' }}>(Chưa cập nhật)</span>}
                </div>
              )}
            </div>

            <button className="btn btn-danger" onClick={handleLogout} style={{ marginTop: 12 }}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-size: 13px;
          color: #666;
          font-weight: 600;
        }
        .field input {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
        }
        .field input:focus {
          border-color: #e53935;
        }
        .field .val {
          padding: 4px 0;
          font-size: 15px;
          color: #333;
        }
        .btn {
          padding: 10px 18px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: opacity 0.2s;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary {
          background: #1976d2;
          color: #fff;
        }
        .btn-secondary {
          background: #f5f5f5;
          color: #333;
        }
        .btn-cancel {
          background: #eee;
          color: #555;
        }
        .btn-danger {
          background: #e53935;
          color: #fff;
        }
      `}</style>
    </Page>
  );
}
