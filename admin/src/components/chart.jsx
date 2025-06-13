import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';

export const Chart = (props) => {
  const { options, series, type, height } = props;
  const theme = useTheme();

  const chartOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
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
    legend: {
      show: false
    },
    plotOptions: {
      bar: {
        columnWidth: '40%'
      }
    },
    stroke: {
      width: 2
    },
    theme: {
      mode: theme.palette.mode
    },
    tooltip: {
      theme: theme.palette.mode
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
    },
    ...options
  };

  return (
    <ReactApexChart
      options={chartOptions}
      series={series}
      type={type}
      height={height}
    />
  );
};

Chart.propTypes = {
  options: PropTypes.object,
  series: PropTypes.array.isRequired,
  type: PropTypes.oneOf(['line', 'area', 'bar', 'pie']).isRequired,
  height: PropTypes.number
}; 