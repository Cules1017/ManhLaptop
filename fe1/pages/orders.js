import { useEffect, useState } from 'react';
import Page from '../components/page';
import Title from '../components/title';
import { apiRequest } from '../utils/apiRequest';
import StarRatings from 'react-star-ratings';
import { toast } from 'react-toastify';
import { formatVND } from '../utils/price';

const TABS = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'pending', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang vận chuyển' },
  { key: 'completed', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

const STATUS_META = {
  pending: { label: 'Đang xử lý', color: '#f57c00' },
  shipping: { label: 'Đang vận chuyển', color: '#1976d2' },
  completed: { label: 'Đã giao', color: '#2e7d32' },
  cancelled: { label: 'Đã huỷ', color: '#b71c1c' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [reviews, setReviews] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('http://127.0.0.1:8000/api/orders');
      if (res.status) {
        setOrders(res.data || []);
      } else {
        setError(res.message || 'Không lấy được danh sách đơn hàng');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRatingChange = (productId, rating) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], rating },
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], comment },
    }));
  };

  const handleSubmitReview = async (productId) => {
    if (!reviews[productId]?.rating) {
      toast.warn('Vui lòng chọn số sao đánh giá', { position: 'top-center' });
      return;
    }
    setSubmittingId(productId);
    try {
      const res = await apiRequest('http://127.0.0.1:8000/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating: reviews[productId].rating,
          comment: reviews[productId].comment || '',
        }),
      });

      if (res.status) {
        toast.success('Đánh giá thành công!', { position: 'top-center' });
        await fetchOrders();
      } else {
        toast.error(res.message || 'Đánh giá thất bại', { position: 'top-center' });
      }
    } catch {
      // popup đã hiện
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchTab = tab === 'all' ? true : order.status === tab;
    const matchSearch =
      !search ||
      String(order.id).includes(search) ||
      (order.items || []).some((item) =>
        item.product?.name?.toLowerCase().includes(search.toLowerCase())
      );
    return matchTab && matchSearch;
  });

  return (
    <Page>
      <div className="orders-wrapper">
        <Title title="Đơn hàng của tôi" />

        <div className="orders-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`orders-tab ${tab === t.key ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="orders-search">
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="orders-msg">Đang tải...</div>}
        {error && <div className="orders-msg orders-err">{error}</div>}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="orders-msg">Không có đơn hàng nào phù hợp.</div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const meta = STATUS_META[order.status] || { label: order.status, color: '#888' };
              return (
                <div key={order.id} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <b>Mã đơn hàng:</b> #{order.id}
                    </div>
                    <div className="order-status" style={{ color: meta.color }}>
                      {meta.label}
                    </div>
                  </div>
                  <div className="order-date">
                    Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                  </div>

                  <div className="order-items">
                    {(order.items || []).map((item) => (
                      <div key={item.id} className="order-item">
                        <img
                          src={item.product?.image || item.product?.img_url}
                          alt={item.product?.name}
                        />
                        <div className="order-item-info">
                          <div className="order-item-name">{item.product?.name}</div>
                          <div className="order-item-qty">SL: {item.quantity}</div>
                          <div className="order-item-price">{formatVND(item.price)}</div>
                        </div>

                        {order.status === 'completed' && (
                          <div className="order-review-box">
                            <div className="order-review-head">
                              <StarRatings
                                rating={
                                  item.review
                                    ? Number(item.review.rating)
                                    : reviews[item.product?.id]?.rating || 0
                                }
                                starRatedColor="#F9AD3D"
                                numberOfStars={5}
                                name={`rating-${order.id}-${item.id}`}
                                starDimension="22px"
                                starSpacing="2px"
                                changeRating={
                                  item.review
                                    ? undefined
                                    : (r) => handleRatingChange(item.product?.id, r)
                                }
                              />
                              <span className="order-review-rating-text">
                                {item.review
                                  ? `${item.review.rating}/5`
                                  : reviews[item.product?.id]?.rating
                                  ? `${reviews[item.product.id].rating}/5`
                                  : ''}
                              </span>
                            </div>
                            <textarea
                              placeholder="Nhập đánh giá của bạn (không bắt buộc)"
                              value={
                                item.review
                                  ? item.review.comment || ''
                                  : reviews[item.product?.id]?.comment || ''
                              }
                              onChange={(e) =>
                                handleCommentChange(item.product?.id, e.target.value)
                              }
                              disabled={!!item.review}
                              className={`order-review-textarea ${
                                item.review ? 'is-readonly' : ''
                              }`}
                            />
                            <div className="order-review-actions">
                              {item.review ? (
                                <span className="order-review-done">Đã đánh giá</span>
                              ) : (
                                <button
                                  onClick={() => handleSubmitReview(item.product?.id)}
                                  disabled={submittingId === item.product?.id}
                                  className="order-review-submit"
                                >
                                  {submittingId === item.product?.id
                                    ? 'Đang gửi...'
                                    : 'Gửi đánh giá'}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="order-foot">
                    <div>
                      <b>Ghi chú:</b>{' '}
                      {order.note || <span className="text-muted">(Không có)</span>}
                    </div>
                    <div className="order-total">Tổng: {formatVND(order.total_price)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style jsx>{`
        .orders-wrapper {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 16px;
          box-sizing: border-box;
        }
        .orders-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          border-bottom: 1px solid var(--surface-border);
          margin-bottom: 24px;
        }
        .orders-tab {
          background: none;
          border: none;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 2.5px solid transparent;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 15px;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }
        .orders-tab:hover {
          color: var(--text-main);
        }
        .orders-tab.active {
          border-bottom-color: var(--secondary);
          color: var(--secondary);
          font-weight: 700;
        }
        .orders-search {
          margin-bottom: 24px;
        }
        .orders-search input {
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--surface-border);
          font-size: 15px;
          background: var(--surface);
          color: var(--text-main);
          box-sizing: border-box;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .orders-search input:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .orders-msg {
          padding: 40px 16px;
          text-align: center;
          color: var(--text-muted);
          font-size: 16px;
        }
        .orders-err {
          color: var(--danger);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .order-card {
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          padding: 24px;
          background: var(--surface);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-smooth), box-shadow var(--transition-smooth);
        }
        .order-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-2px);
        }
        @media (max-width: 640px) {
          .order-card {
            padding: 16px;
          }
        }
        .order-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          flex-wrap: wrap;
          gap: 12px;
          color: var(--text-main);
        }
        .order-status {
          font-weight: 700;
          font-size: 14px;
          padding: 4px 12px;
          background: rgba(0,0,0,0.03);
          border-radius: 20px;
        }
        .order-date {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 16px;
        }
        .order-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .order-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
          background: var(--surface-hover);
          border-radius: var(--radius-sm);
          padding: 12px;
          flex-wrap: wrap;
        }
        .order-item img {
          width: 72px;
          height: 72px;
          object-fit: contain;
          border-radius: var(--radius-sm);
          background: #fff;
          border: 1px solid var(--surface-border);
          flex-shrink: 0;
        }
        .order-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1 1 180px;
        }
        .order-item-name {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-main);
        }
        .order-item-qty {
          color: var(--text-muted);
          font-size: 14px;
        }
        .order-item-price {
          color: var(--accent);
          font-weight: 600;
          font-size: 15px;
        }
        .order-review-box {
          background: var(--surface);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-sm);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1 1 260px;
        }
        .order-review-head {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .order-review-rating-text {
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
        }
        .order-review-textarea {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--surface-border);
          font-size: 14px;
          color: var(--text-main);
          min-height: 70px;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .order-review-textarea:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .order-review-textarea.is-readonly {
          background: var(--surface-hover);
          color: var(--text-muted);
        }
        .order-review-actions {
          display: flex;
          justify-content: flex-end;
        }
        .order-review-done {
          color: var(--success);
          font-weight: 600;
          font-size: 14px;
        }
        .order-review-submit {
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          border: none;
          background: var(--secondary);
          color: #fff;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .order-review-submit:hover:not(:disabled) {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .order-review-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .order-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--surface-border);
          flex-wrap: wrap;
          gap: 12px;
          color: var(--text-main);
        }
        .order-total {
          font-weight: 700;
          font-size: 18px;
          color: var(--accent);
        }
      `}</style>
    </Page>
  );
}
