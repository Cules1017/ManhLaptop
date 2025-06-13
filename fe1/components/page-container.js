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

      <main>{children}</main>

      <style jsx>{`
        main {
          display: flex;
          background-color: #fafafa;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          font-family: Roboto;
        }
      `}</style>
    </div>
  );
}
