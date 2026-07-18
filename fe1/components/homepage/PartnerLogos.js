export default function PartnerLogos({ logos = [] }) {
  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <section className="partner-logos">
      <div className="logos-container">
        {logos.map((logo, index) => (
          <div className="logo-item" key={logo.id || index}>
            <img src={`http://127.0.0.1:8000${logo.url}`} alt="Partner logo" />
          </div>
        ))}
      </div>

      <style jsx>{`
        .partner-logos {
          padding: 60px 0;
          width: 100%;
          position: relative;
        }

        .partner-logos::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--surface-border), transparent);
        }

        .logos-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 40px;
          padding: 0 20px;
          align-items: center;
          justify-items: center;
        }

        .logo-item {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 80px;
          padding: 20px;
          border-radius: var(--radius);
          background: var(--surface);
          border: 1px solid transparent;
          transition: all var(--transition-smooth);
        }

        .logo-item img {
          max-height: 40px;
          max-width: 100%;
          object-fit: contain;
          opacity: 0.8;
          mix-blend-mode: multiply;
          transition: all var(--transition-smooth);
        }

        .logo-item:hover {
          background: var(--surface-hover);
          border-color: var(--surface-border);
          box-shadow: var(--shadow-sm);
          transform: translateY(-3px);
        }

        .logo-item:hover img {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .partner-logos {
            padding: 40px 0;
          }
          .logos-container {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 20px;
          }
          .logo-item {
            height: 60px;
            padding: 10px;
          }
          .logo-item img {
            max-height: 30px;
          }
        }
      `}</style>
    </section>
  );
}
