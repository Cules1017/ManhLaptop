import { useQuery } from '@apollo/client';
import Link from 'next/link';
import {
  FaShoppingCart,
  FaRegHeart,
  FaUser,
  FaSignOutAlt,
  FaBars,
} from 'react-icons/fa';
import { CART_COUNT } from '../../apollo/client/queries';
import { gql } from '@apollo/client';
import { useState, useEffect, useRef } from 'react';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';

import Logo from '../logo';
import SearchBox from '../search-box';

const GET_CART = gql`
  query GetCart {
    cart {
      cartCount
      items {
        id
        quantity
        product {
          id
          name
          price
          image
        }
      }
    }
  }
`;

export default function HeaderDesktop({ user }) {
  const { data: cart, loading, error } = useQuery(GET_CART);
  const { cartCount, refreshCartCount } = useCart();
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartDropdownRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        if (response && response.data) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    try {
      const response = await productService.getCart();
      if (response && response.status && response.data) {
        setCartItems(Array.isArray(response.data) ? response.data : response.data.items || []);
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
                <FaShoppingCart color="#808080" />
                <p>
                  <sup className="items-total">{cartCount}</sup> Items
                </p>
              </a>
            </Link>
            {showCartDropdown && (
              <div className="cart-dropdown">
                {user ? (
                  cartItems.length > 0 ? (
                    <ul>
                      {cartItems.slice(0, 3).map((item) => (
                        <li key={item.id} className="cart-dropdown-item">
                          <img src={item.product?.image} alt={item.product?.name} />
                          <div>
                            <div className="cart-dropdown-name">{item.product?.name}</div>
                            <div className="cart-dropdown-qty">Số lượng: {item.quantity}</div>
                            <div className="cart-dropdown-price">Giá: {item.product?.price}₫</div>
                          </div>
                        </li>
                      ))}
                      {cartItems.length > 3 && (
                        <li className="cart-dropdown-viewall">
                          <Link href="/cart">
                            <a>Xem tất cả ({cartItems.length}) sản phẩm</a>
                          </Link>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="cart-dropdown-empty">Giỏ hàng của bạn đang trống.</div>
                  )
                ) : (
                  <div className="cart-dropdown-empty">Vui lòng đăng nhập để xem giỏ hàng.</div>
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
              <FaRegHeart color="#808080" />
              <p>Wishlist</p>
            </a>
          </Link>
          {!user && (
            <Link href="/user/login">
              <a className="nav-buttons-signin">
                <FaUser color="#808080" />
                <p>Sign In</p>
              </a>
            </Link>
          )}
          {user && (
            <>
              <Link href="/orders">
                <a className="nav-buttons-orders">
                  <FaShoppingCart color="#1976d2" />
                  <p>Đơn hàng</p>
                </a>
              </Link>
              <Link href="/profile">
                <a className="nav-buttons-profile">
                  <FaUser color="#808080" />
                  <p>{user.name}</p>
                </a>
              </Link>
              <Link href="/user/signout">
                <a className="nav-buttons-signout">
                  <FaSignOutAlt />
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        /* Header Top */
        .header {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 28px 10vw;
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
          font-size: 14px;
          text-decoration: none;
          color: #808080;
        }
        .nav-buttons .items-total {
          font-size: 12px;
          align-self: flex-end;
        }
        .nav-buttons .nav-buttons-signout {
          margin-left: 12px;
        }
        .nav-buttons a:hover {
          text-decoration: underline;
        }
        .nav-buttons a p {
          margin-left: 8px;
        }
        /* Header Bottom */
        .header-bottom {
          padding: 0px 10vw;
          border-top: 2px solid #f5f5f5;
        }
        .header-bottom .all-categories-box {
          height: 100%;
          display: flex;
          align-items: center;
          /* Border */
          border-right: 2px solid #f5f5f5;
          padding-top: 20px;
          padding-bottom: 20px;
          padding-right: 48px;
        }
        .header-bottom .all-categories-box select {
          height: 100%;
          padding-left: 15px;
          font-family: Roboto;
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          line-height: 60px;
          color: #808080;
          border: none;
          background: none;
        }
        .header-bottom .all-categories-box select:focus {
          outline: none;
        }
        .header-bottom .main-nav {
          display: flex;
          align-items: center;
        }
        .header-bottom .main-nav a {
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          color: #666666;
          text-decoration: none;
          margin-left: 16px;
          margin-right: 16px;
        }
        .header-bottom .main-nav a:hover {
          text-decoration: underline;
        }
        .header-bottom .settings {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .header-bottom .settings .menu-dropdown {
          /* Border */
          border-left: 2px solid #f5f5f5;
          padding: 20px 24px;
        }
        .header-bottom .settings .menu-dropdown p {
          font-style: normal;
          font-weight: 500;
          font-size: 14px;
          color: #b3b3b3;
        }
        .cart-hover-area { position: relative; }
        .cart-dropdown {
          position: absolute;
          top: 40px;
          right: 0;
          width: 340px;
          background: #fff;
          border: 1px solid #eee;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          border-radius: 8px;
          z-index: 100;
          padding: 16px 0 0 0;
        }
        .cart-dropdown ul {
          list-style: none;
          margin: 0;
          padding: 0 16px 0 16px;
          max-height: 320px;
          overflow-y: auto;
        }
        .cart-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .cart-dropdown-item img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 4px;
          background: #fafafa;
        }
        .cart-dropdown-name {
          font-weight: 500;
          font-size: 15px;
          margin-bottom: 2px;
        }
        .cart-dropdown-qty, .cart-dropdown-price {
          font-size: 13px;
          color: #888;
        }
        .cart-dropdown-empty {
          padding: 24px 16px;
          text-align: center;
          color: #888;
        }
        .cart-dropdown-footer {
          border-top: 1px solid #eee;
          padding: 12px 16px;
          text-align: right;
        }
        .cart-dropdown-footer a {
          color: #1875f0;
          font-weight: 500;
        }
        .cart-dropdown-viewall {
          text-align: center;
          padding: 8px 0;
          font-weight: 500;
          color: #1875f0;
          cursor: pointer;
        }
        .cart-dropdown-viewall a {
          color: #1875f0;
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}
