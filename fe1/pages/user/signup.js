import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PageContainer from '../../components/page-container';
import { toast } from 'react-toastify';
import { apiRequest } from '../../utils/apiRequest';
import { useCart } from '../../context/CartContext';

import AlertError from '../../components/alerts/error';
import Button from '../../components/form/button';
import Input from '../../components/form/input';
import InputContainer from '../../components/form/InputContainer';
import FormContainer from '../../components/form/formContainer';

const API_URL = 'http://127.0.0.1:8000/api';

export default function SignUp() {
  const router = useRouter();
  const { refreshCartCount } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const { name, email, phone, password, password_confirmation } = formData;
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !password_confirmation) {
      return 'Vui lòng nhập đầy đủ thông tin';
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) return 'Email không đúng định dạng';

    const phoneRe = /^[0-9+\-\s]{8,15}$/;
    if (!phoneRe.test(phone.trim())) return 'Số điện thoại không hợp lệ';

    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (password !== password_confirmation) return 'Mật khẩu nhập lại không khớp';

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
        silent: true,
      });

      if (!data || !data.status) {
        throw new Error(data?.message || 'Đăng ký thất bại');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.dispatchEvent(new Event('storage'));

      await refreshCartCount?.();
      toast.success('Đăng ký thành công', { position: 'top-center', autoClose: 1500 });
      router.push('/');
    } catch (err) {
      setError(err?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <PageContainer title="MANH STORE - Đăng ký">
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <h3 className="formTitle">Đăng ký</h3>

          {error && <AlertError message={error} />}
          <InputContainer>
            <Input
              type="text"
              name="name"
              placeholder="Họ và tên"
              onChange={(value) => handleChange('name', value)}
              value={formData.name}
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              onChange={(value) => handleChange('email', value)}
              value={formData.email}
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Số điện thoại"
              onChange={(value) => handleChange('phone', value)}
              value={formData.phone}
            />
            <Input
              type="password"
              name="password"
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              onChange={(value) => handleChange('password', value)}
              value={formData.password}
            />
            <Input
              type="password"
              name="password_confirmation"
              placeholder="Nhập lại mật khẩu"
              onChange={(value) => handleChange('password_confirmation', value)}
              value={formData.password_confirmation}
            />

            <Button type="submit" title={loading ? 'Đang đăng ký...' : 'Đăng ký'} disabled={loading} />
          </InputContainer>
        </form>

        <Link href="/user/login">
          <a className="switchForm">Tôi đã có tài khoản</a>
        </Link>
      </FormContainer>

      <style jsx>{`
        form {
          width: 100%;
          align-items: center;
        }
        form .formTitle {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #333;
          text-transform: uppercase;
          margin-bottom: 48px;
        }
        .switchForm {
          color: #555;
          margin-top: 12px;
          font-weight: 500;
        }
        .switchForm:hover {
          color: #e53935;
        }
      `}</style>
    </PageContainer>
  );
}
