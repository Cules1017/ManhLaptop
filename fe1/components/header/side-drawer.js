import Link from 'next/link';
import { FaTimes } from 'react-icons/fa';
import SearchBox from '../search-box';

export default function SideDrawer({ closeDrawer, user, isOpen }) {
  return (
    <>
      {isOpen && <div className="overlay" onClick={closeDrawer} />}
      <div className={`side-drawer ${isOpen ? 'show' : 'hide'}`} id="side-drawer">
        <button className="close-drawer" onClick={closeDrawer} aria-label="Đóng menu">
          <FaTimes />
        </button>

        <div className="search">
          <SearchBox />
        </div>

        <ul className="items">
          <li className="item">
            <Link href="/">
              <a onClick={closeDrawer}>Trang chủ</a>
            </Link>
          </li>
          <li className="item">
            <Link href="/cart">
              <a onClick={closeDrawer}>Giỏ hàng</a>
            </Link>
          </li>
          <li className="item">
            <Link href="/wishlist">
              <a onClick={closeDrawer}>Yêu thích</a>
            </Link>
          </li>
          {!user && (
            <li className="item">
              <Link href="/user/login">
                <a onClick={closeDrawer}>Đăng nhập</a>
              </Link>
            </li>
          )}
          {user && (
            <>
              <li className="item">
                <Link href="/orders">
                  <a onClick={closeDrawer}>Đơn hàng</a>
                </Link>
              </li>
              <li className="item">
                <Link href="/profile">
                  <a onClick={closeDrawer}>{user.name}</a>
                </Link>
              </li>
              <li className="item">
                <Link href="/user/signout">
                  <a onClick={closeDrawer}>Đăng xuất</a>
                </Link>
              </li>
            </>
          )}
        </ul>

        <style jsx>{`
          .overlay {
            position: fixed;
            inset: 0;
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(4px);
            z-index: 998;
          }
          .side-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            z-index: 999;
            top: 0;
            left: 0;
            width: 80%;
            max-width: 340px;
            height: 100vh;
            background: var(--bg-color);
            border-right: 1px solid var(--surface-border);
            box-shadow: var(--shadow-lg);
            transform: translateX(-100%);
            transition: transform var(--transition-smooth);
          }
          .side-drawer.show {
            transform: translateX(0);
          }
          .side-drawer .search {
            padding: 1rem;
          }
          .side-drawer .items {
            list-style: none;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
            width: 100%;
          }
          .side-drawer .items .item {
            border-bottom: 1px solid var(--surface-border);
          }
          .side-drawer .items .item a {
            display: block;
            padding: 16px 24px;
            color: var(--text-main);
            text-decoration: none;
            font-weight: 500;
            font-size: 1rem;
            transition: all var(--transition-fast);
          }
          .side-drawer .items .item a:hover,
          .side-drawer .items .item a:active {
            background: var(--surface-hover);
            color: var(--accent);
          }
          .side-drawer .close-drawer {
            align-self: flex-end;
            padding: 1rem 1.2rem;
            background: none;
            border: none;
            font-size: 1.4rem;
            color: var(--text-muted);
            cursor: pointer;
            transition: color var(--transition-fast);
          }
          .side-drawer .close-drawer:hover {
            color: var(--accent);
          }
          .side-drawer .close-drawer:focus {
            outline: none;
          }
        `}</style>
      </div>
    </>
  );
}
