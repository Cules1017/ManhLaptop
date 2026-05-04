import Link from 'next/link';

export default function Logo() {
  return (
    <>
      <Link href="/">
        <a className="logo">MANH STORE</a>
      </Link>
      <style jsx>{`
        .logo {
          font-weight: 900;
          font-size: 22px;
          line-height: 1.3;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          color: #e53935;
          text-decoration: none;
          white-space: nowrap;
        }
        .logo:hover {
          color: #c62828;
        }
      `}</style>
    </>
  );
}
