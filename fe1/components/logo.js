import Link from 'next/link';

export default function Logo() {
  return (
    <>
      <Link href="/">
        <a className="logo text-gradient">MANH STORE</a>
      </Link>
      <style jsx>{`
        .logo {
          font-weight: 900;
          font-size: 24px;
          line-height: 1.3;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
          transition: text-shadow var(--transition-smooth);
        }
        .logo:hover {
          text-shadow: 0 0 12px var(--accent-glow);
        }
      `}</style>
    </>
  );
}
