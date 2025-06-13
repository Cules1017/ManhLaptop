import { useState } from 'react';
import { useRouter } from 'next/router';
import PageContainer from '../../components/page-container';
import Link from 'next/link';
import { getErrorMessage } from '../../lib/form';

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

  async function handleSubmit(e) {
    e.preventDefault();
    setMsgError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.data.token);
      // Lưu thông tin user vào localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // Chuyển hướng về trang chủ
      router.push('/');
    } catch (error) {
      setMsgError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer title="MANH STORE - Login">
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <h3 className="formTitle">login</h3>

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
              placeholder="Password"
              onChange={(value) => setPassword(value)}
              value={password}
            />

            <Button type="submit" title="Login" disabled={loading} />
          </InputContainer>
        </form>

        <Link href="/user/signup">
          <a className="switchForm">I do not have a account</a>
        </Link>
        <Link href="/user/resetpassword">
          <a className="switchForm">I forgot my password</a>
        </Link>
      </FormContainer>

      <style jsx>{`
        form {
          width: 100%;
          align-items: center;
        }
        form .formTitle {
          text-align: center;
          font-size: 38px;
          font-weight: 1000;
          letter-spacing: 1.65px;
          color: #b2b2b2;
          text-transform: uppercase;
          margin-bottom: 84px;
        }
        .switchForm {
          color: #b2b2b2;
          margin-top: 12px;
          font-weight: 500;
        }
      `}</style>
    </PageContainer>
  );
}
