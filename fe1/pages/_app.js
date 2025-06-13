import '../public/reset.css';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from '../context/CartContext';
import '../styles/global.css';

export default function App({ Component, pageProps }) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ApolloProvider client={apolloClient}>
      <CartProvider>
        <Component {...pageProps} />
        <ToastContainer />
      </CartProvider>
    </ApolloProvider>
  );
}
