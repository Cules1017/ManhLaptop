import Link from 'next/link';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmazonPay,
} from 'react-icons/fa';
import Logo from './logo';

export default function Footer() {
  return (
    <footer className="glass-panel">
      <div className="footer footer-top">
        <Logo />

        <div className="footer-nav">
          <Link href="/">
            <a className="nav-link">Shop</a>
          </Link>
          <Link href="/">
            <a className="nav-link">Journal</a>
          </Link>
          <Link href="/">
            <a className="nav-link">About</a>
          </Link>
          <Link href="/contact">
            <a className="nav-link">Contacts</a>
          </Link>
        </div>

        <div className="social-links">
          <Link href="/">
            <a className="social-icon">
              <FaFacebookF size="20px" />
            </a>
          </Link>
          <Link href="/">
            <a className="social-icon">
              <FaTwitter size="20px" />
            </a>
          </Link>
          <Link href="/">
            <a className="social-icon">
              <FaInstagram size="20px" />
            </a>
          </Link>
          <Link href="/">
            <a className="social-icon">
              <FaYoutube size="20px" />
            </a>
          </Link>
        </div>
      </div>
      <div className="footer footer-bottom">
        <div className="texts">
          <p>© 2025 Bản quyền thuộc về <span className="text-gradient">MANH STORE</span></p>
          <p className="link-hover">Chính sách bảo mật</p>
          <p className="link-hover">Điều khoản sử dụng</p>
        </div>
        <div className="payment-info">
          <p className="text text-gradient">Phương thức thanh toán</p>
          <div className="payment-methods">
            <div className="payment-icon">
              <FaCcVisa size="36px" />
            </div>
            <div className="payment-icon">
              <FaCcMastercard size="36px" />
            </div>
            <div className="payment-icon">
              <FaCcPaypal size="36px" />
            </div>
            <div className="payment-icon">
              <FaCcAmazonPay size="36px" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        footer {
          width: 100%;
          display: flex;
          flex-direction: column;
          margin-top: 60px;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          border-bottom: none;
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        
        /* Decorative top border */
        footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent), var(--secondary), transparent);
          opacity: 0.3;
        }

        .footer {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          padding: 40px 10vw;
          z-index: 1;
        }
        .footer-top {
          padding-bottom: 20px;
        }
        .footer-nav {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .nav-link {
          font-weight: 500;
          font-size: 16px;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--accent-hover);
        }
        .social-links {
          display: flex;
          gap: 20px;
        }
        .social-icon {
          color: var(--text-muted);
          background: var(--surface);
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--surface-border);
          transition: all var(--transition-smooth);
        }
        .social-icon:hover {
          color: var(--accent);
          background: var(--surface-hover);
          border-color: var(--accent);
          transform: translateY(-3px);
        }
        
        .footer-bottom {
          border-top: 1px solid var(--surface-border);
          padding-top: 30px;
          padding-bottom: 30px;
        }
        .texts {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .texts p {
          font-weight: 400;
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }
        .link-hover {
          cursor: pointer;
          transition: color var(--transition-fast);
        }
        .link-hover:hover {
          color: var(--text-main);
        }
        .payment-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .payment-info .text {
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
        }
        .payment-methods {
          display: flex;
          gap: 15px;
        }
        .payment-icon {
          color: var(--text-muted);
          transition: all var(--transition-smooth);
          opacity: 0.7;
          display: flex;
          align-items: center;
        }
        .payment-icon:hover {
          color: var(--accent);
          opacity: 1;
          transform: scale(1.1);
        }

        @media (max-width: 1000px) {
          .footer-top .footer-nav {
            display: none;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 30px;
          }
          .texts {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          .payment-info {
            flex-direction: column;
            gap: 15px;
          }
        }
        @media (max-width: 700px) {
          .footer {
            padding: 30px 5vw;
          }
          .footer-top {
            flex-direction: column;
            gap: 30px;
          }
        }
      `}</style>
    </footer>
  );
}
