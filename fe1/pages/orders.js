import { useEffect, useState } from 'react';
import Page from '../components/page';
import Title from '../components/title';
import { apiRequest } from '../utils/apiRequest';
import StarRatings from 'react-star-ratings';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TABS = [
  { key: 'all', label: 'Tất cả đơn' },
  { key: 'pending', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang vận chuyển' },
  { key: 'completed', label: 'Đã giao' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await apiRequest('http://127.0.0.1:8000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status) {
          setOrders(res.data);
        } else {
          setError(res.message || 'Không lấy được danh sách đơn hàng');
        }
      } catch (err) {
        setError('Lỗi kết nối server');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleRatingChange = (productId, rating) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleCommentChange = (productId, comment) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }));
  };

  const handleSubmitReview = async (productId) => {
    if (!reviews[productId]?.rating) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await apiRequest('http://127.0.0.1:8000/api/review', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          rating: reviews[productId].rating,
          comment: reviews[productId].comment || ''
        })
      });

      if (res.status) {
        toast.success('Đánh giá thành công!');
        // Cập nhật lại danh sách đơn hàng để lấy rating mới
        const ordersRes = await apiRequest('http://127.0.0.1:8000/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ordersRes.status) {
          setOrders(ordersRes.data);
        }
      } else {
        toast.error(res.message || 'Đánh giá thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối server');
    } finally {
      setSubmitting(false);
    }
  };

  // Lọc theo tab và search
  const filteredOrders = orders.filter(order => {
    const matchTab = tab === 'all' ? true : order.status === tab;
    const matchSearch =
      !search ||
      order.id.toString().includes(search) ||
      order.items.some(item =>
        item.product?.name?.toLowerCase().includes(search.toLowerCase())
      );
    return matchTab && matchSearch;
  });

  return (
    <Page>
      <ToastContainer />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <Title title="Đơn hàng của tôi" />
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, borderBottom: '2px solid #f0f0f0', marginBottom: 18 }}>
          {TABS.map(t => (
            <div
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 0',
                cursor: 'pointer',
                borderBottom: tab === t.key ? '2.5px solid #1a94ff' : '2.5px solid transparent',
                color: tab === t.key ? '#1a94ff' : '#222',
                fontWeight: tab === t.key ? 700 : 500,
                fontSize: 17,
                transition: 'all 0.2s'
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <input
            type="text"
            placeholder="Tìm đơn hàng theo Mã đơn hàng hoặc Tên sản phẩm"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 16,
              marginRight: 12,
              background: '#fafbfc'
            }}
          />
          <button
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              border: 'none',
              background: '#1a94ff',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer'
            }}
            onClick={() => {}}
          >
            Tìm đơn hàng
          </button>
        </div>
        {/* List */}
        {loading && <div>Đang tải...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && filteredOrders.length === 0 && <div>Không có đơn hàng nào phù hợp.</div>}
        {!loading && !error && filteredOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {filteredOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 20, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <b>Mã đơn hàng:</b> #{order.id}
                  </div>
                  <div style={{ color: '#388e3c', fontWeight: 600 }}>{order.status}</div>
                </div>
                <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>Ngày đặt: {new Date(order.created_at).toLocaleString()}</div>
                <div style={{ marginBottom: 12 }}>
                  <b>Sản phẩm:</b>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
                    {order.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f7f7fa', borderRadius: 8, padding: 8, minWidth: 220 }}>
                        <img src={item.product?.image || item.product?.img_url} alt={item.product?.name} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6, background: '#fff' }} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{item.product?.name}</div>
                          <div style={{ color: '#888', fontSize: 13 }}>SL: {item.quantity}</div>
                          <div style={{ color: '#e53935', fontWeight: 600 }}>{parseInt(item.price).toLocaleString()}₫</div>
                          {order.status === 'completed' && (
                            <div
                              style={{
                                marginTop: 12,
                                background: '#f8fafc',
                                border: '1px solid #e0e7ef',
                                borderRadius: 10,
                                boxShadow: '0 2px 8px rgba(30,136,229,0.06)',
                                padding: 16,
                                minWidth: 240,
                                maxWidth: 340,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <StarRatings
                                  rating={item.review ? item.review.rating : (reviews[item.product.id]?.rating || 0)}
                                  starRatedColor="#F9AD3D"
                                  numberOfStars={5}
                                  name={`rating-${item.product.id}`}
                                  starDimension="22px"
                                  starSpacing="2px"
                                  changeRating={item.review ? undefined : (rating => handleRatingChange(item.product.id, rating))}
                                />
                                <span style={{ color: '#888', fontSize: 13, marginLeft: 4 }}>
                                  {item.review ? `${item.review.rating}/5` : (reviews[item.product.id]?.rating ? `${reviews[item.product.id].rating}/5` : '')}
                                </span>
                              </div>
                              <textarea
                                placeholder="Nhập đánh giá của bạn (không bắt buộc)"
                                value={item.review ? item.review.comment : (reviews[item.product.id]?.comment || '')}
                                onChange={e => handleCommentChange(item.product.id, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: 10,
                                  borderRadius: 6,
                                  border: '1px solid #cfd8dc',
                                  fontSize: 14,
                                  minHeight: 60,
                                  background: item.review ? '#f3f3f3' : '#fff',
                                  resize: 'vertical',
                                  boxSizing: 'border-box',
                                }}
                                disabled={!!item.review}
                              />
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {item.review ? (
                                  <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 15, alignSelf: 'center' }}>Đã đánh giá</span>
                                ) : (
                                  <button
                                    onClick={() => handleSubmitReview(item.product.id)}
                                    disabled={submitting}
                                    style={{
                                      padding: '8px 20px',
                                      borderRadius: 6,
                                      border: 'none',
                                      background: submitting ? '#90caf9' : '#1976d2',
                                      color: '#fff',
                                      fontSize: 15,
                                      fontWeight: 600,
                                      cursor: submitting ? 'not-allowed' : 'pointer',
                                      boxShadow: '0 2px 6px rgba(25,118,210,0.08)',
                                      transition: 'background 0.2s',
                                    }}
                                  >
                                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <div><b>Ghi chú:</b> {order.note || <span style={{ color: '#bbb' }}>(Không có)</span>}</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#e53935' }}>Tổng: {parseInt(order.total_price).toLocaleString()}₫</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
} 