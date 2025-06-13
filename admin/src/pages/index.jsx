import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import ShoppingCartIcon from '@heroicons/react/24/solid/ShoppingCartIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import {
  Avatar,
  Box,
  Container,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import  OverviewKpi  from 'src/sections/overview/overview-kpi';
import  {OverviewLatestCustomers}  from 'src/sections/overview/overview-latest-customers';
import  {OverviewSummary}  from 'src/sections/overview/overview-summary';
import api from '../services/api';

const Page = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalUsers: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch summary statistics
        const statsResponse = await api.get('/admin/dashboard/stats');
        setStats(statsResponse.data);

        // Fetch revenue data
        const revenueResponse = await api.get('/admin/dashboard/revenue');
        setRevenueData(revenueResponse.data);

        // Fetch latest orders
        const ordersResponse = await api.get('/admin/dashboard/latest-orders');
        setLatestOrders(ordersResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
          Dashboard | Admin
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
                Dashboard
              </Typography>
            </div>
            <div>
              <Grid
                container
                spacing={3}
              >
                <Grid
                  xs={12}
                  md={3}
                >
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <ShoppingBagIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label='Tổng đơn hàng'
                    value={stats.totalOrders}
                  />
                </Grid>
                <Grid
                  xs={12}
                  md={3}
                >
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'success.main',
                          color: 'success.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <ShoppingCartIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label='Tổng sản phẩm'
                    value={stats.totalProducts}
                  />
                </Grid>
                <Grid
                  xs={12}
                  md={3}
                >
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'warning.main',
                          color: 'warning.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <CurrencyDollarIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label='Tổng doanh thu'
                    value={`${stats.totalRevenue.toLocaleString('vi-VN')}đ`}
                  />
                </Grid>
                <Grid
                  xs={12}
                  md={3}
                >
                  <OverviewSummary
                    icon={
                      <Avatar
                        sx={{
                          backgroundColor: 'info.main',
                          color: 'info.contrastText',
                          height: 56,
                          width: 56
                        }}
                      >
                        <SvgIcon>
                          <UsersIcon />
                        </SvgIcon>
                      </Avatar>
                    }
                    label='Tổng người dùng'
                    value={stats.totalUsers}
                  />
                </Grid>
                <Grid xs={12}>
                  <OverviewKpi
                    chartSeries={[
                      {
                        data: revenueData.map(item => item.revenue),
                        name: 'Doanh thu'
                      }
                    ]}
                    stats={[
                      {
                        label: 'Doanh thu hôm nay',
                        value: revenueData.length > 0 
                          ? `${revenueData[revenueData.length - 1]?.revenue?.toLocaleString('vi-VN') || 0}đ`
                          : '0đ'
                      },
                      {
                        label: 'Đơn hàng hôm nay',
                        value: revenueData.length > 0 
                          ? revenueData[revenueData.length - 1]?.orders || 0
                          : 0
                      },
                      {
                        label: 'Đơn hàng đang xử lý',
                        value: stats.pendingOrders || 0
                      },
                      {
                        label: 'Đơn hàng đã hoàn thành',
                        value: stats.completedOrders || 0
                      },
                      {
                        label: 'Đơn hàng đã hủy',
                        value: stats.cancelledOrders || 0
                      }
                    ]}
                  />
                </Grid>
                <Grid xs={12}>
                  <OverviewLatestCustomers
                    customers={latestOrders.map(order => ({
                      id: order.id,
                      name: order.customer_name,
                      email: order.customer_email,
                      orders: order.total_orders,
                      amountSpent: order.total_spent,
                      createdAt: new Date(order.created_at).getTime(),
                      isOnboarded: true
                    }))}
                  />
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
