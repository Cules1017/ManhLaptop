import Head from 'next/head';

export default function PageContainer({ title, description, children }) {
  return (
    <div className="container">
      <Head>
        <title>{title || 'MANH STORE - Bán hàng trực tuyến'}</title>
        {description !== false && (
          <meta
            name="description"
            content={
              description ||
              'MANH STORE là một trang web bán hàng trực tuyến được thiết kế để cung cấp cho khách hàng một trải nghiệm mua sắm trực tiếp từ nhà sản xuất.'
            }
          />
        )}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="page-transition">{children}</main>

      <style jsx>{`
        main {
          display: flex;
          background-color: transparent;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          min-height: 100vh;
        }
        .page-transition {
          animation: fadeIn var(--transition-smooth) forwards;
          width: 100%;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
