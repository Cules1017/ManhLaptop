import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
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

const emptyForm = { name: '' };

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không lấy được danh sách danh mục');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => String(c.name || '').toLowerCase().includes(q));
  }, [categories, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormDialogOpen(true);
    setError(null);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name || '' });
    setFormDialogOpen(true);
    setError(null);
  };

  const closeDialog = () => {
    if (submitting) return;
    setFormDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = String(form.name || '').trim();
    if (!name) {
      setError('Vui lòng nhập tên danh mục');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name });
        setSuccess('Cập nhật danh mục thành công.');
      } else {
        await api.post('/categories', { name });
        setSuccess('Thêm danh mục thành công.');
      }
      closeDialog();
      await fetchCategories();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.name?.[0] ||
        'Không lưu được danh mục';
      setError(typeof msg === 'string' ? msg : 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      setSuccess('Đã xóa danh mục.');
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa danh mục (có thể đang được dùng bởi sản phẩm).');
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Quản lý danh mục | Admin</title>
      </Helmet>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            gap={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <FolderOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Quản lý danh mục
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhóm sản phẩm hiển thị trên cửa hàng
                </Typography>
              </Box>
            </Stack>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ py: 1.25 }}>
              Thêm danh mục
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
              placeholder="Tìm theo tên danh mục…"
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
                  <TableCell width={88}>ID</TableCell>
                  <TableCell>Tên danh mục</TableCell>
                  <TableCell width={120} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={36} />
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography>
                          {categories.length === 0 ? 'Chưa có danh mục nào.' : 'Không có danh mục khớp bộ lọc.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((c) => (
                    <TableRow key={c.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                          #{c.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>{c.name}</Typography>
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
          <DialogTitle>{editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
          <Divider />
          <form onSubmit={handleSubmit}>
            <DialogContent sx={{ pt: 2 }}>
              <TextField
                autoFocus
                label="Tên danh mục"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
                placeholder="Ví dụ: Laptop gaming"
                inputProps={{ maxLength: 200 }}
                helperText="Tối đa 200 ký tự."
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={closeDialog} color="inherit" disabled={submitting}>
                Hủy
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Đang lưu…' : editingId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Xóa danh mục?</DialogTitle>
          <DialogContent>
            <Typography>
              Xóa <b>{deleteTarget?.name}</b>? Danh mục đang gán cho sản phẩm có thể không xóa được.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 2 }}>
            <Button onClick={() => setDeleteTarget(null)} color="inherit">
              Không
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
