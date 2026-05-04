import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';

import HeaderMobile from './header-mobile';
import HeaderDesktop from './header-desktop';

export default function Header() {
  const [user, setUser] = useState(null);
  const { refreshCartCount } = useCart();

  useEffect(() => {
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        const parsed = userStr ? JSON.parse(userStr) : null;
        setUser(parsed);
        // Refresh cart khi login/logout
        refreshCartCount?.();
      }
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header>
      <nav id="mobile">
        <HeaderMobile user={user} />
      </nav>

      <nav id="desktop">
        <HeaderDesktop user={user} />
      </nav>

      <style jsx>{`
        header {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
          background-color: #ffffff;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        #mobile {
          display: none;
        }
        @media (max-width: 1000px) {
          #mobile {
            display: flex;
          }
          #desktop {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
