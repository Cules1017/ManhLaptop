import PropTypes from 'prop-types';
import { format } from 'date-fns';
import numeral from 'numeral';
import EllipsisVerticalIcon from '@heroicons/react/24/solid/EllipsisVerticalIcon';
import {
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const OrdersTable = (props) => {
  const {
    count = 0,
    items = [],
    onPageChange = () => {},
    page = 0,
    rowsPerPage = 0,
    onRowsPerPageChange,
    statusMap = {},
    onStatusChange
  } = props;

  return (
    <div>
      <Scrollbar>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Note</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((order) => {
              const status = (statusMap && statusMap[order.status]) || { color: 'grey.500', label: order.status || 'Unknown' };
              const createdDate = format(order.createdAt, 'dd/MM/yyyy');
              const createdTime = format(order.createdAt, 'HH:mm');
              const totalAmount = numeral(order.totalAmount).format(`${order.currency}0,0.00`);
              return (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Typography color="inherit" variant="inherit">{createdDate}</Typography>
                    <Typography color="text.secondary" variant="inherit">{createdTime}</Typography>
                  </TableCell>
                  <TableCell>
                    <div>{order.customer.name}</div>
                    <div style={{ color: '#888', fontSize: 13 }}>{order.customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Stack direction="column" spacing={1}>
                      {order.products.map((p, idx) => (
                        <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                          <img src={p.image} alt={p.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, background: '#fafafa', border: '1px solid #eee' }} />
                          <span>{p.name} x{p.quantity}</span>
                        </Stack>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>{totalAmount}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>{order.note}</TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={e => props.onStatusChange && props.onStatusChange(order, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #ddd', background: status.color, color: '#fff', fontWeight: 600 }}
                    >
                      {Object.keys(statusMap).map(key => (
                        <option key={key} value={key} style={{ color: '#222' }}>{statusMap[key].label}</option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton>
                      <SvgIcon fontSize="small">
                        <EllipsisVerticalIcon />
                      </SvgIcon>
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Scrollbar>
      <Divider />
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </div>
  );
};

OrdersTable.propTypes = {
  items: PropTypes.array,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func
};
