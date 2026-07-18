import { useEffect, useState } from 'react';
import PageContainer from '../components/page-container';
import Header from '../components/header';
import Footer from '../components/footer';
import ProductSection from '../components/productSection';
import HeroBanner from '../components/homepage/HeroBanner';
import TrustBadges from '../components/homepage/TrustBadges';
import PartnerLogos from '../components/homepage/PartnerLogos';
import { homepageService } from '../services/homepageService';

export default function Index() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await homepageService.getSettings();
        if (res?.status && res?.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch homepage settings', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <PageContainer title="MANH STORE - Trang chủ">
      <Header />
      
      {/* Viewport exact height wrapper for Banner and Marquee */}
      {settings && (
        <div className="hero-viewport-wrapper">
          <HeroBanner settings={settings} />
          <TrustBadges badges={settings.trust_badges} />
        </div>
      )}

      {/* Full width sections below fold */}
      {settings && (
        <div className="full-width-section">
          <PartnerLogos logos={settings.partner_logos} />
        </div>
      )}

      {/* Constrained sections */}
      <div className="content">
        <ProductSection />
      </div>

      <Footer />

      <style jsx>{`
        .hero-viewport-wrapper {
          width: 100%;
          height: calc(100vh - 75px);
          height: calc(100dvh - 75px); /* dynamic viewport height */
          min-height: 550px; /* Safe minimum so content doesn't break on extremely small screens */
          display: flex;
          flex-direction: column;
        }
        .full-width-section {
          width: 100%;
        }
        .content {
          display: flex;
          align-items: stretch;
          flex-direction: column;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px 80px;
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
