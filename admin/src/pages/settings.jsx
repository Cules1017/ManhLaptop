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

/** BIN Napas (6 số) cho https://img.vietqr.io/image/{BIN}-{STK}-{template}.png */
const VIETQR_BANK_OPTIONS = [
  { bin: '970436', name: 'Vietcombank (VCB)' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970422', name: 'MB Bank (MB)' },
  { bin: '970416', name: 'ACB' },
  { bin: '970432', name: 'VPBank' },
  { bin: '970423', name: 'TPBank' },
  { bin: '970403', name: 'Sacombank' },
  { bin: '970426', name: 'MSB' },
  { bin: '970437', name: 'HDBank' },
  { bin: '970454', name: 'VietCapital Bank' },
  { bin: '970429', name: 'SCB' },
  { bin: '970448', name: 'OCB' },
  { bin: '970443', name: 'SHB' },
  { bin: '970431', name: 'Eximbank' },
  { bin: '970440', name: 'SeABank' },
  { bin: '970428', name: 'Nam A Bank' },
  { bin: '970419', name: 'NCB' },
  { bin: '970449', name: 'LPBank' },
  { bin: '970446', name: 'COOPBANK' },
  { bin: '970457', name: 'Woori Bank' },
  { bin: '970458', name: 'UOB' },
];

const VIETQR_TEMPLATE_OPTIONS = [
  { value: 'compact2', label: 'compact2 — QR + logo + thông tin CK (540×640, mặc định)' },
  { value: 'compact', label: 'compact — QR + logo Napas/VietQR (540×540)' },
  { value: 'qr_only', label: 'qr_only — chỉ mã QR (480×480)' },
  { value: 'print', label: 'print — bản in đầy đủ (600×776)' },
];

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
  const [paymentConfig, setPaymentConfig] = useState({
    vietqr_bank_bin: '',
    vietqr_account_no: '',
    vietqr_account_name: '',
    vietqr_template: 'compact2',
    momo_endpoint: '',
    momo_partner_code: '',
    momo_access_key: '',
    momo_secret_key: '',
    momo_redirect_url: '',
    momo_ipn_url: '',
    momo_request_type: 'captureWallet',
  });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

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
        const [userRes, paymentRes] = await Promise.all([
          api.get('/user'),
          api.get('/admin/payment-config'),
        ]);
        profileFormik.setValues({
          name: userRes.data.name,
          email: userRes.data.email,
        });
        if (paymentRes.data?.status && paymentRes.data?.data) {
          setPaymentConfig((prev) => ({ ...prev, ...paymentRes.data.data }));
        }
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

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;
    setPaymentConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePaymentConfig = async () => {
    try {
      setPaymentSaving(true);
      setPaymentError(null);
      setPaymentSuccess(false);
      const res = await api.put('/admin/payment-config', paymentConfig);
      if (res.data?.status && res.data?.data) {
        setPaymentConfig((prev) => ({ ...prev, ...res.data.data }));
      }
      setPaymentSuccess(true);
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Không thể lưu cấu hình thanh toán');
    } finally {
      setPaymentSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const bankBinTrim = (paymentConfig.vietqr_bank_bin || '').trim();
  const vietqrBankSelectValue =
    !bankBinTrim
      ? ''
      : VIETQR_BANK_OPTIONS.some((o) => o.bin === bankBinTrim)
        ? bankBinTrim
        : 'custom';

  const vietqrTemplateValue = paymentConfig.vietqr_template || 'compact2';
  const vietqrTemplateIsPreset = VIETQR_TEMPLATE_OPTIONS.some((o) => o.value === vietqrTemplateValue);

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

                <Grid xs={12} md={4}>
                  <Typography variant="h6">
                    Payment Config
                  </Typography>
                </Grid>
                <Grid xs={12} md={8}>
                  <Card sx={{ p: 3 }}>
                    {paymentError && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {paymentError}
                      </Alert>
                    )}
                    {paymentSuccess && (
                      <Alert severity="success" sx={{ mb: 3 }}>
                        Lưu cấu hình thanh toán thành công
                      </Alert>
                    )}
                    <Box sx={{ maxWidth: 560 }}>
                      <Stack spacing={2}>
                        <Typography variant="subtitle1">VietQR (img.vietqr.io)</Typography>
                        <TextField
                          select
                          label="Ngân hàng (mã BIN Napas)"
                          fullWidth
                          value={vietqrBankSelectValue}
                          onChange={(e) => {
                            const v = e.target.value;
                            setPaymentConfig((prev) => {
                              const prevBin = (prev.vietqr_bank_bin || '').trim();
                              if (v === '') {
                                return { ...prev, vietqr_bank_bin: '' };
                              }
                              if (v === 'custom') {
                                const wasPreset = VIETQR_BANK_OPTIONS.some((o) => o.bin === prevBin);
                                return { ...prev, vietqr_bank_bin: wasPreset ? '' : prev.vietqr_bank_bin };
                              }
                              return { ...prev, vietqr_bank_bin: v };
                            });
                          }}
                          helperText="Chọn ngân hàng hoặc “Khác” để nhập BIN thủ công (6 số Napas)."
                        >
                          <MenuItem value="">
                            <em>— Chọn ngân hàng —</em>
                          </MenuItem>
                          {VIETQR_BANK_OPTIONS.map((row) => (
                            <MenuItem key={row.bin} value={row.bin}>
                              {row.bin} — {row.name}
                            </MenuItem>
                          ))}
                          <MenuItem value="custom">Khác (nhập BIN thủ công)</MenuItem>
                        </TextField>
                        {vietqrBankSelectValue === 'custom' && (
                          <TextField
                            label="Mã BIN thủ công"
                            name="vietqr_bank_bin"
                            value={paymentConfig.vietqr_bank_bin}
                            onChange={handlePaymentChange}
                            fullWidth
                            inputProps={{ maxLength: 20, inputMode: 'numeric' }}
                            helperText="Nhập đúng mã BIN 6 số theo ngân hàng của bạn (tham khảo Napas / VietQR)."
                          />
                        )}
                        <TextField label="Số tài khoản" name="vietqr_account_no" value={paymentConfig.vietqr_account_no} onChange={handlePaymentChange} fullWidth />
                        <TextField label="Tên chủ tài khoản" name="vietqr_account_name" value={paymentConfig.vietqr_account_name} onChange={handlePaymentChange} fullWidth />
                        <TextField
                          select
                          label="Kiểu hiển thị QR (template)"
                          name="vietqr_template"
                          value={vietqrTemplateValue}
                          onChange={handlePaymentChange}
                          fullWidth
                          helperText="Dùng cho URL ảnh VietQR; compact2 phù hợp hầu hết trường hợp."
                        >
                          {VIETQR_TEMPLATE_OPTIONS.map((row) => (
                            <MenuItem key={row.value} value={row.value}>
                              {row.label}
                            </MenuItem>
                          ))}
                          {!vietqrTemplateIsPreset && vietqrTemplateValue ? (
                            <MenuItem value={vietqrTemplateValue}>
                              Giữ giá trị hiện tại: {vietqrTemplateValue}
                            </MenuItem>
                          ) : null}
                        </TextField>

                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1">MoMo Sandbox</Typography>
                        <TextField label="Endpoint" name="momo_endpoint" value={paymentConfig.momo_endpoint} onChange={handlePaymentChange} fullWidth />
                        <TextField label="Partner Code" name="momo_partner_code" value={paymentConfig.momo_partner_code} onChange={handlePaymentChange} fullWidth />
                        <TextField label="Access Key" name="momo_access_key" value={paymentConfig.momo_access_key} onChange={handlePaymentChange} fullWidth />
                        <TextField label="Secret Key" name="momo_secret_key" value={paymentConfig.momo_secret_key} onChange={handlePaymentChange} fullWidth type="password" />
                        <TextField label="Redirect URL" name="momo_redirect_url" value={paymentConfig.momo_redirect_url} onChange={handlePaymentChange} fullWidth />
                        <TextField label="IPN URL" name="momo_ipn_url" value={paymentConfig.momo_ipn_url} onChange={handlePaymentChange} fullWidth />
                        <TextField label="Request Type" name="momo_request_type" value={paymentConfig.momo_request_type} onChange={handlePaymentChange} fullWidth />
                      </Stack>

                      <Box sx={{ mt: 3 }}>
                        <Button variant="contained" onClick={handleSavePaymentConfig} disabled={paymentSaving}>
                          {paymentSaving ? 'Đang lưu...' : 'Lưu cấu hình thanh toán'}
                        </Button>
                      </Box>
                    </Box>
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
