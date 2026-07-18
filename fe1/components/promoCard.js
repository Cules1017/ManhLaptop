export default function PromoCard() {
  return (
    <div className="promo-card ecommerce-card">
      <div className="content">
        <p className="eyebrow">Ưu đãi đặc biệt</p>
        <p className="title text-gradient">Laptop chính hãng</p>
        <p className="description">Miễn phí giao hàng - Trả góp 0% - Bảo hành 12 tháng</p>
        <a className="cta" href="/">
          Mua ngay
        </a>
      </div>

      <style jsx>{`
        .promo-card {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
          border: 1px solid var(--accent-glow);
        }

        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          height: 100%;
          padding: 24px 16px;
        }

        .promo-card .eyebrow {
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0;
          font-weight: 600;
        }

        .promo-card .title {
          font-weight: 800;
          font-size: 22px;
          line-height: 1.3;
          margin: 0;
        }

        .promo-card .description {
          font-weight: 400;
          font-size: 13px;
          line-height: 1.4;
          color: var(--text-muted);
          margin: 0;
        }

        .promo-card .cta {
          margin-top: 12px;
          padding: 10px 24px;
          background: var(--accent);
          color: #fff;
          border: 1px solid var(--accent);
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-decoration: none;
          transition: all var(--transition-fast);
          box-shadow: 0 4px 10px var(--accent-glow);
        }

        .promo-card .cta:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 15px var(--accent-glow);
        }

        @media (max-width: 1000px) {
          .promo-card {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
