import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';

export const Logo = (props) => {
  const { color: colorProp = 'primary' } = props;
  const theme = useTheme();

  const color = colorProp === 'primary'
    ? theme.palette.primary.main
    : colorProp === 'black'
      ? '#1D262D' : '#FFFFFF';

  return (
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: "white" ,width: '200px', height: '100%', textDecoration: 'none', textUnderlinePosition: 'none'}}>
      MANH_STORE
    </div>
  );
};

Logo.propTypes = {
  color: PropTypes.oneOf(['black', 'primary', 'white'])
};
