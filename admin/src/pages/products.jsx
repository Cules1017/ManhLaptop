import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Editor } from '@tinymce/tinymce-react';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';

const PER_PAGE = 12;
const ASSET_ORIGIN = String(api.defaults.baseURL || '').replace(/\/api\/?$/i, '');
const TINYMCE_SCRIPT = 'https://cdn.jsdelivr.net/npm/tinymce@8/tinymce.min.js';

/** Gốc site bán hàng (fe1 Next). Build: `VITE_STOREFRONT_URL=https://shop.example.com` */
const STOREFRONT_ORIGIN = String(import.meta.env.VITE_STOREFRONT_URL || 'http://127.0.0.1:3001').replace(/\/$/, '');

function storefrontProductUrl(productId) {
  return `${STOREFRONT_ORIGIN}/product/${productId}`;
}

/** Ảnh có thể là URL đầy đủ hoặc đường dẫn /storage/... từ Laravel */
function resolveImageSrc(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = ASSET_ORIGIN || '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Kiểm tra mô tả HTML không chỉ chứa thẻ rỗng */
function htmlHasText(html) {
  const t = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s|&nbsp;/g, '')
    .trim();
  return t.length > 0;
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  discount: '',
  quantity: '',
  category_id: '',
  image: '',
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [imageType, setImageType] = useState('link');
  const [imageFile, setImageFile] = useState(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products', {
        params: {
          page: pagination.page,
          per_page: PER_PAGE,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(categoryFilter ? { category: categoryFilter } : {}),
        },
      });
      const payload = res.data.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      setProducts(list);
      if (payload?.current_page) {
        setPagination({
          page: payload.current_page,
          lastPage: Math.max(1, payload.last_page || 1),
          total: payload.total ?? list.length,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không lấy được danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFormUi = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageType('link');
    setImageFile(null);
  };

  const openCreateDialog = () => {
    resetFormUi();
    setFormDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      discount: product.discount ?? '',
      quantity: product.quantity ?? '',
      category_id: product.category_id ?? '',
      image: product.image || '',
    });
    setImageType('link');
    setImageFile(null);
    setFormDialogOpen(true);
  };

  const closeDialog = () => {
    setFormDialogOpen(false);
    resetFormUi();
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applySearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    setSearch(searchDraft);
  };

  const handlePageChange = (_, value) => {
    setPagination((p) => ({ ...p, page: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!htmlHasText(form.description)) {
      setError('Vui lòng nhập mô tả sản phẩm');
      return;
    }
    if (!editingId && imageType === 'file' && !imageFile) {
      setError('Vui lòng chọn ảnh để upload');
      return;
    }
    if (!editingId && imageType === 'link' && !String(form.image || '').trim()) {
      setError('Vui lòng nhập URL hoặc đường dẫn ảnh');
      return;
    }
    setSubmitting(true);
    setError(null);
    let data;
    if (imageType === 'file' && imageFile) {
      data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'image') data.append(k, v == null ? '' : String(v));
      });
      data.append('image_file', imageFile);
    } else {
      data = { ...form };
    }

    try {
      if (editingId) {
        if (imageType === 'file' && imageFile) {
          await api.post(`/products/${editingId}?_method=PUT`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.put(`/products/${editingId}`, data);
        }
      } else if (imageType === 'file' && imageFile) {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/products', data);
      }
      closeDialog();
      await fetchProducts();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors && JSON.stringify(err.response.data.errors));
      setError(typeof msg === 'string' ? msg : 'Không lưu được sản phẩm — kiểm tra dữ liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      await fetchProducts();
    } catch {
      setError('Không xóa được sản phẩm');
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Quản lý sản phẩm | Admin</title>
      </Helmet>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            gap={2}
          >
            <Typography variant="h4" fontWeight={700}>
              Quản lý sản phẩm
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog} sx={{ py: 1.25 }}>
              Thêm sản phẩm
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Card elevation={1} sx={{ p: { xs: 2, md: 2.5 } }}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                alignItems: 'end',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(0, 1fr) minmax(200px, 280px) auto',
                },
              }}
            >
              <TextField
                label="Tìm kiếm"
                placeholder="Theo tên hoặc mô tả…"
                value={searchDraft}
                onChange={(ev) => setSearchDraft(ev.target.value)}
                onKeyDown={(ev) => ev.key === 'Enter' && applySearch()}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Danh mục"
                value={categoryFilter}
                onChange={(ev) => {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setCategoryFilter(ev.target.value);
                }}
                fullWidth
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {(categories || []).map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                onClick={applySearch}
                sx={{
                  height: 56,
                  px: 2.5,
                  flexShrink: 0,
                  alignSelf: { xs: 'stretch', md: 'end' },
                }}
              >
                Lọc
              </Button>
            </Box>
          </Card>

          <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell width={72}>Ảnh</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell width={140}>Giá</TableCell>
                  <TableCell width={100}>KM</TableCell>
                  <TableCell width={90}>SL</TableCell>
                  <TableCell>Danh mục</TableCell>
                  <TableCell width={156} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <CircularProgress size={36} />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography>Chưa có sản phẩm nào khớp bộ lọc.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const src = resolveImageSrc(p.image);
                    return (
                      <TableRow key={p.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell>
                          <Box
                            component="img"
                            src={src}
                            alt=""
                            sx={{
                              width: 52,
                              height: 52,
                              objectFit: 'cover',
                              borderRadius: 1,
                              bgcolor: 'action.hover',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>{p.name}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {(() => {
                              if (!htmlHasText(p.description)) return '—';
                              const plain = p.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                              return plain.length > 120 ? `${plain.slice(0, 120)}…` : plain;
                            })()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{parseInt(String(p.price), 10).toLocaleString('vi-VN')}₫</Typography>
                        </TableCell>
                        <TableCell>
                          {Number(p.discount) > 0 ? (
                            <Chip size="small" color="warning" variant="outlined" label={`-${p.discount}%`} />
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell>
                          <Chip size="small" label={p.category?.name || p.category_id || '—'} color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Xem tại cửa hàng (tab mới)">
                            <IconButton
                              color="inherit"
                              size="small"
                              component="a"
                              href={storefrontProductUrl(p.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sửa">
                            <IconButton color="primary" size="small" onClick={() => openEditDialog(p)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa">
                            <IconButton color="error" size="small" onClick={() => setDeleteTarget(p)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.lastPage > 1 && (
            <Stack alignItems="center">
              <Pagination
                count={pagination.lastPage}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Tổng {pagination.total} sản phẩm · Trang {pagination.page}/{pagination.lastPage}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Form thêm / sửa */}
        <Dialog open={formDialogOpen} onClose={() => !submitting && closeDialog()} fullWidth maxWidth="md" scroll="paper">
          <DialogTitle>{editingId ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
          <Divider />
          <form onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ pt: 2 }}>
              <Stack spacing={2.5}>
                <TextField
                  label="Tên sản phẩm"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Giá (₫)" name="price" value={form.price} onChange={handleChange} type="number" required fullWidth InputProps={{ inputProps: { min: 0 } }} />
                  <TextField label="Giảm giá (%)" name="discount" value={form.discount} onChange={handleChange} type="number" fullWidth InputProps={{ inputProps: { min: 0, max: 100 } }} />
                  <TextField label="Số lượng" name="quantity" value={form.quantity} onChange={handleChange} type="number" required fullWidth InputProps={{ inputProps: { min: 0 } }} />
                </Stack>
                <TextField select label="Danh mục" name="category_id" value={form.category_id === '' ? '' : String(form.category_id)} onChange={handleChange} required fullWidth>
                  <MenuItem value="" disabled>
                    Chọn danh mục
                  </MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography variant="subtitle2" color="text.secondary">
                  Ảnh đại diện
                </Typography>
                <RadioGroup row value={imageType} onChange={(e) => setImageType(e.target.value)}>
                  <FormControlLabel value="link" control={<Radio size="small" />} label="URL ảnh" />
                  <FormControlLabel value="file" control={<Radio size="small" />} label="Upload từ máy" />
                </RadioGroup>
                {imageType === 'link' ? (
                  <TextField label="Đường dẫn / URL ảnh" name="image" value={form.image} onChange={handleChange} placeholder="https://... hoặc /storage/uploads/..." fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><ImageOutlinedIcon fontSize="small" /></InputAdornment> }} required={Boolean(!editingId || !form.image)} />
                ) : (
                  <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
                    Chọn ảnh (tối đa 2MB)
                    <input type="file" hidden accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  </Button>
                )}
                {imageType === 'link' && form.image && editingId ? (
                  <Typography variant="caption" color="text.secondary">
                    Giữ URL hiện tại nếu không đổi; không bắt buộc khi chỉnh sửa và không upload ảnh mới.
                  </Typography>
                ) : null}
                {(imageType === 'file' && imageFile?.name && (
                  <Typography variant="body2">{imageFile.name}</Typography>
                )) ||
                  null}

                <Divider />

                <Typography variant="subtitle2" color="text.secondary">
                  Mô tả chi tiết (TinyMCE)
                </Typography>
                <Box
                  sx={{
                    borderRadius: 1,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Editor
                    key={`${editingId ?? 'new'}-${formDialogOpen}`}
                    tinymceScriptSrc={TINYMCE_SCRIPT}
                    licenseKey="gpl"
                    value={form.description}
                    onEditorChange={(content) => setForm((f) => ({ ...f, description: content }))}
                    init={{
                      height: 360,
                      menubar: false,
                      branding: false,
                      plugins: ['lists', 'link', 'autolink', 'code', 'fullscreen', 'table', 'quickbars'],
                      toolbar:
                        'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright | bullist numlist outdent indent | link table | removeformat | code fullscreen',
                      promotion: false,
                      content_style:
                        'body { font-family: system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif; font-size:14px }',
                      toolbar_mode: 'sliding',
                    }}
                  />
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => !submitting && closeDialog()} color="inherit">
                Hủy
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Đang lưu…' : editingId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Xác nhận xóa */}
        <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Xóa sản phẩm?</DialogTitle>
          <DialogContent>
            <Typography>
              Xóa{' '}
              <b>{deleteTarget?.name}</b>? Hành động không hoàn tác.
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
