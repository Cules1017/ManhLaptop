import { useEffect, useState } from 'react';
import api from '../services/api';

const API_URL = 'http://127.0.0.1:8000/api';

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', discount: '', quantity: '', category_id: '', image: ''
  });
  const [categories, setCategories] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [imageType, setImageType] = useState('link'); // 'link' hoặc 'file'
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.data.data || res.data.data); // paginate hoặc array
    } catch (err) {
      setError('Không lấy được danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
    } catch {}
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = product => {
    setEditing(product.id);
    setForm({ ...product });
    setImageType('link');
    setImageFile(null);
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', discount: '', quantity: '', category_id: '', image: '' });
    setImageType('link');
    setImageFile(null);
  };

  const handleDelete = async id => {
    if (!window.confirm('Xoá sản phẩm này?')) return;
    await api.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProducts();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    let data;
    if (imageType === 'file' && imageFile) {
      data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'image') {
          data.append(k, v);
        }
      });
      data.append('image_file', imageFile);
    } else {
      data = { ...form };
    }

    if (editing) {
      if (imageType === 'file' && imageFile) {
        await api.post(`/products/${editing}?_method=PUT`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.put(`/products/${editing}`, data);
      }
    } else {
      if (imageType === 'file' && imageFile) {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products', data);
      }
    }
    handleCancel();
    fetchProducts();
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Quản lý sản phẩm</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32, background: '#f7f7fa', padding: 20, borderRadius: 10 }}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Tên sản phẩm" required style={{ flex: 1, minWidth: 180, padding: 8 }} />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Giá" type="number" required style={{ width: 120, padding: 8 }} />
        <input name="discount" value={form.discount} onChange={handleChange} placeholder="Giảm giá (%)" type="number" style={{ width: 120, padding: 8 }} />
        <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="Số lượng" type="number" required style={{ width: 120, padding: 8 }} />
        <select name="category_id" value={form.category_id} onChange={handleChange} required style={{ width: 180, padding: 8 }}>
          <option value="">Chọn danh mục</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label>
            <input
              type="radio"
              checked={imageType === 'link'}
              onChange={() => setImageType('link')}
            /> Nhập link ảnh
          </label>
          <label>
            <input
              type="radio"
              checked={imageType === 'file'}
              onChange={() => setImageType('file')}
            /> Upload file ảnh
          </label>
        </div>
        {imageType === 'link' ? (
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Link ảnh"
            required={imageType === 'link'}
            style={{ flex: 2, minWidth: 220, padding: 8 }}
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files[0])}
            required={imageType === 'file'}
            style={{ flex: 2, minWidth: 220, padding: 8 }}
          />
        )}
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Mô tả" required style={{ flex: 2, minWidth: 220, padding: 8 }} />
        <button type="submit" style={{ padding: '10px 32px', background: '#1a94ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16 }}>{editing ? 'Cập nhật' : 'Thêm mới'}</button>
        {editing && <button type="button" onClick={handleCancel} style={{ padding: '10px 24px', background: '#eee', color: '#222', border: 'none', borderRadius: 8, fontWeight: 500 }}>Huỷ</button>}
      </form>
      {loading ? <div>Đang tải...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <table style={{ width: '100%', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <thead style={{ background: '#f0f4f8' }}>
            <tr>
              <th style={{ padding: 10 }}>ID</th>
              <th style={{ padding: 10 }}>Tên</th>
              <th style={{ padding: 10 }}>Giá</th>
              <th style={{ padding: 10 }}>Giảm giá</th>
              <th style={{ padding: 10 }}>Số lượng</th>
              <th style={{ padding: 10 }}>Danh mục</th>
              <th style={{ padding: 10 }}>Ảnh</th>
              <th style={{ padding: 10 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ padding: 8 }}>{p.id}</td>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>{parseInt(p.price).toLocaleString()}₫</td>
                <td style={{ padding: 8 }}>{p.discount || 0}%</td>
                <td style={{ padding: 8 }}>{p.quantity}</td>
                <td style={{ padding: 8 }}>{p.category?.name || p.category_id}</td>
                <td style={{ padding: 8 }}><img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#fafafa' }} /></td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleEdit(p)} style={{ marginRight: 8, padding: '6px 14px', background: '#1a94ff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500 }}>Sửa</button>
                  <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 14px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 500 }}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 