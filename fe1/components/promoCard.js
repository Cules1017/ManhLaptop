export default function PromoCard() {
  return (
    <div className="promo-card">
      <p className="eyebrow">Ưu đãi đặc biệt</p>
      <p className="title">Laptop chính hãng</p>
      <p className="description">Miễn phí giao hàng - Trả góp 0% - Bảo hành 12 tháng</p>
      <a className="cta" href="/">
        Mua ngay
      </a>

      <style jsx>{`
        .promo-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #e53935 0%, #d81b60 100%);
          color: #fff;
          border-radius: 8px;
          padding: 24px 16px;
          box-shadow: 0 4px 16px rgba(229, 57, 53, 0.2);
          text-align: center;
        }
        .promo-card .eyebrow {
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.9;
          margin: 0;
        }
        .promo-card .title {
          font-weight: 700;
          font-size: 20px;
          line-height: 1.3;
          margin: 0;
        }
        .promo-card .description {
          font-weight: 400;
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
          margin: 0;
        }
        .promo-card .cta {
          margin-top: 8px;
          padding: 8px 16px;
          background: #fff;
          color: #e53935;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .promo-card .cta:hover {
          transform: scale(1.05);
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
