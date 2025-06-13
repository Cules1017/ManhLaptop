import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Card, Container, Divider, Stack, Typography } from '@mui/material';
import { OrdersSearch } from 'src/sections/orders/orders-search';
import { OrdersTable } from 'src/sections/orders/orders-table';
import api from '../services/api';

const statusMap = {
  pending: { color: '#1976d2', label: 'Chờ xác nhận' },
  processing: { color: '#0288d1', label: 'Đang xử lý' },
  shipping: { color: '#fbc02d', label: 'Đang giao' },
  completed: { color: '#43a047', label: 'Đã hoàn thành' },
  cancelled: { color: '#e53935', label: 'Đã hủy' }
};

const Page = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders', {
        params: {
          search: query,
          page: page + 1,
          per_page: rowsPerPage
        }
      });
      const data = res.data.data;
      setOrders(data.data.map(o => ({
        id: o.id,
        createdAt: new Date(o.created_at),
        customer: {
          name: o.user?.name || `ID: ${o.user_id}`,
          phone: o.user?.phone || ''
        },
        status: o.status,
        totalAmount: o.total_price,
        paymentMethod: o.payment_method,
        note: o.note,
        products: o.items.map(i => ({
          name: i.product?.name,
          quantity: i.quantity,
          image: i.product?.image
        })),
        currency: '₫',
      })));
      setTotal(data.total);
    } catch (err) {
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [query, page, rowsPerPage]);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setPage(0);
  }, []);

  const handleChangePage = useCallback((event, value) => {
    setPage(value);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleStatusChange = async (order, newStatus) => {
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  return (
    <>
      <Helmet>
        <title>Quản lý đơn hàng</title>
      </Helmet>
      <Box
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              alignItems="flex-start"
              direction="row"
              justifyContent="space-between"
              spacing={3}
            >
              <Typography variant="h4">
                Quản lý đơn hàng
              </Typography>
            </Stack>
            <div>
              <Card>
                <OrdersSearch
                  mode="table"
                  onModeChange={() => {}}
                  onQueryChange={handleQueryChange}
                  query={query}
                />
                <Divider />
                <OrdersTable
                  count={total}
                  items={orders}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  loading={loading}
                  statusMap={statusMap}
                  onStatusChange={handleStatusChange}
                />
              </Card>
            </div>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Page;
