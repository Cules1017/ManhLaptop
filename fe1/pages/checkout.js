import { useEffect, useState } from 'react';
import Page from '../components/page';
import Title from '../components/title';
import { productService } from '../services/productService';
import { apiRequest } from '../utils/apiRequest';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import SuccessPopup from '../components/SuccessPopup';
import { useCart } from '../context/CartContext';
import { getFinalPrice, formatVND } from '../utils/price';

const SHIPPING_FEE = 0; // Miễn phí vận chuyển

/** Bật lại khi muốn mở VNPay trên storefront. */
const VNPAY_ACTIVE = false;

function parseAddressValue(rawAddress = '') {
  const value = String(rawAddress || '').trim();
  if (!value) {
    return { addressDetail: '', district: '', city: '' };
  }

  const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
  const city = parts[parts.length - 1] || '';
  const district = parts[parts.length - 2] || '';
  const addressDetail = parts.slice(0, Math.max(parts.length - 2, 1)).join(', ');

  return {
    addressDetail: addressDetail || value,
    district,
    city,
  };
}

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', addressDetail: '', district: '', city: '' });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [ordering, setOrdering] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [myVouchers, setMyVouchers] = useState([]);

  const router = useRouter();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    if (!VNPAY_ACTIVE && paymentMethod === 'vnpay') {
      setPaymentMethod('COD');
    }
  }, [paymentMethod]);

  const loadDistrictsByCity = async (cityName, preferredDistrict = '', provinceList = provinces) => {
    const province = provinceList.find((p) => p.name === cityName);
    if (!province?.code) {
      setDistricts([]);
      setEditData((prev) => ({ ...prev, district: '' }));
      return;
    }

    try {
      const res = await apiRequest(`http://127.0.0.1:8000/api/locations/provinces/${province.code}/districts`);
      const districtList = Array.isArray(res?.data) ? res.data : [];
      setDistricts(districtList);
      const hasPreferred = districtList.some((d) => d.name === preferredDistrict);
      setEditData((prev) => ({
        ...prev,
        district: hasPreferred ? preferredDistrict : districtList[0]?.name || '',
      }));
    } catch {
      setDistricts([]);
    }
  };

  const loadProvinces = async (preferredCity = '', preferredDistrict = '') => {
    try {
      const res = await apiRequest('http://127.0.0.1:8000/api/locations/provinces');
      const provinceList = Array.isArray(res?.data) ? res.data : [];
      setProvinces(provinceList);
      if (!provinceList.length) return;

      const selectedCity = provinceList.some((p) => p.name === preferredCity)
        ? preferredCity
        : provinceList[0].name;

      setEditData((prev) => ({ ...prev, city: selectedCity }));
      await loadDistrictsByCity(selectedCity, preferredDistrict, provinceList);
    } catch {
      setProvinces([]);
      setDistricts([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (typeof window !== 'undefined') {
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          setUser(userData);
          let name = userData?.name || '';
          let phone = userData?.phone || '';
          let address = userData?.address || '';
          if (address && address.includes(' - ')) {
            const parts = address.split(' - ');
            name = parts[0] || '';
            phone = parts[1] || '';
            address = parts.slice(2).join(' - ') || '';
          }
          const parsedAddress = parseAddressValue(address);
          setEditData({
            name,
            phone,
            addressDetail: parsedAddress.addressDetail,
            district: parsedAddress.district,
            city: parsedAddress.city,
          });
          await loadProvinces(parsedAddress.city, parsedAddress.district);
        } catch {
          setUser({});
        }
      }
      try {
        const cartRes = await productService.getCart();
        const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
        setCartItems(items);
        const productDetailPromises = items.map((item) =>
          productService.getProductById(item.product_id || item.product?.id)
        );
        const productDetails = await Promise.all(productDetailPromises);
        setProducts(productDetails.map((res) => res.data));

        try {
          const voucherRes = await apiRequest('http://127.0.0.1:8000/api/lucky-wheel/status', {
            method: 'GET',
            silent: true
          });
          if (voucherRes.status && voucherRes.data?.history) {
            setMyVouchers(voucherRes.data.history);
          }
        } catch (e) {
          console.error(e);
        }
      } catch {
        // apiRequest đã xử lý popup
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'city') {
      setEditData((prev) => ({ ...prev, city: value }));
      await loadDistrictsByCity(value);
      return;
    }

    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    if (!editData.name.trim() || !editData.phone.trim() || !editData.addressDetail.trim() || !editData.district || !editData.city) {
      toast.error('Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ giao hàng', { position: 'top-center' });
      return;
    }
    setSaving(true);
    try {
      const addressString = `${editData.name.trim()} - ${editData.phone.trim()} - ${editData.addressDetail.trim()}, ${editData.district}, ${editData.city}`;
      const res = await apiRequest('http://127.0.0.1:8000/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressString }),
      });
      if (res.status) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setShowEdit(false);
        toast.success('Cập nhật địa chỉ giao hàng thành công', { position: 'top-center' });
      } else {
        toast.error(res.message || 'Cập nhật thất bại', { position: 'top-center' });
      }
    } catch {
      // popup đã hiện
    } finally {
      setSaving(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá', { position: 'top-center' });
      return;
    }

    setApplyingCoupon(true);
    try {
      // Tính lại tổng tiền tạm tính
      const currentSubTotal = cartItems.reduce((sum, item) => {
        const product = products.find((p) => p.id === (item.product_id || item.product?.id));
        return sum + getFinalPrice(product) * item.quantity;
      }, 0);

      const res = await apiRequest('http://127.0.0.1:8000/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          cart_total: currentSubTotal,
        }),
      });

      if (res.status) {
        setAppliedCoupon(res.data.coupon);
        setDiscountAmount(res.data.discount_amount);
        toast.success(res.message, { position: 'top-center' });
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        toast.error(res.message || 'Mã giảm giá không hợp lệ', { position: 'top-center' });
      }
    } catch {
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleOrder = async () => {
    if (!cartItems.length) {
      toast.error('Giỏ hàng đang trống', { position: 'top-center' });
      return;
    }
    if (!user?.address) {
      toast.error('Vui lòng cập nhật địa chỉ giao hàng trước khi đặt hàng', { position: 'top-center' });
      setShowEdit(true);
      return;
    }
    if (paymentMethod === 'vnpay' && !VNPAY_ACTIVE) {
      toast.error('VNPay đang tạm ngưng. Vui lòng chọn phương thức thanh toán khác.', {
        position: 'top-center',
      });
      return;
    }
    setOrdering(true);
    try {
      const items = cartItems.map((item) => {
        const product = products.find(
          (p) => p.id === (item.product_id || item.product?.id)
        );
        return {
          product_id: item.product_id || item.product?.id,
          quantity: item.quantity,
          price: getFinalPrice(product),
        };
      });
      const total_price = items.reduce((sum, i) => sum + i.price * i.quantity, 0) + SHIPPING_FEE;
      const isVnPay = paymentMethod === 'vnpay';
      const isMomo = paymentMethod === 'momo';
      const endpoint = isVnPay
        ? 'http://127.0.0.1:8000/api/vnpay/checkout'
        : isMomo
          ? 'http://127.0.0.1:8000/api/momo/checkout'
          : 'http://127.0.0.1:8000/api/checkout';

      const res = await apiRequest(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          total_price,
          shipping_fee: SHIPPING_FEE,
          payment_method: paymentMethod,
          note,
          coupon_code: appliedCoupon?.code || null,
        }),
      });
      if (res.status) {
        await refreshCartCount?.();

        if (isVnPay || isMomo) {
          const paymentUrl = res?.data?.payment_url;
          const redirectUrl = res?.data?.redirect_url;

          // MoMo: always stay in internal QR page, do not deep-link/redirect to MoMo app.
          if (isMomo && redirectUrl && typeof window !== 'undefined') {
            window.location.href = redirectUrl;
            return;
          }

          if (paymentUrl && typeof window !== 'undefined') {
            window.location.href = paymentUrl;
            return;
          }
          if (redirectUrl && typeof window !== 'undefined') {
            window.location.href = redirectUrl;
            return;
          }
          toast.info(isVnPay ? 'Đang xử lý thanh toán VNPay...' : 'Đang xử lý thanh toán MoMo...', {
            position: 'top-center',
          });
          return;
        }

        if (paymentMethod === 'bank_transfer' && typeof window !== 'undefined') {
          const orderId = res?.data?.id || res?.data?.order_id || '';
          const amount = Math.round(Number(total_price) || 0);
          router.push(`/payment-simulator?method=bank_transfer&orderId=${encodeURIComponent(orderId)}&amount=${encodeURIComponent(amount)}`);
          return;
        }

        setShowSuccess(true);
      } else {
        toast.error(res.message || 'Đặt hàng thất bại', { position: 'top-center' });
      }
    } catch {
      // popup hiện rồi
    } finally {
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <div style={{ padding: 80, textAlign: 'center', color: '#888' }}>Đang tải...</div>
      </Page>
    );
  }

  const subTotal = cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === (item.product_id || item.product?.id));
    return sum + getFinalPrice(product) * item.quantity;
  }, 0);
  
  // Tổng tiền bao gồm ship và trừ khuyến mãi
  const finalTotal = Math.max(0, subTotal + SHIPPING_FEE - discountAmount);

  return (
    <Page>
      <div className="checkout-bg">
        <div className="checkout-title-bg">
          <Title title="Xác nhận thông tin mua hàng" />
        </div>
        <div className="checkout-container">
          <div className="checkout-left">
            <div className="checkout-box">
              <div className="checkout-box-title">
                <span>Giao tới</span>
                <span className="checkout-change" onClick={() => setShowEdit(true)}>
                  Thay đổi
                </span>
              </div>
              {!showEdit ? (
                <>
                  <div className="checkout-user">
                    {user.name || 'Chưa đăng nhập'}{' '}
                    <span className="checkout-phone">{user.phone || ''}</span>
                  </div>
                  <div className="checkout-address">
                    {user.address || 'Vui lòng cập nhật địa chỉ giao hàng'}
                  </div>
                </>
              ) : (
                <div className="checkout-edit-form">
                  <input
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    placeholder="Họ tên"
                    className="form-input"
                  />
                  <input
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    placeholder="Số điện thoại"
                    className="form-input"
                  />
                  <input
                    name="addressDetail"
                    value={editData.addressDetail}
                    onChange={handleEditChange}
                    placeholder="Số nhà, tên đường"
                    className="form-input"
                  />
                  <select
                    name="city"
                    value={editData.city}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    {provinces.map((item) => (
                      <option key={item.code} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="district"
                    value={editData.district}
                    onChange={handleEditChange}
                    className="form-input"
                  >
                    {districts.map((district) => (
                      <option key={district.code} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={handleSaveAddress}
                      disabled={saving}
                      className="btn-primary"
                      style={{ flex: 1 }}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button onClick={() => setShowEdit(false)} className="btn-secondary" style={{ flex: 1 }}>
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="checkout-box">
              <div className="checkout-box-title">Chọn hình thức giao hàng</div>
              <div className="checkout-shipping-method">
                <input type="radio" id="shipping1" name="shipping" defaultChecked readOnly />
                <label htmlFor="shipping1" className="checkout-radio-label">
                  <FiTruck size={20} color="#e53935" />
                  Giao tiêu chuẩn ({SHIPPING_FEE === 0 ? 'Miễn phí' : formatVND(SHIPPING_FEE)})
                </label>
              </div>
              <div className="checkout-shipping-product">
                {cartItems.map((item) => {
                  const product = products.find(
                    (p) => p.id === (item.product_id || item.product?.id)
                  );
                  if (!product) return null;
                  return (
                    <div key={item.id} className="checkout-shipping-item">
                      <img 
                        src={product.image || product.img_url || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'} 
                        alt={product.name} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Found';
                        }}
                      />
                      <div className="checkout-shipping-info">
                        <div className="checkout-product-name">{product.name}</div>
                        <div className="checkout-product-qty">
                          SL: {item.quantity} × {formatVND(getFinalPrice(product))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="checkout-box">
              <div className="checkout-box-title">Chọn hình thức thanh toán</div>
              <div className="checkout-payment-method">
                <label className="checkout-radio-row">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <span className="checkout-radio-label">Thanh toán tiền mặt (COD)</span>
                </label>
                <label className="checkout-radio-row checkout-radio-disabled-row">
                  <input type="radio" name="payment" disabled />
                  <span className="checkout-radio-label checkout-radio-disabled">
                    Viettel Money (sắp ra mắt)
                  </span>
                </label>
                <label className="checkout-radio-row">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <span className="checkout-radio-label">Chuyển khoản ngân hàng</span>
                </label>
                <label className="checkout-radio-row">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                  />
                  <span className="checkout-radio-label">Ví MoMo</span>
                </label>
                <label className="checkout-radio-row checkout-radio-disabled-row">
                  <input type="radio" name="payment" disabled />
                  <span className="checkout-radio-label checkout-radio-disabled">
                    Ví ZaloPay (sắp ra mắt)
                  </span>
                </label>
                <label
                  className={`checkout-radio-row ${!VNPAY_ACTIVE ? 'checkout-radio-disabled-row' : ''}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    disabled={!VNPAY_ACTIVE}
                    checked={VNPAY_ACTIVE && paymentMethod === 'vnpay'}
                    onChange={() => VNPAY_ACTIVE && setPaymentMethod('vnpay')}
                  />
                  <span
                    className={`checkout-radio-label ${!VNPAY_ACTIVE ? 'checkout-radio-disabled' : ''}`}
                  >
                    VNPay {!VNPAY_ACTIVE ? '(tạm ngưng)' : '(test sandbox)'}
                  </span>
                </label>
                <label className="checkout-radio-row checkout-radio-disabled-row">
                  <input type="radio" name="payment" disabled />
                  <span className="checkout-radio-label checkout-radio-disabled">
                    Thẻ tín dụng / Ghi nợ (sắp ra mắt)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="checkout-right">
            <div className="checkout-box checkout-summary">
              <div className="checkout-summary-title">Đơn hàng</div>
              <div className="checkout-summary-row">
                <span>Tổng tiền hàng</span>
                <span>{formatVND(subTotal)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Phí vận chuyển</span>
                <span>{SHIPPING_FEE === 0 ? 'Miễn phí' : formatVND(SHIPPING_FEE)}</span>
              </div>
              
              <div className="checkout-coupon-section">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    className="form-input"
                    placeholder="Mã giảm giá"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                    style={{ flex: 1 }}
                  />
                  {!appliedCoupon ? (
                    <button
                      className="btn-secondary"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      style={{ padding: '8px 16px' }}
                    >
                      {applyingCoupon ? '...' : 'Áp dụng'}
                    </button>
                  ) : (
                    <button
                      className="btn-secondary"
                      onClick={handleRemoveCoupon}
                      style={{ padding: '8px 16px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      Huỷ
                    </button>
                  )}
                </div>

                {myVouchers.length > 0 && !appliedCoupon && (
                  <div className="checkout-vouchers-list" style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Voucher của bạn:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {myVouchers.map((v, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="btn-voucher-tag"
                          onClick={() => setCouponCode(v.coupon_code)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: '#fefce8',
                            border: '1px solid #eab308',
                            borderRadius: '4px',
                            color: '#ca8a04',
                            cursor: 'pointer'
                          }}
                        >
                          {v.coupon_code} ({v.prize_name})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="checkout-summary-row" style={{ color: 'var(--success)' }}>
                    <span>Giảm giá ({appliedCoupon.code})</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="checkout-summary-row checkout-summary-total">
                <span>Tổng tiền thanh toán</span>
                <span>{formatVND(finalTotal)}</span>
              </div>
              <textarea
                className="form-input"
                placeholder="Ghi chú cho đơn hàng (tuỳ chọn)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                style={{ resize: 'vertical', marginTop: '12px' }}
              />
              <button
                className="btn-primary"
                onClick={handleOrder}
                disabled={ordering || !cartItems.length}
                style={{ marginTop: '16px' }}
              >
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
          background: var(--bg-color);
          min-height: 100vh;
          padding: 24px 16px 40px;
          width: 100%;
          box-sizing: border-box;
        }
        .checkout-title-bg {
          padding: 20px 0;
          margin: 0 auto 24px;
          max-width: 900px;
          display: flex;
          justify-content: center;
        }
        .checkout-title-bg :global(h2) {
          text-align: center;
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-main);
          margin: 0;
        }
        .checkout-container {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: inherit;
        }
        .checkout-left {
          flex: 2;
          min-width: 0;
        }
        .checkout-right {
          flex: 1;
          min-width: 300px;
          max-width: 400px;
        }
        .checkout-box {
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--surface-border);
          padding: 24px;
          margin-bottom: 24px;
          transition: box-shadow 0.2s;
        }
        .checkout-box-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 16px;
          font-size: 18px;
        }
        .checkout-change {
          color: var(--secondary);
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }
        .checkout-user {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 4px;
          font-size: 15px;
        }
        .checkout-phone {
          color: var(--text-muted);
          font-size: 14px;
          margin-left: 8px;
          font-weight: 400;
        }
        .checkout-address {
          color: var(--text-muted);
          font-size: 14px;
        }
        .checkout-shipping-method {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .checkout-shipping-product {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .checkout-shipping-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--surface-hover);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          padding: 12px;
        }
        .checkout-shipping-item img {
          width: 56px;
          height: 56px;
          object-fit: contain;
          border-radius: var(--radius-sm);
          background: var(--surface);
        }
        .checkout-product-name {
          font-weight: 500;
          font-size: 15px;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .checkout-product-qty {
          color: var(--text-muted);
          font-size: 14px;
        }
        .checkout-payment-method {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .checkout-radio-row {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 12px;
          border-radius: var(--radius);
          border: 1px solid var(--surface-border);
          transition: all var(--transition-fast);
        }
        .checkout-radio-row:hover:not(.checkout-radio-disabled-row) {
          background: var(--surface-hover);
          border-color: #cbd5e1;
        }
        .checkout-radio-row input[type="radio"]:checked {
          accent-color: var(--secondary);
        }
        .checkout-radio-row:has(input[type="radio"]:checked) {
          border-color: var(--secondary);
          background: rgba(37, 99, 235, 0.03);
        }
        .checkout-radio-disabled-row {
          cursor: not-allowed;
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        .checkout-radio-label {
          font-size: 15px;
          font-weight: 500;
          color: var(--text-main);
        }
        .checkout-radio-disabled {
          color: #94a3b8;
        }
        .checkout-summary-title {
          font-weight: 700;
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--text-main);
        }
        .checkout-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 15px;
          margin-bottom: 12px;
          color: var(--text-muted);
        }
        .checkout-summary-row span:last-child {
          color: var(--text-main);
          font-weight: 500;
        }
        .checkout-summary-total {
          font-weight: 700;
          color: var(--accent);
          font-size: 18px;
          border-top: 1px solid var(--surface-border);
          padding-top: 16px;
          margin-top: 8px;
        }
        .checkout-coupon-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed var(--surface-border);
        }
        .checkout-summary-total span:last-child {
          color: var(--accent);
          font-weight: 700;
        }
        @media (max-width: 1100px) {
          .checkout-container {
            flex-direction: column;
            gap: 24px;
          }
          .checkout-right {
            max-width: 100%;
            min-width: 0;
            width: 100%;
          }
        }
        .checkout-edit-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
      `}</style>
    </Page>
  );
}
