import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
  Unstable_Grid2 as Grid,
  Alert,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import PaymentIcon from '@mui/icons-material/Payment';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import api from '../services/api';

const ICON_OPTIONS = [
  { value: 'shipping', label: 'Giao hàng', icon: <LocalShippingIcon /> },
  { value: 'shield', label: 'Bảo vệ / Bảo hành', icon: <SecurityIcon /> },
  { value: 'verify', label: 'Xác thực / Chính hãng', icon: <VerifiedUserIcon /> },
  { value: 'support', label: 'Hỗ trợ 24/7', icon: <HeadsetMicIcon /> },
  { value: 'payment', label: 'Thanh toán', icon: <PaymentIcon /> },
  { value: 'gift', label: 'Quà tặng', icon: <CardGiftcardIcon /> },
];

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_button_text: '',
    hero_button_link: '',
    hero_image_url: '',
  });

  const [heroImageFile, setHeroImageFile] = useState(null);

  const [trustBadges, setTrustBadges] = useState([]);
  const [partnerLogos, setPartnerLogos] = useState([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/homepage-settings');
      if (res.data?.status && res.data?.data) {
        const data = res.data.data;
        setSettings({
          hero_title: data.hero_title || '',
          hero_subtitle: data.hero_subtitle || '',
          hero_button_text: data.hero_button_text || '',
          hero_button_link: data.hero_button_link || '',
          hero_image_url: data.hero_image_url || '',
        });
        setTrustBadges(data.trust_badges || []);
        setPartnerLogos(data.partner_logos || []);
      }
    } catch (err) {
      setError('Lỗi khi tải cấu hình trang chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleHeroImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
    }
  };

  // Trust Badges Handlers
  const handleAddBadge = () => {
    setTrustBadges([...trustBadges, { id: Date.now().toString(), text: '', icon_url: '' }]);
  };

  const handleRemoveBadge = (id) => {
    setTrustBadges(trustBadges.filter(badge => badge.id !== id));
  };

  const handleBadgeChange = (id, field, value) => {
    setTrustBadges(trustBadges.map(badge => 
      badge.id === id ? { ...badge, [field]: value } : badge
    ));
  };

  const handleBadgeIconUpload = async (id, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/homepage-settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.status && res.data?.url) {
        handleBadgeChange(id, 'icon_url', res.data.url);
      }
    } catch (err) {
      alert('Upload ảnh thất bại!');
    }
  };

  // Partner Logos Handlers
  const handleAddLogo = () => {
    setPartnerLogos([...partnerLogos, { id: Date.now().toString(), url: '' }]);
  };

  const handleRemoveLogo = (id) => {
    setPartnerLogos(partnerLogos.filter(logo => logo.id !== id));
  };

  const handleLogoUpload = async (id, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/homepage-settings/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.status && res.data?.url) {
        setPartnerLogos(partnerLogos.map(logo => 
          logo.id === id ? { ...logo, url: res.data.url } : logo
        ));
      }
    } catch (err) {
      alert('Upload ảnh thất bại!');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const formData = new FormData();
      formData.append('hero_title', settings.hero_title);
      formData.append('hero_subtitle', settings.hero_subtitle);
      formData.append('hero_button_text', settings.hero_button_text);
      formData.append('hero_button_link', settings.hero_button_link);
      formData.append('hero_image_url', settings.hero_image_url || '');
      
      if (heroImageFile) {
        formData.append('hero_image', heroImageFile);
      }
      
      // Send badges and logos as JSON string
      formData.append('trust_badges', JSON.stringify(trustBadges));
      formData.append('partner_logos', JSON.stringify(partnerLogos));

      const res = await api.post('/admin/homepage-settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.status) {
        setSuccess(true);
        // re-fetch to get updated URLs
        await fetchSettings();
        setHeroImageFile(null); // reset file input
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
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
        <title>Cấu hình Trang chủ | Admin</title>
      </Helmet>
      <Box sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4">Cấu hình Trang chủ</Typography>
              <Button 
                variant="contained" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu lại'}
              </Button>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Lưu cấu hình thành công!</Alert>}

            <Grid container spacing={3}>
              {/* Hero Banner Section */}
              <Grid xs={12} md={4}>
                <Typography variant="h6">Hero Banner</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cấu hình vùng banner chính xuất hiện đầu tiên trên trang chủ.
                </Typography>
              </Grid>
              <Grid xs={12} md={8}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Tiêu đề (Title)"
                      name="hero_title"
                      value={settings.hero_title}
                      onChange={handleSettingChange}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Phụ đề (Subtitle)"
                      name="hero_subtitle"
                      value={settings.hero_subtitle}
                      onChange={handleSettingChange}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField
                        fullWidth
                        label="Text nút bấm"
                        name="hero_button_text"
                        value={settings.hero_button_text}
                        onChange={handleSettingChange}
                      />
                      <TextField
                        fullWidth
                        label="Link nút bấm"
                        name="hero_button_link"
                        value={settings.hero_button_link}
                        onChange={handleSettingChange}
                      />
                    </Stack>
                    
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Ảnh nền (Background Image)</Typography>
                        {settings.hero_image_url && !heroImageFile && (
                          <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                            <img src={`http://localhost:8000${settings.hero_image_url}`} alt="Hero preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} />
                            <IconButton 
                              size="small" 
                              color="error" 
                              sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                              onClick={() => setSettings({ ...settings, hero_image_url: '' })}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                        {heroImageFile && (
                          <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                            <img src={URL.createObjectURL(heroImageFile)} alt="Hero preview" style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain' }} />
                            <IconButton 
                              size="small" 
                              color="error" 
                              sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'rgba(255,255,255,1)' } }}
                              onClick={() => setHeroImageFile(null)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                        <Box>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleHeroImageChange}
                          />
                        </Box>
                      </Box>
                  </Stack>
                </Card>
              </Grid>

              {/* Trust Badges Section */}
              <Grid xs={12} md={4}>
                <Typography variant="h6">Trust Badges</Typography>
                <Typography variant="body2" color="text.secondary">
                  Thanh màu đen hiển thị các đặc quyền/cam kết (Giao hàng miễn phí, Đổi trả 30 ngày...)
                </Typography>
              </Grid>
              <Grid xs={12} md={8}>
                <Card sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {trustBadges.map((badge, index) => (
                      <Box key={badge.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ width: 80, height: 80, border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {badge.icon_type ? (
                               ICON_OPTIONS.find(o => o.value === badge.icon_type)?.icon
                            ) : badge.icon_url ? (
                              <img src={`http://localhost:8000${badge.icon_url}`} alt="badge icon" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : (
                              <Typography variant="caption">No Icon</Typography>
                            )}
                          </Box>
                          <Stack spacing={1} flexGrow={1}>
                            <TextField 
                              size="small" 
                              fullWidth 
                              label="Nội dung hiển thị" 
                              value={badge.text} 
                              onChange={(e) => handleBadgeChange(badge.id, 'text', e.target.value)} 
                            />
                            <FormControl fullWidth size="small">
                              <InputLabel>Chọn Icon</InputLabel>
                              <Select
                                value={badge.icon_type || ''}
                                label="Chọn Icon"
                                onChange={(e) => handleBadgeChange(badge.id, 'icon_type', e.target.value)}
                              >
                                <MenuItem value=""><em>Không có</em></MenuItem>
                                {ICON_OPTIONS.map(opt => (
                                  <MenuItem key={opt.value} value={opt.value}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      {opt.icon} <Typography variant="body2">{opt.label}</Typography>
                                    </Stack>
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Stack>
                          <IconButton color="error" onClick={() => handleRemoveBadge(badge.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </Box>
                    ))}
                    <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddBadge}>
                      Thêm Badge
                    </Button>
                  </Stack>
                </Card>
              </Grid>



            </Grid>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
