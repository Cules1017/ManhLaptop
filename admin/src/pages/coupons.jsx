import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

const emptyForm = {
  code: '',
  type: 'percent',
  value: '',
  min_order_value: '0',
  max_discount: '',
  usage_limit: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
};

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không lấy được danh sách mã giảm giá');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const filteredCoupons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((c) => String(c.code || '').toLowerCase().includes(q));
  }, [coupons, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormDialogOpen(true);
    setError(null);
  };

  const openEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percent',
      value: coupon.value || '',
      min_order_value: coupon.min_order_value || '0',
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      valid_from: coupon.valid_from ? coupon.valid_from.substring(0, 16) : '',
      valid_until: coupon.valid_until ? coupon.valid_until.substring(0, 16) : '',
      is_active: coupon.is_active === 1 || coupon.is_active === true,
    });
    setFormDialogOpen(true);
    setError(null);
  };

  const closeDialog = () => {
    if (submitting) return;
    setFormDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = { ...form };
    if (!payload.max_discount) delete payload.max_discount;
    if (!payload.usage_limit) delete payload.usage_limit;
    if (!payload.valid_from) delete payload.valid_from;
    if (!payload.valid_until) delete payload.valid_until;

    try {
      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, payload);
        setSuccess('Cập nhật mã giảm giá thành công.');
      } else {
        await api.post('/admin/coupons', payload);
        setSuccess('Thêm mã giảm giá thành công.');
      }
      closeDialog();
      await fetchCoupons();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Có lỗi xảy ra';
      setError(typeof msg === 'string' ? msg : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      setDeleteTarget(null);
      setSuccess('Đã xóa mã giảm giá.');
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa mã giảm giá.');
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Quản lý mã giảm giá | Admin</title>
      </Helmet>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <LocalOfferOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Quản lý mã giảm giá
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tạo và quản lý các mã khuyến mãi cho khách hàng
                </Typography>
              </Box>
            </Stack>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ py: 1.25 }}>
              Thêm mã giảm giá
            </Button>
          </Stack>

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card elevation={1} sx={{ p: { xs: 2, md: 2.5 } }}>
            <TextField
              placeholder="Tìm theo mã..."
              value={searchTerm}
              onChange={(ev) => setSearchTerm(ev.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Card>

          <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Mã</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Giá trị</TableCell>
                  <TableCell>Đã dùng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={36} />
                    </TableCell>
                  </TableRow>
                ) : filteredCoupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography>
                          {coupons.length === 0 ? 'Chưa có mã giảm giá nào.' : 'Không có mã nào khớp.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCoupons.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{c.code}</Typography>
                      </TableCell>
                      <TableCell>
                        {c.type === 'percent' ? '%' : 'VNĐ'}
                      </TableCell>
                      <TableCell>
                        {c.type === 'percent' ? `${c.value}%` : `${Number(c.value).toLocaleString()} đ`}
                      </TableCell>
                      <TableCell>
                        {c.used_count} / {c.usage_limit || '∞'}
                      </TableCell>
                      <TableCell>
                        {c.is_active ? 'Đang bật' : 'Đã tắt'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Sửa">
                          <IconButton color="primary" size="small" onClick={() => openEdit(c)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton color="error" size="small" onClick={() => setDeleteTarget(c)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <Dialog open={formDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</DialogTitle>
          <Divider />
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Mã giảm giá (Code)"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Loại giảm giá</InputLabel>
                <Select
                  name="type"
                  value={form.type}
                  label="Loại giảm giá"
                  onChange={handleChange}
                >
                  <MenuItem value="percent">Theo phần trăm (%)</MenuItem>
                  <MenuItem value="fixed">Số tiền cố định (VNĐ)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Giá trị giảm"
                name="value"
                type="number"
                value={form.value}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Đơn hàng tối thiểu"
                name="min_order_value"
                type="number"
                value={form.min_order_value}
                onChange={handleChange}
                fullWidth
              />
              {form.type === 'percent' && (
                <TextField
                  label="Giảm tối đa (Tùy chọn)"
                  name="max_discount"
                  type="number"
                  value={form.max_discount}
                  onChange={handleChange}
                  fullWidth
                />
              )}
              <TextField
                label="Số lần sử dụng tối đa (Tùy chọn)"
                name="usage_limit"
                type="number"
                value={form.usage_limit}
                onChange={handleChange}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Ngày bắt đầu (Tùy chọn)"
                  name="valid_from"
                  type="datetime-local"
                  value={form.valid_from}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Ngày kết thúc (Tùy chọn)"
                  name="valid_until"
                  type="datetime-local"
                  value={form.valid_until}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={handleChange}
                    name="is_active"
                    color="primary"
                  />
                }
                label="Trạng thái kích hoạt"
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={closeDialog} color="inherit" disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Đang lưu…' : 'Lưu lại'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Xóa mã giảm giá?</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa mã <b>{deleteTarget?.code}</b>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 2 }}>
            <Button onClick={() => setDeleteTarget(null)} color="inherit">
              Hủy
            </Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
