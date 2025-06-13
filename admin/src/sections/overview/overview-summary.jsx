import PropTypes from 'prop-types';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export const OverviewSummary = (props) => {
  const { icon, label, value } = props;

  return (
    <Card>
      <CardContent>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography
              color="text.secondary"
              variant="overline"
            >
              {label}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Stack>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
};

OverviewSummary.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};
