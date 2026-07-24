import Link from 'next/link';
import {
  FaShoppingCart,
  FaRegHeart,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
} from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { getFinalPrice, formatVND } from '../../utils/price';

import Logo from '../logo';
import SearchBox from '../search-box';

export default function HeaderDesktop({ user }) {
  const { cartCount, refreshCartCount } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartDropdownRef = useRef(null);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const response = await productService.getCart();
      if (response && response.status && response.data) {
        setCartItems(
          Array.isArray(response.data) ? response.data : response.data.items || []
        );
      } else {
        setCartItems([]);
      }
    } catch {
      setCartItems([]);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    }
    if (showCartDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCartDropdown]);

  return (
    <>
      <div className="header header-top">
        <Logo />

        <SearchBox />

        <div className="nav-buttons">
          <div
            className="nav-buttons-items cart-hover-area"
            onMouseEnter={async () => {
              setShowCartDropdown(true);
              await refreshCartCount();
              fetchCart();
            }}
            onMouseLeave={() => setShowCartDropdown(false)}
            ref={cartDropdownRef}
            style={{ position: 'relative' }}
          >
            <Link href="/cart">
              <a>
                <div className="icon-wrapper">
                  <FaShoppingCart size={20} />
                  <sup className="items-total">{cartCount}</sup>
                </div>
                <p>Giỏ hàng</p>
              </a>
            </Link>
            {showCartDropdown && (
              <div className="cart-dropdown">
                {user ? (
                  cartItems.length > 0 ? (
                    <ul>
                      {cartItems.slice(0, 3).map((item) => {
                        const unitPrice = getFinalPrice(item.product || {});
                        return (
                          <li key={item.id} className="cart-dropdown-item">
                            <img src={item.product?.image} alt={item.product?.name} />
                            <div>
                              <div className="cart-dropdown-name">
                                {item.product?.name}
                              </div>
                              <div className="cart-dropdown-qty">
                                Số lượng: {item.quantity}
                              </div>
                              <div className="cart-dropdown-price">
                                Giá: {formatVND(unitPrice)}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                      {cartItems.length > 3 && (
                        <li className="cart-dropdown-viewall">
                          <Link href="/cart">
                            <a>Xem tất cả ({cartItems.length}) sản phẩm</a>
                          </Link>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="cart-dropdown-empty">Giỏ hàng đang trống.</div>
                  )
                ) : (
                  <div className="cart-dropdown-empty">
                    Vui lòng đăng nhập để xem giỏ hàng.
                  </div>
                )}
                <div className="cart-dropdown-footer">
                  <Link href="/cart">
                    <a>Xem giỏ hàng</a>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href="/wishlist">
            <a className="nav-buttons-wishlist">
              <FaRegHeart size={20} />
              <p>Yêu thích</p>
            </a>
          </Link>
          <Link href="/contact">
            <a className="nav-buttons-contact">
              <FaClipboardList size={20} />
              <p>Liên hệ</p>
            </a>
          </Link>
          {!user && (
            <Link href="/user/login">
              <a className="nav-buttons-signin">
                <FaUser size={20} />
                <p>Đăng nhập</p>
              </a>
            </Link>
          )}
          {user && (
            <>
              <Link href="/orders">
                <a className="nav-buttons-orders">
                  <FaClipboardList size={20} />
                  <p>Đơn hàng</p>
                </a>
              </Link>
              <Link href="/profile">
                <a className="nav-buttons-profile">
                  <FaUser size={20} />
                  <p>{user.name}</p>
                </a>
              </Link>
              <Link href="/user/signout">
                <a className="nav-buttons-signout" title="Đăng xuất">
                  <FaSignOutAlt size={20} />
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 20px 10vw;
          gap: 20px;
        }
        .nav-buttons {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .nav-buttons a {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-left: 32px;
          font-style: normal;
          font-weight: 500;
          font-size: 15px;
          text-decoration: none;
          color: var(--text-muted);
          transition: all var(--transition-smooth);
        }
        .nav-buttons .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .nav-buttons .items-total {
          position: absolute;
          top: -8px;
          right: -10px;
          font-size: 10px;
          font-weight: bold;
          background: var(--accent);
          color: var(--text-main);
          border-radius: 12px;
          padding: 2px 5px;
          box-shadow: 0 0 8px var(--accent-glow);
        }
        .nav-buttons .nav-buttons-signout {
          margin-left: 16px;
        }
        .nav-buttons a:hover {
          color: var(--accent);
        }
        .nav-buttons a p {
          margin-left: 8px;
          font-size: 14px;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          white-space: nowrap;
          transition: all 0.3s ease;
        }
        .nav-buttons a:hover p {
          max-width: 150px;
          opacity: 1;
        }
        .cart-hover-area {
          position: relative;
        }
        .cart-dropdown {
          position: absolute;
          top: 48px;
          right: 0;
          width: 380px;
          background: var(--surface);
          backdrop-filter: blur(16px);
          border: 1px solid var(--surface-border);
          box-shadow: var(--shadow-lg);
          border-radius: var(--radius);
          z-index: 100;
          padding: 16px 0 0 0;
          overflow: hidden;
        }
        .cart-dropdown ul {
          list-style: none;
          margin: 0;
          padding: 0 16px;
          max-height: 320px;
          overflow-y: auto;
        }
        .cart-dropdown-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 0;
          border-bottom: 1px solid var(--surface-border);
        }
        .cart-dropdown-item img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          border-radius: var(--radius-sm);
          background: var(--surface-hover);
        }
        .cart-dropdown-name {
          font-weight: 500;
          font-size: 15px;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .cart-dropdown-qty,
        .cart-dropdown-price {
          font-size: 13px;
          color: var(--text-muted);
        }
        .cart-dropdown-empty {
          padding: 32px 16px;
          text-align: center;
          color: var(--text-muted);
        }
        .cart-dropdown-footer {
          border-top: 1px solid var(--surface-border);
          padding: 16px;
          text-align: right;
          background: var(--surface-hover);
        }
        .cart-dropdown-footer a {
          color: var(--accent);
          font-weight: 600;
          margin: 0;
          transition: all var(--transition-fast);
        }
        .cart-dropdown-footer a:hover {
          color: var(--accent-hover);
        }
        .cart-dropdown-viewall {
          text-align: center;
          padding: 12px 0;
          font-weight: 500;
        }
        .cart-dropdown-viewall a {
          color: var(--accent);
          text-decoration: none;
          margin: 0;
        }
        .cart-dropdown-viewall a:hover {
          color: var(--accent-hover);
        }
      `}</style>
    </>
  );
}
