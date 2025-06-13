import { useTheme } from '@mui/material/styles';
import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import  {Chart}  from 'src/components/chart';

export default function OverviewKpi(props) {
  const { chartSeries, stats } = props;
  const theme = useTheme();

  const chartOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    colors: [theme.palette.primary.main],
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1,
      type: 'solid'
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 2,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    stroke: {
      width: 2
    },
    theme: {
      mode: theme.palette.mode
    },
    xaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: theme.palette.text.secondary
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -10,
        style: {
          colors: theme.palette.text.secondary
        }
      }
    }
  };

  return (
    <Card>
      <CardHeader title="Revenue Overview" />
      <CardContent>
        <Stack spacing={3}>
          <Chart
            height={350}
            options={chartOptions}
            series={chartSeries}
            type="line"
          />
          <Stack
            direction="row"
            spacing={3}
            sx={{
              '& > *': {
                flex: 1
              }
            }}
          >
            {stats.map((stat) => (
              <div key={stat.label}>
                <Typography
                  color="text.secondary"
                  variant="overline"
                >
                  {stat.label}
                </Typography>
                <Typography variant="h6">
                  {stat.value}
                </Typography>
              </div>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
