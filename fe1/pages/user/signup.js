import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import PageContainer from '../../components/page-container';
import { getErrorMessage } from '../../lib/form';

import AlertError from '../../components/alerts/error';
import Button from '../../components/form/button';
import Input from '../../components/form/input';
import InputContainer from '../../components/form/InputContainer';
import FormContainer from '../../components/form/formContainer';

const API_URL = 'http://127.0.0.1:8000/api';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.data.token);
      // Lưu thông tin user vào localStorage
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // Chuyển hướng về trang chủ
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <PageContainer title="MANH STORE - Sign Up">
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <h3 className="formTitle">sign up</h3>

          {error && <AlertError message={error} />}
          <InputContainer>
            <Input
              type="text"
              name="name"
              placeholder="Name"
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
              placeholder="Phone Number"
              onChange={(value) => handleChange('phone', value)}
              value={formData.phone}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              onChange={(value) => handleChange('password', value)}
              value={formData.password}
            />
            <Input
              type="password"
              name="password_confirmation"
              placeholder="Repeat Password"
              onChange={(value) => handleChange('password_confirmation', value)}
              value={formData.password_confirmation}
            />

            <Button type="submit" title="Sign Up" disabled={loading} />
          </InputContainer>
        </form>

        <Link href="/user/login">
          <a className="switchForm">I already have a account</a>
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
