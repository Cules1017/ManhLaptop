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
          padding: 20px 20px 40px;
          min-height: 60vh;
        }
        @media (max-width: 768px) {
          .content {
            padding: 12px;
          }
        }
      `}</style>
    </PageContainer>
  );
}
