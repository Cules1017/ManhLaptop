import { useState } from 'react';
import PageContainer from '../components/page-container';
import Header from '../components/header';
import Footer from '../components/footer';
import { toast } from 'react-toastify';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message || (!formData.email && !formData.phone)) {
      toast.error('Vui lòng điền tên, lời nhắn và (email hoặc số điện thoại)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const response = await res.json();
      if (response.status) {
        toast.success(response.message || 'Gửi liên hệ thành công!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi tin nhắn lúc này');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Liên hệ - MANH STORE">
      <Header />
      <div className="contact-page container" style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>Liên hệ với chúng tôi</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Bạn có thắc mắc hoặc cần hỗ trợ? Vui lòng để lại lời nhắn, chúng tôi sẽ phản hồi sớm nhất có thể.
        </p>

        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Họ và tên *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }} 
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }} 
                placeholder="Nhập email..."
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Số điện thoại</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }} 
                placeholder="Nhập số điện thoại..."
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Lời nhắn *</label>
            <textarea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              required
              rows={5}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', resize: 'vertical' }} 
              placeholder="Nhập lời nhắn của bạn..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '14px', 
              background: '#e30019', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Đang gửi...' : 'Gửi lời nhắn'}
          </button>
        </form>
      </div>
      <Footer />
    </PageContainer>
  );
}
