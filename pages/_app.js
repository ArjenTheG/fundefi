import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { UtilsProvider } from '../contexts/UtilsContext';
import { UniquePolkadotProvider } from '../contexts/UniquePolkadotContext';
import Header from '../components/layout/Header';
import '../public/output.css';
import '../public/theme.css';

function MyApp({ Component, pageProps }) {
  return (
    <UtilsProvider>
      <UniquePolkadotProvider>
            <Header />
            <Component {...pageProps} />
            <ToastContainer hideProgressBar={false} position="top-right" autoClose={3000} newestOnTop={false} closeOnClick rtl={false} draggable pauseOnHover theme="light" />
      </UniquePolkadotProvider>
    </UtilsProvider>
  );
}

export default MyApp;
