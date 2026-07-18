import { useState } from 'react';
import { useRouter } from 'next/router';
import PageContainer from '../../components/page-container';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { apiRequest } from '../../utils/apiRequest';
import { useCart } from '../../context/CartContext';

import AlertError from '../../components/alerts/error';
import Button from '../../components/form/button';
import Input from '../../components/form/input';
import InputContainer from '../../components/form/InputContainer';
import FormContainer from '../../components/form/formContainer';

const API_URL = 'http://127.0.0.1:8000/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msgError, setMsgError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { refreshCartCount } = useCart();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsgError('');

    const emailTrim = email.trim();
    const passTrim = password.trim();
    if (!emailTrim || !passTrim) {
      setMsgError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(emailTrim)) {
      setMsgError('Email không đúng định dạng');
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, password: passTrim }),
        silent: true,
      });

      if (!data || !data.status) {
        throw new Error(data?.message || 'Đăng nhập thất bại');
      }

      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      window.dispatchEvent(new Event('storage'));

      await refreshCartCount?.();
      toast.success('Đăng nhập thành công', { position: 'top-center', autoClose: 1500 });

      const redirect = router.query?.redirect;
      router.push(typeof redirect === 'string' && redirect ? redirect : '/');
    } catch (error) {
      setMsgError(error?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="MANH STORE - Đăng nhập">
      <FormContainer>
        <form className="auth-card" onSubmit={handleSubmit}>
          <h3 className="formTitle">Đăng nhập</h3>

          {msgError && <AlertError message={msgError} />}

          <InputContainer>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              onChange={(value) => setEmail(value)}
              value={email}
            />
            <Input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              onChange={(value) => setPassword(value)}
              value={password}
            />

            <Button type="submit" title={loading ? 'Đang đăng nhập...' : 'Đăng nhập'} disabled={loading} />
          </InputContainer>
        </form>

        <Link href="/user/signup">
          <a className="switchForm">Tạo tài khoản mới</a>
        </Link>
        <Link href="/user/resetpassword">
          <a className="switchForm">Quên mật khẩu?</a>
        </Link>
      </FormContainer>

      <style jsx>{`
        .auth-card {
          width: 100%;
          max-width: 440px;
          background: var(--surface);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 40px;
          box-sizing: border-box;
        }
        form .formTitle {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 32px;
          margin-top: 0;
        }
        .switchForm {
          color: var(--text-muted);
          margin-top: 16px;
          font-size: 14px;
          font-weight: 500;
          transition: color var(--transition-fast);
        }
        .switchForm:hover {
          color: var(--secondary);
        }
        @media (max-width: 640px) {
          .auth-card {
            padding: 24px;
            margin-top: 20px;
            width: 90%;
          }
        }
      `}</style>
    </PageContainer>
  );
}
