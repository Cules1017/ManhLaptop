import { useEffect, useState } from 'react';
import Page from '../components/page';
import EmptySection from '../components/emptySection';
import Title from '../components/title';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { apiRequest } from '../utils/apiRequest';
import { FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import {
  getOriginalPrice,
  getFinalPrice,
  hasDiscount,
  formatVND,
} from '../utils/price';

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

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState({});
  const { refreshCartCount } = useCart();
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', addressDetail: '', district: '', city: '' });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState({});

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
    if (typeof window !== 'undefined') {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      } catch {
        setUser({});
      }
    }
  }, []);

  const fetchCartAndProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const cartRes = await productService.getCart();
      const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
      if (!cartRes.status || !items.length) {
        setCartItems([]);
        setProducts([]);
        return;
      }
      setCartItems(items);
      const productDetailPromises = items.map((item) =>
        productService.getProductById(item.product_id || item.product?.id)
      );
      const productDetails = await Promise.all(productDetailPromises);
      setProducts(productDetails.map((res) => res.data));
    } catch (err) {
      setError('Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndProducts();
    // refresh cart count trên header khi mở trang giỏ hàng
    refreshCartCount?.();
  }, []);

  useEffect(() => {
    const newInputs = {};
    cartItems.forEach((item) => {
      newInputs[item.id] = item.quantity;
    });
    setQuantityInputs(newInputs);
  }, [cartItems]);

  useEffect(() => {
    const syncAddressData = async () => {
      let name = user?.name || '';
      let phone = user?.phone || '';
      let address = user?.address || '';
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
    };

    syncAddressData();
  }, [user]);

  // Tính tổng dựa trên giá cuối cùng (đã áp dụng % giảm giá)
  let originalTotal = 0;
  let finalTotal = 0;
  cartItems.forEach((item) => {
    const product = products.find((p) => p.id === (item.product_id || item.product?.id));
    if (!product) return;
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    originalTotal += original * item.quantity;
    finalTotal += final * item.quantity;
  });
  const totalSavings = Math.max(0, originalTotal - finalTotal);

  const reloadCart = async () => {
    const cartRes = await productService.getCart();
    const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
    setCartItems(items);
    const productDetailPromises = items.map((i) =>
      productService.getProductById(i.product_id || i.product?.id)
    );
    const productDetails = await Promise.all(productDetailPromises);
    setProducts(productDetails.map((res) => res.data));
    await refreshCartCount?.();
  };

  const handleChangeQuantity = async (item, newQuantity, mode = 'set') => {
    if (isUpdating) return;
    const productId = item.product_id || item.product?.id;
    setIsUpdating(true);
    try {
      if (mode === 'plus') {
        await productService.addToCart({ product_id: productId, quantity: 1 });
      } else if (mode === 'minus') {
        if (item.quantity <= 1) {
          const ok = typeof window !== 'undefined'
            ? window.confirm('Giảm nữa sẽ xoá sản phẩm khỏi giỏ hàng. Bạn có chắc không?')
            : true;
          if (!ok) {
            setIsUpdating(false);
            return;
          }
          await productService.removeFromCart({ product_id: productId });
        } else {
          await productService.addToCart({ product_id: productId, quantity: -1 });
        }
      } else {
        // Nhập tay: gán tuyệt đối, dùng endpoint /cart/update
        const qty = Math.max(1, parseInt(newQuantity, 10) || 1);
        await productService.updateCartQuantity({ product_id: productId, quantity: qty });
      }
      await reloadCart();
    } catch (err) {
      // popup lỗi đã được xử lý trong apiRequest
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async (item) => {
    if (isUpdating) return;
    const ok = typeof window !== 'undefined'
      ? window.confirm('Xoá sản phẩm này khỏi giỏ hàng?')
      : true;
    if (!ok) return;
    setIsUpdating(true);
    try {
      await productService.removeFromCart({
        product_id: item.product_id || item.product?.id,
      });
      await reloadCart();
      toast.success('Đã xoá sản phẩm khỏi giỏ hàng', { position: 'top-center' });
    } catch (err) {
      // popup lỗi trong apiRequest
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityInputChange = (item, value) => {
    const val = Math.max(1, parseInt(value, 10) || 1);
    setQuantityInputs((inputs) => ({ ...inputs, [item.id]: val }));
  };

  const handleQuantityInputCommit = async (item) => {
    const newQuantity = quantityInputs[item.id];
    if (newQuantity === item.quantity || isUpdating) return;
    await handleChangeQuantity(item, newQuantity, 'set');
  };

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
      // apiRequest đã show popup
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = () => {
    if (!cartItems.length) {
      toast.error('Giỏ hàng đang trống', { position: 'top-center' });
      return;
    }
    if (!user?.address) {
      toast.error('Vui lòng cập nhật địa chỉ giao hàng trước khi thanh toán', { position: 'top-center' });
      setShowEdit(true);
      return;
    }
    router.push('/checkout');
  };

  if (loading) return <Page><Title title="GIỎ HÀNG" /></Page>;

  if (error || !cartItems.length || !products.length) {
    return (
      <Page>
        <Title title="GIỎ HÀNG" />
        <EmptySection name="cart" />
      </Page>
    );
  }

  return (
    <Page>
      <div className="cart-bg">
        <Title title="GIỎ HÀNG" />
        <section className="cart-section">
          <div className="cart-main">
            <div className="cart-table">
              <div className="cart-table-header">
                <div className="cart-table-col select-col">Tất cả ({cartItems.length} sản phẩm)</div>
                <div className="cart-table-col product-col">Sản phẩm</div>
                <div className="cart-table-col price-col">Đơn giá</div>
                <div className="cart-table-col qty-col">Số lượng</div>
                <div className="cart-table-col total-col">Thành tiền</div>
                <div className="cart-table-col action-col" aria-label="Thao tác" />
              </div>
              {cartItems.map((item) => {
                const product = products.find(
                  (p) => p.id === (item.product_id || item.product?.id)
                );
                if (!product) return null;
                const finalPrice = getFinalPrice(product);
                const originalPrice = getOriginalPrice(product);
                const lineTotal = finalPrice * item.quantity;
                return (
                  <div className="cart-table-row" key={item.id}>
                    <div className="cart-table-col select-col" />
                    <div className="cart-table-col product-col">
                      <img
                        src={product.image || product.img_url}
                        alt={product.name}
                        className="cart-product-img"
                      />
                      <div className="cart-product-info">
                        <div className="cart-product-name">{product.name}</div>
                      </div>
                    </div>
                    <div className="cart-table-col price-col">
                      <span className="cart-product-price">{formatVND(finalPrice)}</span>
                      {hasDiscount(product) && (
                        <span className="cart-product-oldprice">{formatVND(originalPrice)}</span>
                      )}
                    </div>
                    <div className="cart-table-col qty-col">
                      <button
                        className="cart-qty-btn"
                        aria-label="Giảm số lượng"
                        disabled={isUpdating}
                        onClick={() => handleChangeQuantity(item, item.quantity, 'minus')}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={quantityInputs[item.id] || item.quantity}
                        className="cart-qty-input"
                        disabled={isUpdating}
                        onChange={(e) => handleQuantityInputChange(item, e.target.value)}
                        onBlur={() => handleQuantityInputCommit(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                        }}
                      />
                      <button
                        className="cart-qty-btn"
                        aria-label="Tăng số lượng"
                        disabled={isUpdating}
                        onClick={() => handleChangeQuantity(item, item.quantity, 'plus')}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-table-col total-col">
                      <span className="cart-product-total">{formatVND(lineTotal)}</span>
                    </div>
                    <div className="cart-table-col action-col">
                      <button
                        className="cart-remove-btn"
                        aria-label="Xoá sản phẩm"
                        disabled={isUpdating}
                        onClick={() => handleRemove(item)}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                );
              })}
              {isUpdating && (
                <div className="cart-loading-overlay">
                  <div className="cart-loading-spinner" />
                </div>
              )}
              <div className="cart-table-row cart-table-row-promo">
                <div className="cart-table-col promo-col">
                  <span className="cart-shipping-info">
                    🚚 Miễn phí vận chuyển cho đơn từ 500.000₫
                  </span>
                </div>
              </div>
            </div>
          </div>
          <aside>
            <div className="cart-sidebar">
              <div className="cart-shipping-box">
                <div className="cart-shipping-title">
                  Giao tới
                  <span className="cart-shipping-change" onClick={() => setShowEdit(true)}>
                    Thay đổi
                  </span>
                </div>
                {!showEdit ? (
                  <>
                    <div className="cart-shipping-user">
                      {user.name || 'Chưa đăng nhập'}{' '}
                      <span className="cart-shipping-phone">{user.phone || ''}</span>
                    </div>
                    <div className="cart-shipping-address">
                      {user.address || 'Vui lòng cập nhật địa chỉ giao hàng'}
                    </div>
                  </>
                ) : (
                  <div className="cart-edit-form">
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      placeholder="Họ tên"
                      className="cart-edit-input"
                    />
                    <input
                      name="phone"
                      value={editData.phone}
                      onChange={handleEditChange}
                      placeholder="Số điện thoại"
                      className="cart-edit-input"
                    />
                    <input
                      name="addressDetail"
                      value={editData.addressDetail}
                      onChange={handleEditChange}
                      placeholder="So nha, ten duong"
                      className="cart-edit-input"
                    />
                    <select
                      name="city"
                      value={editData.city}
                      onChange={handleEditChange}
                      className="cart-edit-input"
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
                      className="cart-edit-input"
                    >
                      {districts.map((district) => (
                        <option key={district.code} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveAddress}
                      disabled={saving}
                      className="cart-edit-save"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button onClick={() => setShowEdit(false)} className="cart-edit-cancel">
                      Huỷ
                    </button>
                  </div>
                )}
              </div>
              <div className="cart-summary-box">
                <div className="cart-summary-title">Tóm tắt đơn hàng</div>
                <div className="cart-summary-sub">Kiểm tra thông tin trước khi đặt mua</div>
                <div className="cart-summary-row">
                  <span>Tổng tiền hàng</span>
                  <span>{formatVND(originalTotal)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Giảm giá trực tiếp</span>
                  <span>-{formatVND(totalSavings)}</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Tổng tiền thanh toán</span>
                  <span>{formatVND(finalTotal)}</span>
                </div>
                <div className="cart-summary-row cart-summary-saved">
                  <span>Tiết kiệm</span>
                  <span>{formatVND(totalSavings)}</span>
                </div>
                <button className="cart-summary-checkout" onClick={handleCheckout}>
                  Mua hàng ({cartItems.length})
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
      <style jsx>{`
        .cart-bg {
          background: linear-gradient(180deg, #f6f8ff 0%, #f3f5fb 100%);
          min-height: 100vh;
          padding: 0 16px 40px;
          font-family: 'Roboto', Arial, sans-serif;
          width: 100%;
          box-sizing: border-box;
        }
        .cart-section {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          gap: 28px;
          max-width: 1320px;
          margin: 0 auto;
        }
        .cart-main {
          flex: 1 1 0;
          min-width: 0;
        }
        .cart-table {
          position: relative;
          width: 100%;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
          padding: 0 0 24px 0;
          margin-top: 8px;
        }
        .cart-table-header,
        .cart-table-row {
          display: flex;
          align-items: center;
        }
        .cart-table-header {
          font-weight: 600;
          color: #888;
          background: #f8faff;
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .cart-table-row {
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 0;
        }
        .cart-table-row-promo {
          background: #f8faff;
          border-bottom: none;
          padding: 0 0 18px 0;
        }
        .cart-table-col {
          padding: 0 12px;
          display: flex;
          align-items: center;
        }
        .select-col {
          width: 180px;
        }
        .product-col {
          flex: 2;
          display: flex;
          align-items: center;
        }
        .price-col {
          width: 140px;
          color: #dc2626;
          font-weight: 700;
          flex-direction: column;
          align-items: flex-start;
        }
        .qty-col {
          width: 140px;
        }
        .total-col {
          width: 140px;
          color: #dc2626;
          font-weight: 700;
        }
        .action-col {
          width: 52px;
          justify-content: center;
        }
        .promo-col {
          flex: 1;
          justify-content: flex-start;
          color: #2563eb;
          font-size: 15px;
        }
        .cart-shipping-info {
          color: #388e3c;
          font-size: 14px;
          margin-left: 12px;
        }
        .cart-product-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 10px;
          margin-right: 16px;
          background: #fafafa;
        }
        .cart-product-info {
          display: flex;
          flex-direction: column;
        }
        .cart-product-name {
          font-weight: 500;
          font-size: 16px;
        }
        .cart-product-price {
          color: #dc2626;
          font-weight: 700;
          font-size: 16px;
        }
        .cart-product-oldprice {
          color: #888;
          font-size: 13px;
          text-decoration: line-through;
          margin-top: 2px;
        }
        .cart-qty-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 1.1rem;
          cursor: pointer;
          border-radius: 4px;
        }
        .cart-qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .cart-qty-input {
          width: 48px;
          text-align: center;
          margin: 0 4px;
          border: 1px solid #ddd;
          border-radius: 4px;
          height: 28px;
        }
        .cart-remove-btn {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 6px 8px;
          border-radius: 10px;
          transition: background 0.2s, color 0.2s;
        }
        .cart-remove-btn:hover:not(:disabled) {
          background: #ffe9e8;
          color: #dc2626;
        }
        .cart-remove-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .cart-product-total {
          color: #dc2626;
          font-weight: 700;
          font-size: 16px;
        }
        .cart-sidebar {
          display: flex;
          flex-direction: column;
          gap: 28px;
          min-width: 340px;
          max-width: 380px;
        }
        .cart-shipping-box,
        .cart-summary-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(17, 24, 39, 0.08);
          padding: 20px 20px;
        }
        .cart-shipping-title {
          font-weight: 600;
          color: #222;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cart-shipping-change {
          color: #2563eb;
          font-size: 14px;
          cursor: pointer;
        }
        .cart-shipping-user {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }
        .cart-shipping-phone {
          color: #888;
          font-size: 14px;
          margin-left: 8px;
        }
        .cart-shipping-address {
          color: #666;
          font-size: 14px;
        }
        .cart-summary-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .cart-summary-sub {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .cart-summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 16px;
          margin-bottom: 12px;
        }
        .cart-summary-total {
          font-weight: 700;
          color: #dc2626;
        }
        .cart-summary-saved {
          color: #388e3c;
          font-size: 15px;
        }
        .cart-summary-checkout {
          width: 100%;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
          font-weight: 700;
          font-size: 1.05rem;
          border: none;
          border-radius: 10px;
          padding: 14px 0;
          box-shadow: 0 12px 24px rgba(220, 38, 38, 0.25);
          margin-top: 18px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .cart-summary-checkout:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }
        @media (max-width: 1100px) {
          .cart-section {
            flex-direction: column;
            gap: 0;
          }
          .cart-sidebar {
            max-width: 100%;
            min-width: 0;
            margin-top: 32px;
            position: static;
          }
        }
        @media (max-width: 768px) {
          .cart-table-header {
            display: none;
          }
          .cart-table-row {
            flex-wrap: wrap;
            gap: 8px;
          }
          .product-col {
            flex: 1 1 100%;
          }
          .price-col,
          .qty-col,
          .total-col,
          .action-col {
            width: auto;
            flex: 1 1 auto;
          }
        }
        .cart-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
        .cart-loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #e53935;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .cart-edit-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        .cart-edit-input {
          padding: 10px 12px;
          border: 1px solid #dbe2f0;
          border-radius: 10px;
          font-size: 15px;
          background: #fff;
          outline: none;
        }
        .cart-edit-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
        }
        .cart-edit-save {
          background: #1a94ff;
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 10px 0;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
        }
        .cart-edit-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .cart-edit-cancel {
          background: #eee;
          color: #333;
          border: none;
          border-radius: 10px;
          padding: 10px 0;
          font-weight: 500;
          cursor: pointer;
          margin-top: 2px;
        }
      `}</style>
    </Page>
  );
}
