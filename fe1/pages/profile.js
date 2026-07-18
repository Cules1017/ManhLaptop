import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Page from '../components/page';
import Title from '../components/title';
import { apiRequest } from '../utils/apiRequest';
import { useCart } from '../context/CartContext';

const API_URL = 'http://127.0.0.1:8000/api';

function parseAddressValue(rawAddress = '') {
  const value = String(rawAddress || '').trim();
  if (!value) {
    return { addressDetail: '', district: '', city: '' };
  }

  const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
  const city = parts[parts.length - 1] || '';
  const district = parts[parts.length - 2] || '';
  const addressDetail = parts.slice(0, Math.max(parts.length - 2, 1)).join(', ');

  return {
    addressDetail: addressDetail || value,
    district,
    city,
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', addressDetail: '', district: '', city: '' });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { refreshCartCount } = useCart();

  const loadDistrictsByCity = async (cityName, preferredDistrict = '', provinceList = provinces) => {
    const province = provinceList.find((p) => p.name === cityName);
    if (!province?.code) {
      setDistricts([]);
      setForm((prev) => ({ ...prev, district: '' }));
      return;
    }

    try {
      const res = await apiRequest(`${API_URL}/locations/provinces/${province.code}/districts`);
      const districtList = Array.isArray(res?.data) ? res.data : [];
      setDistricts(districtList);
      const hasPreferred = districtList.some((d) => d.name === preferredDistrict);
      setForm((prev) => ({
        ...prev,
        district: hasPreferred ? preferredDistrict : districtList[0]?.name || '',
      }));
    } catch {
      setDistricts([]);
      setForm((prev) => ({ ...prev, district: '' }));
    }
  };

  const loadProvinces = async (preferredCity = '', preferredDistrict = '') => {
    try {
      const res = await apiRequest(`${API_URL}/locations/provinces`);
      const provinceList = Array.isArray(res?.data) ? res.data : [];
      setProvinces(provinceList);
      if (!provinceList.length) {
        setDistricts([]);
        return;
      }

      const selectedCity = provinceList.some((p) => p.name === preferredCity)
        ? preferredCity
        : provinceList[0].name;
      setForm((prev) => ({ ...prev, city: selectedCity }));
      await loadDistrictsByCity(selectedCity, preferredDistrict, provinceList);
    } catch {
      setProvinces([]);
      setDistricts([]);
    }
  };

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
          const parsedAddress = parseAddressValue(res.data.address || '');
          setForm({
            name: res.data.name || '',
            phone: res.data.phone || '',
            addressDetail: parsedAddress.addressDetail,
            district: parsedAddress.district,
            city: parsedAddress.city,
          });
          await loadProvinces(parsedAddress.city, parsedAddress.district);
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
          address: [form.addressDetail.trim(), form.district, form.city].filter(Boolean).join(', '),
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
          <div className="ecommerce-card profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 18, color: 'var(--text-main)' }}>Thông tin cá nhân</strong>
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
                      const parsedAddress = parseAddressValue(user.address || '');
                      setForm({
                        name: user.name || '',
                        phone: user.phone || '',
                        addressDetail: parsedAddress.addressDetail,
                        district: parsedAddress.district,
                        city: parsedAddress.city,
                      });
                      loadProvinces(parsedAddress.city, parsedAddress.district);
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
              <div className="val text-muted">
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
                  {user.phone || <span className="text-muted">(Chưa cập nhật)</span>}
                </div>
              )}
            </div>

            <div className="field">
              <label>Địa chỉ</label>
              {editing ? (
                <>
                  <input
                    type="text"
                    value={form.addressDetail}
                    onChange={(e) => handleChange('addressDetail', e.target.value)}
                    placeholder="Số nhà, tên đường..."
                  />
                  <div className="address-grid">
                    <select
                      value={form.city}
                      onChange={(e) => {
                        const nextCity = e.target.value;
                        setForm((prev) => ({ ...prev, city: nextCity, district: '' }));
                        loadDistrictsByCity(nextCity, '', provinces);
                      }}
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      disabled={!form.city || !districts.length}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="val">
                  {user.address || <span className="text-muted">(Chưa cập nhật)</span>}
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
        .profile-card {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 640px) {
          .profile-card {
            padding: 20px;
          }
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field input,
        .field select {
          padding: 12px 14px;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-sm);
          font-size: 15px;
          color: var(--text-main);
          outline: none;
          background: var(--surface);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .field input:focus,
        .field select:focus {
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .address-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .address-grid {
            grid-template-columns: 1fr;
          }
        }
        .field .val {
          padding: 6px 0;
          font-size: 16px;
          color: var(--text-main);
          font-weight: 500;
        }
        .text-muted {
          color: var(--text-muted) !important;
          font-weight: 400 !important;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all var(--transition-fast);
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary {
          background: var(--secondary);
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .btn-secondary {
          background: var(--bg-color);
          color: var(--text-main);
          border: 1px solid var(--surface-border);
        }
        .btn-secondary:hover {
          background: var(--surface-hover);
        }
        .btn-cancel {
          background: transparent;
          color: var(--text-muted);
        }
        .btn-cancel:hover {
          color: var(--text-main);
          background: var(--surface-hover);
        }
        .btn-danger {
          background: transparent;
          color: var(--danger);
          border: 1px solid var(--danger);
          margin-top: 16px;
        }
        .btn-danger:hover {
          background: var(--danger);
          color: white;
        }
      `}</style>
    </Page>
  );
}
