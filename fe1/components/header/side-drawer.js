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
            background: rgba(0, 0, 0, 0.4);
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
            background: #fff;
            box-shadow: 2px 0px 5px rgba(0, 0, 0, 0.3);
            transform: translateX(-100%);
            transition: transform 0.3s ease-out;
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
            border-bottom: 1px solid #eee;
          }
          .side-drawer .items .item a {
            display: block;
            padding: 16px 24px;
            color: #333;
            text-decoration: none;
            font-weight: 500;
            font-size: 1rem;
            transition: background 0.2s;
          }
          .side-drawer .items .item a:hover,
          .side-drawer .items .item a:active {
            background: #f5f5f5;
            color: #e53935;
          }
          .side-drawer .close-drawer {
            align-self: flex-end;
            padding: 1rem 1.2rem;
            background: none;
            border: none;
            font-size: 1.4rem;
            color: #666;
            cursor: pointer;
          }
          .side-drawer .close-drawer:hover {
            color: #e53935;
          }
          .side-drawer .close-drawer:focus {
            outline: none;
          }
        `}</style>
      </div>
    </>
  );
}
