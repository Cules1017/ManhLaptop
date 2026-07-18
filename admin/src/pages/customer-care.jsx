import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Pagination
} from '@mui/material';
import { Visibility as ViewIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../services/api';
import { format } from 'date-fns';

const STATUS_COLORS = {
  new: 'error',
  processing: 'warning',
  resolved: 'success'
};

const STATUS_LABELS = {
  new: 'Mới',
  processing: 'Đang xử lý',
  resolved: 'Đã giải quyết'
};

export const CustomerCare = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, lastPage: 1, total: 0 });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    status: 'new',
    admin_note: ''
  });

  const fetchContacts = async (page = pagination.page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await api.get(`/admin/contacts?${params.toString()}`);
      setContacts(response.data.data.data);
      setPagination({
        page: response.data.data.current_page,
        lastPage: response.data.data.last_page,
        total: response.data.data.total
      });
    } catch (error) {
      console.error('Lỗi khi tải danh sách liên hệ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(1);
  }, [search, statusFilter]);

  const handleOpenDialog = (contact) => {
    setSelectedContact(contact);
    setFormData({
      status: contact.status,
      admin_note: contact.admin_note || ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedContact(null);
  };

  const handleSubmit = async () => {
    try {
      await api.put(`/admin/contacts/${selectedContact.id}`, formData);
      handleCloseDialog();
      fetchContacts();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
      try {
        await api.delete(`/admin/contacts/${id}`);
        fetchContacts();
      } catch (error) {
        console.error('Lỗi khi xóa:', error);
      }
    }
  };

  return (
    <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" spacing={4}>
            <Stack spacing={1}>
              <Typography variant="h4">Chăm sóc khách hàng</Typography>
            </Stack>
          </Stack>

          <Card>
            <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Tìm kiếm tên, email, SDT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ width: 300 }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={statusFilter}
                  label="Trạng thái"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="new">Mới</MenuItem>
                  <MenuItem value="processing">Đang xử lý</MenuItem>
                  <MenuItem value="resolved">Đã giải quyết</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Thông tin liên hệ</TableCell>
                  <TableCell>Lời nhắn</TableCell>
                  <TableCell>Ngày gửi</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow hover key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>
                      {contact.email && <Box>{contact.email}</Box>}
                      {contact.phone && <Box>{contact.phone}</Box>}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {contact.message}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={STATUS_LABELS[contact.status]} 
                        color={STATUS_COLORS[contact.status]} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(contact)} color="primary">
                        <ViewIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(contact.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination 
                count={pagination.lastPage} 
                page={pagination.page} 
                onChange={(e, value) => fetchContacts(value)} 
                color="primary" 
              />
            </Box>
          </Card>
        </Stack>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết liên hệ</DialogTitle>
        <DialogContent dividers>
          {selectedContact && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Khách hàng</Typography>
                <Typography variant="body1">{selectedContact.name}</Typography>
              </Box>
              <Stack direction="row" spacing={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedContact.email || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Số điện thoại</Typography>
                  <Typography variant="body1">{selectedContact.phone || 'N/A'}</Typography>
                </Box>
              </Stack>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Nội dung lời nhắn</Typography>
                <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mt: 1 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedContact.message}
                  </Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="new">Mới</MenuItem>
                  <MenuItem value="processing">Đang xử lý</MenuItem>
                  <MenuItem value="resolved">Đã giải quyết</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Ghi chú của Admin"
                multiline
                rows={3}
                value={formData.admin_note}
                onChange={(e) => setFormData({ ...formData, admin_note: e.target.value })}
                placeholder="Ghi chú nội bộ..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>Lưu thay đổi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerCare;
