import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
      setError(null);
    } catch (err) {
      setError('Không lấy được danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = category => {
    setEditing(category.id);
    setForm({ name: category.name });
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: '' });
    setSuccessMessage('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setSuccessMessage('Xóa danh mục thành công!');
      fetchCategories();
    } catch (err) {
      setError('Không thể xóa danh mục này');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/categories/${editing}`, form);
        setSuccessMessage('Cập nhật danh mục thành công!');
      } else {
        await api.post('/categories', form);
        setSuccessMessage('Thêm danh mục thành công!');
      }
      handleCancel();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Quản lý danh mục</h2>
      
      {/* Form thêm/sửa */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, marginBottom: 32, background: '#f7f7fa', padding: 20, borderRadius: 10 }}>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Tên danh mục" 
          required 
          style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 16 }} 
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px 32px', 
            background: '#1a94ff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            fontWeight: 600, 
            fontSize: 16,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.target.style.background = '#0070e0'}
          onMouseOut={e => e.target.style.background = '#1a94ff'}
        >
          {editing ? 'Cập nhật' : 'Thêm mới'}
        </button>
        {editing && (
          <button 
            type="button" 
            onClick={handleCancel} 
            style={{ 
              padding: '12px 24px', 
              background: '#eee', 
              color: '#222', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.target.style.background = '#ddd'}
            onMouseOut={e => e.target.style.background = '#eee'}
          >
            Huỷ
          </button>
        )}
      </form>

      {/* Thông báo */}
      {successMessage && (
        <div style={{ 
          padding: '12px 20px', 
          background: '#e8f5e9', 
          color: '#2e7d32', 
          borderRadius: 8, 
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {successMessage}
          <button 
            onClick={() => setSuccessMessage('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#2e7d32', 
              cursor: 'pointer',
              fontSize: 20
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Tìm kiếm */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 16
          }}
        />
      </div>

      {/* Bảng danh sách */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>Đang tải...</div>
      ) : error ? (
        <div style={{ color: 'red', padding: 20, background: '#ffebee', borderRadius: 8 }}>{error}</div>
      ) : (
        <div style={{ 
          background: '#fff', 
          borderRadius: 10, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f0f4f8' }}>
              <tr>
                <th style={{ padding: 16, textAlign: 'left' }}>ID</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Tên danh mục</th>
                <th style={{ padding: 16, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(c => (
                <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: 16 }}>{c.id}</td>
                  <td style={{ padding: 16 }}>{c.name}</td>
                  <td style={{ padding: 16, textAlign: 'right' }}>
                    <button 
                      onClick={() => handleEdit(c)} 
                      style={{ 
                        marginRight: 8, 
                        padding: '8px 16px', 
                        background: '#1a94ff', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.target.style.background = '#0070e0'}
                      onMouseOut={e => e.target.style.background = '#1a94ff'}
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)} 
                      style={{ 
                        padding: '8px 16px', 
                        background: '#e53935', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: 6, 
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.target.style.background = '#d32f2f'}
                      onMouseOut={e => e.target.style.background = '#e53935'}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCategories.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              Không tìm thấy danh mục nào
            </div>
          )}
        </div>
      )}
    </div>
  );
} 