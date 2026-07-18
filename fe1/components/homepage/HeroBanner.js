import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroBanner({ settings }) {
  if (!settings?.hero_title) {
    return null;
  }

  // Use the API image if provided, otherwise fallback to a high-quality Unsplash lifestyle tech image
  const backgroundUrl = settings.hero_image_url 
    ? `http://127.0.0.1:8000${settings.hero_image_url}` 
    : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop';

  const handleScrollToProducts = (e) => {
    e.preventDefault();
    const productSection = document.getElementById('product');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero-banner">
      <div className="hero-bg" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="hero-gradient-overlay"></div>

      <div className="hero-container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="hero-title">{settings.hero_title}</h1>
          
          {settings.hero_subtitle && (
            <p className="hero-subtitle">
              {settings.hero_subtitle.split('. ').map((sentence, i) => (
                <span key={i}>
                  {sentence}{i !== settings.hero_subtitle.split('. ').length - 1 ? '.' : ''}<br/>
                </span>
              ))}
            </p>
          )}

          {settings.hero_button_text && (
            <div className="hero-actions">
              <a href="#product" onClick={handleScrollToProducts} className="btn-primary hero-btn">
                {settings.hero_button_text}
              </a>
            </div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .hero-banner {
          position: relative;
          width: 100%;
          flex: 1; /* Automatically takes all remaining space in the viewport wrapper */
          display: flex;
          align-items: center;
          padding: 60px 5%;
          overflow: hidden;
          background-color: #f5f5f5;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: right center;
          background-repeat: no-repeat;
          z-index: 0;
        }

        .hero-gradient-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.9) 35%, rgba(255,255,255,0.4) 60%, rgba(255,255,255,0) 100%);
        }

        .hero-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
        }

        .hero-content {
          max-width: 550px;
          padding: 20px 0;
        }

        .hero-title {
          font-size: clamp(2.2rem, 4vw, 3.5rem);
          font-weight: 700;
          line-height: 1.15;
          color: #111111;
          margin: 0 0 24px 0;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: #333333;
          line-height: 1.6;
          margin-bottom: 40px;
          font-weight: 500;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .hero-btn {
          width: max-content !important; /* Override global button 100% width */
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ef4444; 
          color: #fff;
          padding: 14px 40px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.05rem;
          transition: all 0.2s ease;
          border: none;
        }

        .hero-btn:hover {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        @media (max-width: 1024px) {
          .hero-gradient-overlay {
            background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.7) 100%);
          }
        }

        @media (max-width: 768px) {
          .hero-banner {
            padding: 40px 20px;
          }
          .hero-bg {
            background-position: center;
          }
          .hero-gradient-overlay {
            background: linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.3) 100%);
          }
          .hero-content {
            text-align: center;
            margin: 0 auto;
            margin-top: 10px;
            max-width: 100%;
          }
          .hero-actions {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}
