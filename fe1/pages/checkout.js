import { useEffect, useState } from 'react';
import Page from '../components/page';
import Title from '../components/title';
import { productService } from '../services/productService';
import { apiRequest } from '../utils/apiRequest';
import { useRouter } from 'next/router';
import SuccessPopup from '../components/SuccessPopup';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      const cartRes = await productService.getCart();
      const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
      setCartItems(items);
      const productDetailPromises = items.map(item => productService.getProductById(item.product_id || item.product?.id));
      const productDetails = await Promise.all(productDetailPromises);
      setProducts(productDetails.map(res => res.data));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      const addressString = `${editData.name} - ${editData.phone} - ${editData.address}`;
      const res = await apiRequest('http://127.0.0.1:8000/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ address: addressString })
      });
      if (res.status) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setShowEdit(false);
      } else {
        alert(res.message || 'Cập nhật thất bại');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOrder = async () => {
    setOrdering(true);
    try {
      const token = localStorage.getItem('token');
      const items = cartItems.map(item => ({
        product_id: item.product_id || item.product?.id,
        quantity: item.quantity,
        price: parseFloat(products.find(p => p.id === (item.product_id || item.product?.id))?.price || 0)
      }));
      const total_price = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const res = await apiRequest('http://127.0.0.1:8000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          items,
          total_price,
          payment_method: 'COD',
          note
        })
      });
      if (res.status) {
        setShowSuccess(true);
      } else {
        alert(res.message || 'Đặt hàng thất bại');
      }
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <></>;

  let total = 0;
  cartItems.forEach(item => {
    const product = products.find(p => p.id === (item.product_id || item.product?.id));
    if (!product) return;
    const price = parseFloat(product.price) || 0;
    total += price * item.quantity;
  });

  // Giả lập phí vận chuyển và giảm giá
  const shippingFee = 32200;
  const discount = 11000;
  const finalTotal = total + shippingFee - discount;

  return (
    <Page>
      <div className="checkout-bg">
        <div className="checkout-title-bg">
          <Title title="Xác nhận thông tin mua hàng" />
        </div>
        <div className="checkout-container">
          {/* Cột trái */}
          <div className="checkout-left-bg">
            {/* Địa chỉ giao hàng */}
            <div className="checkout-box checkout-box-shadow">
              <div className="checkout-box-title">
                Giao tới 
                <span className="checkout-change" onClick={() => setShowEdit(true)}>Thay đổi</span>
              </div>
              {!showEdit ? (
                <>
                  <div className="checkout-user">{user.name || 'Chưa đăng nhập'} <span className="checkout-phone">{user.phone || ''}</span></div>
                  <div className="checkout-address">{user.address || 'Vui lòng cập nhật địa chỉ giao hàng'}</div>
                </>
              ) : (
                <div className="checkout-edit-form">
                  <input name="name" value={editData.name} onChange={handleEditChange} placeholder="Họ tên" className="checkout-edit-input" />
                  <input name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Số điện thoại" className="checkout-edit-input" />
                  <input name="address" value={editData.address} onChange={handleEditChange} placeholder="Địa chỉ" className="checkout-edit-input" />
                  <button onClick={handleSaveAddress} disabled={saving} className="checkout-edit-save">Lưu</button>
                  <button onClick={() => setShowEdit(false)} className="checkout-edit-cancel">Hủy</button>
                </div>
              )}
            </div>
            {/* Chọn hình thức giao hàng */}
            <div className="checkout-box checkout-box-shadow">
              <div className="checkout-box-title">Chọn hình thức giao hàng</div>
              <div className="checkout-shipping-method">
                <input type="radio" id="shipping1" name="shipping" defaultChecked />
                <label htmlFor="shipping1" className="checkout-radio-label">Giao tiết kiệm</label>
                <div className="checkout-shipping-desc">Giao trước 19h, 13/06</div>
              </div>
              <div className="checkout-shipping-product">
                {cartItems.map(item => {
                  const product = products.find(p => p.id === (item.product_id || item.product?.id));
                  if (!product) return null;
                  return (
                    <div key={item.id} className="checkout-shipping-item">
                      <img src={product.image || product.img_url} alt={product.name} />
                      <div className="checkout-shipping-info">
                        <div className="checkout-product-name">{product.name}</div>
                        <div className="checkout-product-qty">SL: {item.quantity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Chọn hình thức thanh toán */}
            <div className="checkout-box checkout-box-shadow">
              <div className="checkout-box-title">Chọn hình thức thanh toán</div>
              <div className="checkout-payment-method">
                <div><input type="radio" id="cod" name="payment" defaultChecked /> <label htmlFor="cod" className="checkout-radio-label">Thanh toán tiền mặt (COD)</label></div>
                <div><input type="radio" id="viettel" name="payment" disabled /> <label htmlFor="viettel" className="checkout-radio-label checkout-radio-disabled">Viettel Money(sắp ra mắt)</label></div>
                <div><input type="radio" id="momo" name="payment" disabled /> <label htmlFor="momo" className="checkout-radio-label checkout-radio-disabled">Ví Momo(sắp ra mắt)</label></div>
                <div><input type="radio" id="zalopay" name="payment" disabled /> <label htmlFor="zalopay" className="checkout-radio-label checkout-radio-disabled">Ví ZaloPay( chưa hoạt động)</label></div>
                <div><input type="radio" id="vnpay" name="payment" disabled /> <label htmlFor="vnpay" className="checkout-radio-label checkout-radio-disabled">VNPAY(sắp ra mắt)</label></div>
                <div><input type="radio" id="card" name="payment" disabled /> <label htmlFor="card" className="checkout-radio-label checkout-radio-disabled">Thẻ tín dụng/Ghi nợ(sắp ra mắt)</label></div>
              </div>
            </div>
          </div>
          {/* Cột phải */}
          <div className="checkout-right">
            <div className="checkout-box checkout-summary checkout-box-shadow">
              <div className="checkout-summary-title">Đơn hàng</div>
              <div className="checkout-summary-row">Tổng tiền hàng <span>{total.toLocaleString()}₫</span></div>
              <div className="checkout-summary-row">Phí vận chuyển <span>{shippingFee.toLocaleString()}₫</span></div>
              <div className="checkout-summary-row">Giảm giá trực tiếp <span className="checkout-discount">-{discount.toLocaleString()}₫</span></div>
              <div className="checkout-summary-row checkout-summary-total">Tổng tiền thanh toán <span>{finalTotal.toLocaleString()}₫</span></div>
              <div className="checkout-summary-row checkout-summary-saved">Tiết kiệm <span>{discount.toLocaleString()}₫</span></div>
              <textarea
                className="checkout-note"
                placeholder="Ghi chú cho đơn hàng (tuỳ chọn)"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                style={{ width: '100%', margin: '12px 0', borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15 }}
              />
              <button className="checkout-order-btn" onClick={handleOrder} disabled={ordering}>
                {ordering ? 'Đang đặt hàng...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showSuccess && (
        <SuccessPopup
          onHome={() => router.push('/')}
          onOrders={() => router.push('/orders')}
        />
      )}
      <style jsx>{`
        .checkout-bg {
          background: #f7f7fa;
          min-height: 100vh;
          padding: 40px ;
        }
        .checkout-title-bg {
          background:rgba(236, 236, 236, 0);
          border-radius: 18px;
          padding: 30px 0;
          margin: 0 auto 32px auto;
          max-width: 900px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .checkout-title-bg :global(h1) {
          text-align: center;
          font-size: 2.6rem;
          font-weight: 900;
          color: #333;
          margin: 0;
        }
        .checkout-container {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Roboto', Arial, sans-serif;
        }
        .checkout-left {
          flex: 2;
          min-width: 0;
        }
        .checkout-right {
          flex: 1;
          min-width: 320px;
          max-width: 400px;
        }
        .checkout-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          padding: 24px 28px 24px 28px;
          margin-bottom: 28px;
        }
        .checkout-box-shadow {
          transition: box-shadow 0.2s;
        }
        .checkout-box-shadow:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }
        .checkout-box-title {
          font-weight: 700;
          color: #222;
          margin-bottom: 12px;
          font-size: 19px;
        }
        .checkout-change {
          color: #1a94ff;
          font-size: 15px;
          cursor: pointer;
          float: right;
        }
        .checkout-user {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          font-size: 16px;
        }
        .checkout-phone {
          color: #888;
          font-size: 15px;
          margin-left: 8px;
        }
        .checkout-address {
          color: #666;
          font-size: 15px;
        }
        .checkout-shipping-method {
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .checkout-shipping-desc {
          color: #388e3c;
          font-size: 15px;
          margin-left: 12px;
          font-weight: 500;
        }
        .checkout-shipping-product {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .checkout-shipping-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: #f8fafd;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .checkout-shipping-item img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          border-radius: 6px;
          background: #fafafa;
        }
        .checkout-shipping-info {
          font-size: 16px;
        }
        .checkout-product-name {
          font-weight: 500;
          font-size: 15px;
        }
        .checkout-product-qty {
          color: #888;
          font-size: 14px;
        }
        .checkout-payment-method {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .checkout-radio-label {
          font-size: 16px;
          margin-left: 8px;
          font-weight: 500;
        }
        .checkout-radio-disabled {
          color: #bbb;
        }
        .checkout-summary {
          margin-top: 0;
        }
        .checkout-summary-title {
          font-weight: 700;
          font-size: 20px;
          margin-bottom: 18px;
        }
        .checkout-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 17px;
          margin-bottom: 14px;
        }
        .checkout-summary-total {
          font-weight: 900;
          color: #e53935;
          font-size: 20px;
        }
        .checkout-summary-saved {
          color: #388e3c;
          font-size: 16px;
          font-weight: 500;
        }
        .checkout-discount {
          color: #e53935;
          font-weight: 700;
        }
        .checkout-order-btn {
          width: 100%;
          background: #e53935;
          color: #fff;
          font-weight: 700;
          font-size: 1.2rem;
          border: none;
          border-radius: 8px;
          padding: 18px 0;
          margin-top: 22px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(229,57,53,0.08);
          transition: background 0.2s, box-shadow 0.2s;
        }
        .checkout-order-btn:hover {
          background: #c62828;
          box-shadow: 0 4px 16px rgba(229,57,53,0.16);
        }
        @media (max-width: 1100px) {
          .checkout-container {
            flex-direction: column;
            justify-content: space-between;
            gap: 0;
          }
          .checkout-right {
            max-width: 100%;
            min-width: 0;
            margin-top: 32px;
          }
          .checkout-left {
            padding-left: 0px;
          }
        }
        .checkout-edit-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        .checkout-edit-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 15px;
        }
        .checkout-edit-save {
          background: #1a94ff;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 0;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
        }
        .checkout-edit-cancel {
          background: #eee;
          color: #333;
          border: none;
          border-radius: 6px;
          padding: 8px 0;
          font-weight: 500;
          cursor: pointer;
          margin-top: 2px;
        }
      `}</style>
    </Page>
  );
}
