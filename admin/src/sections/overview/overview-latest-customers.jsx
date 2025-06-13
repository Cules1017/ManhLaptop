import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const OverviewLatestCustomers = (props) => {
  const { customers } = props;

  return (
    <Card>
      <CardHeader title="Latest Customers" />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Spent</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const createdAt = format(new Date(customer.createdAt), 'MMM dd, yyyy');
              const amountSpent = parseFloat(customer.amountSpent) || 0;

              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Stack
                      alignItems="center"
                      direction="row"
                      spacing={2}
                    >
                      <Avatar src={customer.avatar} />
                      <Box>
                        <Typography variant="subtitle2">
                          {customer.name}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          variant="body2"
                        >
                          {createdAt}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {customer.orders}
                  </TableCell>
                  <TableCell>
                    {`${amountSpent.toLocaleString('vi-VN')}đ`}
                  </TableCell>
                  <TableCell>
                    {customer.isOnboarded ? 'Active' : 'Inactive'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

OverviewLatestCustomers.propTypes = {
  customers: PropTypes.array
};
