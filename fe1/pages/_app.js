import '../public/reset.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from '../context/CartContext';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover />
    </CartProvider>
  );
}
