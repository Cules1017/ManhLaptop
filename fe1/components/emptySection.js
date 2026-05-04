import Link from 'next/link';

const NAME_LABELS = {
  cart: 'giỏ hàng',
  wishlist: 'danh sách yêu thích',
  orders: 'đơn hàng',
};

export default function EmptySection({ name }) {
  const label = NAME_LABELS[name] || name;
  return (
    <div className="empty-container">
      <p className="empty-message">
        {label ? `Chưa có sản phẩm nào trong ${label}.` : 'Danh sách đang trống.'}
      </p>
      <Link href="/">
        <a className="back-home">Quay lại trang chủ</a>
      </Link>
      <style jsx>{`
        .empty-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 60px 20px;
          text-align: center;
        }
        .empty-message {
          margin: 0;
          font-weight: 500;
          font-size: 18px;
          color: #666;
        }
        .back-home {
          padding: 10px 24px;
          background: #e53935;
          color: #fff;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s;
        }
        .back-home:hover {
          background: #c62828;
        }
      `}</style>
    </div>
  );
}
