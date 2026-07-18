import PageContainer from './page-container';
import Header from './header';
import Footer from './footer';

export default function Page({ title, description, children }) {
  return (
    <PageContainer title={title} description={description}>
      <Header />

      <div className="content">{children}</div>

      <Footer />
      <style jsx>{`
        .content {
          display: flex;
          align-items: stretch;
          flex-direction: column;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px 80px;
          min-height: calc(100vh - 200px);
        }
        @media (max-width: 768px) {
          .content {
            padding: 24px 12px;
          }
        }
      `}</style>
    </PageContainer>
  );
}
