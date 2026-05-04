import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { Chart } from 'src/components/chart';

const STATUS_VI = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const PAYMENT_VI = {
  COD: 'COD',
  bank_transfer: 'Chuyển khoản',
  vnpay: 'VNPay',
  momo: 'MoMo',
};

function formatShortDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = String(isoDate).split('-');
  if (!d) return isoDate;
  return `${d}/${m}`;
}

export function DashboardAnalyticsCharts({ analytics }) {
  const theme = useTheme();

  const statusChart = useMemo(() => {
    if (!analytics?.ordersByStatus) return null;
    const order = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
    const labels = order.map((k) => STATUS_VI[k] || k);
    const series = order.map((k) => Number(analytics.ordersByStatus[k] || 0));
    const empty = series.every((v) => v === 0);
    return { labels, series, empty };
  }, [analytics]);

  const paymentChart = useMemo(() => {
    const raw = analytics?.ordersByPayment || {};
    const entries = Object.entries(raw)
      .map(([k, v]) => [k, Number(v)])
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      return {
        categories: ['—'],
        series: [{ name: 'Đơn hàng', data: [0] }],
      };
    }
    return {
      categories: entries.map(([k]) => PAYMENT_VI[k] || k),
      series: [{ name: 'Số đơn', data: entries.map(([, v]) => v) }],
    };
  }, [analytics]);

  const volumeChart = useMemo(() => {
    const rows = analytics?.orderVolume || [];
    return {
      categories: rows.map((r) => formatShortDate(r.date)),
      series: [{ name: 'Đơn mới', data: rows.map((r) => Number(r.orders || 0)) }],
    };
  }, [analytics]);

  const donutColors = [
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.error.main,
  ];

  if (!analytics) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Đơn theo trạng thái" subheader="Tất cả thời gian" />
          <CardContent>
            {statusChart?.empty ? (
              <Typography
                color="text.secondary"
                sx={{ py: 14, textAlign: 'center' }}
              >
                Chưa có đơn hàng
              </Typography>
            ) : (
              <Chart
                type="donut"
                height={320}
                series={statusChart?.series || []}
                options={{
                  labels: statusChart?.labels || [],
                  colors: donutColors,
                  legend: { show: true, position: 'bottom', fontSize: '12px' },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: '68%',
                        labels: {
                          show: true,
                          total: {
                            show: true,
                            label: 'Tổng đơn',
                            formatter: () =>
                              String(
                                (statusChart?.series || []).reduce((a, b) => a + b, 0)
                              ),
                          },
                        },
                      },
                    },
                  },
                  dataLabels: { enabled: false },
                  tooltip: {
                    y: { formatter: (val) => `${val} đơn` },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Phương thức thanh toán" subheader="Số lượng đơn" />
          <CardContent>
            <Chart
              type="bar"
              height={320}
              series={paymentChart.series}
              options={{
                colors: [theme.palette.secondary.main],
                legend: { show: false },
                plotOptions: {
                  bar: {
                    borderRadius: 6,
                    horizontal: true,
                    barHeight: '55%',
                  },
                },
                xaxis: {
                  categories: paymentChart.categories,
                  labels: { style: { colors: theme.palette.text.secondary } },
                },
                yaxis: {
                  labels: { style: { colors: theme.palette.text.secondary } },
                },
                tooltip: {
                  y: { formatter: (val) => `${val} đơn` },
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Đơn hàng 30 ngày" subheader="Theo ngày tạo đơn" />
          <CardContent>
            <Chart
              type="area"
              height={320}
              series={volumeChart.series}
              options={{
                colors: [theme.palette.primary.main],
                fill: {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 0.4,
                    opacityFrom: 0.5,
                    opacityTo: 0.05,
                  },
                },
                stroke: { curve: 'smooth', width: 2 },
                dataLabels: { enabled: false },
                xaxis: {
                  categories: volumeChart.categories,
                  tickAmount: 6,
                  labels: { style: { colors: theme.palette.text.secondary } },
                },
                yaxis: {
                  labels: { style: { colors: theme.palette.text.secondary } },
                  tickAmount: 4,
                  min: 0,
                },
                tooltip: {
                  y: { formatter: (val) => `${val} đơn` },
                },
              }}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
