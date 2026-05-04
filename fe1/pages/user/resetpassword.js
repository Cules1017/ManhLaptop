import { useState } from 'react';
import PageContainer from '../../components/page-container';
import Link from 'next/link';

import Button from '../../components/form/button';
import Input from '../../components/form/input';
import InputContainer from '../../components/form/InputContainer';
import FormContainer from '../../components/form/formContainer';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Vui lòng nhập email của bạn.');
      return;
    }
    // Backend chưa hỗ trợ reset password qua email; thông báo rõ cho người dùng
    setMessage(
      'Chức năng đặt lại mật khẩu qua email hiện chưa được mở. Vui lòng liên hệ bộ phận hỗ trợ qua hotline 0123 456 789 để được trợ giúp.'
    );
  }

  return (
    <PageContainer title="MANH STORE - Quên mật khẩu">
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <h3 className="formTitle">Quên mật khẩu</h3>

          {message && (
            <div
              style={{
                color: '#1976d2',
                background: '#e3f2fd',
                padding: '12px 16px',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              {message}
            </div>
          )}

          <InputContainer>
            <Input
              type="email"
              name="email"
              placeholder="Email đã đăng ký"
              onChange={(value) => setEmail(value)}
              value={email}
            />

            <Button type="submit" title="Gửi yêu cầu" />
          </InputContainer>
        </form>

        <Link href="/user/login">
          <a className="switchForm">Quay lại đăng nhập</a>
        </Link>
        <Link href="/user/signup">
          <a className="switchForm">Tôi chưa có tài khoản</a>
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
