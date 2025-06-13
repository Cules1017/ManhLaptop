import { useEffect, useState } from 'react';

import HeaderMobile from './header-mobile';
import HeaderDesktop from './header-desktop';
import { CartProvider } from '../../context/CartContext';

export default function Header() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Function to load user from localStorage
    const loadUser = () => {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        setUser(userStr ? JSON.parse(userStr) : null);
      }
    };
    loadUser();
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  return (
    <CartProvider>
      <header>
        <nav id="mobile">
          <HeaderMobile user={user} />
        </nav>

        <nav id="desktop">
          <HeaderDesktop user={user} />
        </nav>

        <style jsx>{`
          header {
            width: 100vw;
            display: flex;
            flex-direction: column;
            margin-bottom: 30px;
            background-color: #ffffff;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
          }
          #mobile {
            display: none;
            z-index: 0;
          }
          @media (max-width: 1000px) {
            #mobile {
              display: flex;
              z-index: 1;
            }
            #desktop {
              display: none;
              z-index: 0;
            }
          }
        `}</style>
      </header>
    </CartProvider>
  );
}
