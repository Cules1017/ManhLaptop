import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  Alert,
  Divider
} from '@mui/material';
import api from '../services/api';

const companySizeOptions = ['1-10', '11-30', '31-50', '50+'];

const initialValues = {
  companyName: 'ACME Corp LLC.',
  companySize: '1-10',
  email: 'chen.simmons@acmecorp.com',
  name: 'Chen Simmons',
  jobTitle: 'Operation',
  submit: null
};

const profileValidationSchema = Yup.object({
  name: Yup
    .string()
    .max(255)
    .required('Name is required'),
  email: Yup
    .string()
    .email('Must be a valid email')
    .max(255)
    .required('Email is required'),
});

const passwordValidationSchema = Yup.object({
  current_password: Yup
    .string()
    .required('Current password is required'),
  new_password: Yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirm_password: Yup
    .string()
    .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Page = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profileFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      submit: null
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await api.put('/user/update', {
          name: values.name,
          email: values.email,
        });
        setSuccess(true);
        setError(null);
        helpers.setSubmitting(false);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
      }
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
      submit: null
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, helpers) => {
      try {
        await api.put('/user/update-password', {
          current_password: values.current_password,
          new_password: values.new_password,
        });
        setPasswordSuccess(true);
        setPasswordError(null);
        helpers.resetForm();
        helpers.setSubmitting(false);
      } catch (err) {
        setPasswordError(err.response?.data?.message || 'An error occurred');
        helpers.setStatus({ success: false });
        helpers.setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user');
        profileFormik.setValues({
          name: response.data.name,
          email: response.data.email,
        });
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          Settings | Admin
        </title>
      </Helmet>
      <Box
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">
                Settings
              </Typography>
            </div>
            <div>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  xs={12}
                  md={4}
                >
                  <Typography variant="h6">
                    Account
                  </Typography>
                </Grid>
                <Grid
                  xs={12}
                  md={8}
                >
                  <Card sx={{ p: 3 }}>
                    {error && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                      </Alert>
                    )}
                    {success && (
                      <Alert severity="success" sx={{ mb: 3 }}>
                        Cập nhật thành công
                      </Alert>
                    )}
                    <form onSubmit={profileFormik.handleSubmit}>
                      <Box sx={{ maxWidth: 420 }}>
                        <Stack spacing={3}>
                          <TextField
                            error={Boolean(profileFormik.touched.name && profileFormik.errors.name)}
                            fullWidth
                            helperText={profileFormik.touched.name && profileFormik.errors.name}
                            label="Full Name"
                            name="name"
                            onBlur={profileFormik.handleBlur}
                            onChange={profileFormik.handleChange}
                            value={profileFormik.values.name}
                          />
                          <TextField
                            error={Boolean(profileFormik.touched.email && profileFormik.errors.email)}
                            fullWidth
                            helperText={profileFormik.touched.email && profileFormik.errors.email}
                            label="Email address"
                            name="email"
                            onBlur={profileFormik.handleBlur}
                            onChange={profileFormik.handleChange}
                            type="email"
                            value={profileFormik.values.email}
                          />
                        </Stack>
                        {profileFormik.errors.submit && (
                          <FormHelperText
                            error
                            sx={{ mt: 3 }}
                          >
                            {profileFormik.errors.submit}
                          </FormHelperText>
                        )}
                        <Box sx={{ mt: 3 }}>
                          <Button
                            color="primary"
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={profileFormik.isSubmitting}
                          >
                            Save settings
                          </Button>
                        </Box>
                      </Box>
                    </form>

                    <Divider sx={{ my: 4 }} />

                    <Typography variant="h6" sx={{ mb: 3 }}>
                      Change Password
                    </Typography>

                    {passwordError && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {passwordError}
                      </Alert>
                    )}
                    {passwordSuccess && (
                      <Alert severity="success" sx={{ mb: 3 }}>
                        Mật khẩu đã được cập nhật thành công
                      </Alert>
                    )}

                    <form onSubmit={passwordFormik.handleSubmit}>
                      <Box sx={{ maxWidth: 420 }}>
                        <Stack spacing={3}>
                          <TextField
                            error={Boolean(passwordFormik.touched.current_password && passwordFormik.errors.current_password)}
                            fullWidth
                            helperText={passwordFormik.touched.current_password && passwordFormik.errors.current_password}
                            label="Current Password"
                            name="current_password"
                            onBlur={passwordFormik.handleBlur}
                            onChange={passwordFormik.handleChange}
                            type="password"
                            value={passwordFormik.values.current_password}
                          />
                          <TextField
                            error={Boolean(passwordFormik.touched.new_password && passwordFormik.errors.new_password)}
                            fullWidth
                            helperText={passwordFormik.touched.new_password && passwordFormik.errors.new_password}
                            label="New Password"
                            name="new_password"
                            onBlur={passwordFormik.handleBlur}
                            onChange={passwordFormik.handleChange}
                            type="password"
                            value={passwordFormik.values.new_password}
                          />
                          <TextField
                            error={Boolean(passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password)}
                            fullWidth
                            helperText={passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password}
                            label="Confirm New Password"
                            name="confirm_password"
                            onBlur={passwordFormik.handleBlur}
                            onChange={passwordFormik.handleChange}
                            type="password"
                            value={passwordFormik.values.confirm_password}
                          />
                        </Stack>
                        {passwordFormik.errors.submit && (
                          <FormHelperText
                            error
                            sx={{ mt: 3 }}
                          >
                            {passwordFormik.errors.submit}
                          </FormHelperText>
                        )}
                        <Box sx={{ mt: 3 }}>
                          <Button
                            color="primary"
                            size="large"
                            type="submit"
                            variant="contained"
                            disabled={passwordFormik.isSubmitting}
                          >
                            Change Password
                          </Button>
                        </Box>
                      </Box>
                    </form>
                  </Card>
                </Grid>

                <Grid
                  xs={12}
                  md={4}
                >
                  <Typography variant="h6">
                    Account Actions
                  </Typography>
                </Grid>
                <Grid
                  xs={12}
                  md={8}
                >
                  <Card sx={{ p: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Đăng xuất khỏi tài khoản
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Khi đăng xuất, bạn sẽ cần đăng nhập lại để truy cập vào trang quản trị.
                    </Typography>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
