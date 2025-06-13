import { useEffect, useState } from 'react';
import Page from '../components/page';
import EmptySection from '../components/emptySection';
import Title from '../components/title';
import FinishOrderCart from '../components/finishOrderCart';
import ProductItem from '../components/productItem';
import ProductsGrid from '../components/productsGrid';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/router';
import { apiRequest } from '../utils/apiRequest';

export default function Profile() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantityInputs, setQuantityInputs] = useState({});
  const { refreshCartCount } = useCart();
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {});

  useEffect(() => {
    const fetchCartAndProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const cartRes = await productService.getCart();
        // Hỗ trợ cả kiểu trả về data: [] và data: { items: [] }
        const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
        if (!cartRes.status || !items.length) {
          setCartItems([]);
          setProducts([]);
          setLoading(false);
          return;
        }
        setCartItems(items);
        // Lấy chi tiết sản phẩm cho từng item trong giỏ hàng
        const productDetailPromises = items.map(item => productService.getProductById(item.product_id || item.product?.id));
        const productDetails = await Promise.all(productDetailPromises);
        setProducts(productDetails.map(res => res.data));
      } catch (err) {
        setError('Không thể tải giỏ hàng.');
      } finally {
        setLoading(false);
      }
    };
    fetchCartAndProducts();
  }, []);

  useEffect(() => {
    // Khi cartItems thay đổi, đồng bộ lại state input số lượng
    const newInputs = {};
    cartItems.forEach(item => {
      newInputs[item.id] = item.quantity;
    });
    setQuantityInputs(newInputs);
  }, [cartItems]);

  useEffect(() => {
    // Tách chuỗi address thành 3 phần nếu có
    let name = user?.name || '';
    let phone = user?.phone || '';
    let address = user?.address || '';
    if (address && address.includes(' - ')) {
      const parts = address.split(' - ');
      name = parts[0] || '';
      phone = parts[1] || '';
      address = parts.slice(2).join(' - ') || '';
    }
    setEditData({ name, phone, address });
  }, [user]);

  // Tính tổng tiền, giảm giá, tiết kiệm
  let total = 0;
  let discount = 0;
  let finalTotal = 0;
  let totalSavings = 0;
  cartItems.forEach(item => {
    const product = products.find(p => p.id === (item.product_id || item.product?.id));
    if (!product) return;
    const price = parseFloat(product.price) || 0;
    const oldPrice = product.discount && product.discount > 0 ? price / (1 - product.discount / 100) : price;
    total += oldPrice * item.quantity;
    finalTotal += price * item.quantity;
    if (oldPrice > price) {
      discount += (oldPrice - price) * item.quantity;
    }
  });
  totalSavings = discount;

  // Hàm cập nhật số lượng sản phẩm trong giỏ hàng
  const handleChangeQuantity = async (item, newQuantity, mode = 'set') => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (mode === 'plus') {
        await productService.addToCart({ product_id: item.product_id || item.product?.id, quantity: 1 });
      } else if (mode === 'minus') {
        // Nếu quantity = 1 thì xóa khỏi giỏ, nếu có API giảm thì gọi quantity: -1
        if (item.quantity <= 1) {
          await productService.removeFromCart({ product_id: item.product_id || item.product?.id });
        } else {
          // Nếu backend hỗ trợ quantity: -1 thì dùng, còn không thì gọi lại addToCart với quantity: item.quantity - 1
          await productService.addToCart({ product_id: item.product_id || item.product?.id, quantity: - 1 });
        }
      } else {
        // Nhập tay: cập nhật tổng số lượng
        await productService.addToCart({ product_id: item.product_id || item.product?.id, quantity: newQuantity});
      }
      // Sau khi cập nhật thành công, reload lại giỏ hàng
      const cartRes = await productService.getCart();
      const items = Array.isArray(cartRes.data) ? cartRes.data : cartRes.data?.items || [];
      setCartItems(items);
      const productDetailPromises = items.map(i => productService.getProductById(i.product_id || i.product?.id));
      const productDetails = await Promise.all(productDetailPromises);
      setProducts(productDetails.map(res => res.data));
      await refreshCartCount();
    } catch (err) {
      // Có thể show toast lỗi nếu muốn
    } finally {
      setIsUpdating(false);
    }
  };

  // Hàm xử lý khi nhập số lượng bằng tay
  const handleQuantityInputChange = (item, value) => {
    // Chỉ cho phép số >= 1
    const val = Math.max(1, parseInt(value) || 1);
    setQuantityInputs(inputs => ({ ...inputs, [item.id]: val }));
  };
  // Hàm xử lý khi blur hoặc nhấn Enter
  const handleQuantityInputCommit = async (item) => {
    const newQuantity = quantityInputs[item.id];
    if (newQuantity === item.quantity || isUpdating) return;
    await handleChangeQuantity(item, newQuantity, 'set');
  };

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

  if (loading) return <></>;

  if (error)
    return (
      <Page>
        <Title title="Cart" />
        <EmptySection name="cart" />
      </Page>
    );

  if (!cartItems.length || !products.length)
    return (
      <Page>
        <Title title="Cart" />
        <EmptySection name="cart" />
      </Page>
    );

  return (
    <Page>
      <div className="cart-bg">
        <Title title="GIỎ HÀNG" />
        <section className="cart-section">
          <div className="cart-main">
            <div className="cart-table">
              <div className="cart-table-header">
                <div className="cart-table-col select-col"><input type="checkbox" checked readOnly /> Tất cả ({cartItems.length} sản phẩm)</div>
                <div className="cart-table-col product-col">Sản phẩm</div>
                <div className="cart-table-col price-col">Đơn giá</div>
                <div className="cart-table-col qty-col">Số lượng</div>
                <div className="cart-table-col total-col">Thành tiền</div>
              </div>
              {cartItems.map((item, idx) => {
                const product = products.find(p => p.id === (item.product_id || item.product?.id));
                if (!product) return null;
                return (
                  <div className="cart-table-row" key={item.id}>
                    <div className="cart-table-col select-col"><input type="checkbox" checked readOnly /></div>
                    <div className="cart-table-col product-col">
                      <img src={product.image || product.img_url} alt={product.name} className="cart-product-img" />
                      <div className="cart-product-info">
                        <div className="cart-product-name">{product.name}</div>
                        <div className="cart-product-desc">{product.description}</div>
                      </div>
                    </div>
                    <div className="cart-table-col price-col">
                      <span className="cart-product-price">{parseInt(product.price).toLocaleString()}₫</span>
                      {product.discount && product.discount > 0 && (
                        <span className="cart-product-oldprice">{parseInt(product.price / (1 - product.discount / 100)).toLocaleString()}₫</span>
                      )}
                    </div>
                    <div className="cart-table-col qty-col">
                      <button className="cart-qty-btn" disabled={isUpdating} onClick={() => handleChangeQuantity(item, item.quantity, 'minus')}>-</button>
                      <input
                        type="number"
                        min={1}
                        value={quantityInputs[item.id] || item.quantity}
                        className="cart-qty-input"
                        disabled={isUpdating}
                        onChange={e => handleQuantityInputChange(item, e.target.value)}
                        onBlur={() => handleQuantityInputCommit(item)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.target.blur(); } }}
                      />
                      <button className="cart-qty-btn" disabled={isUpdating} onClick={() => handleChangeQuantity(item, item.quantity, 'plus')}>+</button>
                    </div>
                    <div className="cart-table-col total-col">
                      <span className="cart-product-total">{(parseInt(product.price) * item.quantity).toLocaleString()}₫</span>
                    </div>
                  </div>
                );
              })}
              {isUpdating && (
                <div className="cart-loading-overlay">
                  <div className="cart-loading-spinner"></div>
                </div>
              )}
              {/* Promo and shipping info row (optional, can be expanded) */}
              <div className="cart-table-row cart-table-row-promo">
                <div className="cart-table-col promo-col" colSpan={6}>
                  <span className="cart-shipping-info">🚚 Freeship 10k đơn từ 45k, Freeship 25k đơn từ 100k <span className="cart-shipping-info-icon">i</span></span>
                </div>
              </div>
            </div>
          </div>
          <aside>
            <div className="cart-sidebar">
              <div className="cart-shipping-box">
                <div className="cart-shipping-title">
                  Giao tới <span className="cart-shipping-change" onClick={() => setShowEdit(true)}>Thay đổi</span>
                </div>
                {!showEdit ? (
                  <>
                    <div className="cart-shipping-user">{user.name || 'Chưa đăng nhập'} <span className="cart-shipping-phone">{user.phone || ''}</span></div>
                    <div className="cart-shipping-address">{user.address || 'Vui lòng cập nhật địa chỉ giao hàng'}</div>
                  </>
                ) : (
                  <div className="cart-edit-form">
                    <input name="name" value={editData.name} onChange={handleEditChange} placeholder="Họ tên" className="cart-edit-input" />
                    <input name="phone" value={editData.phone} onChange={handleEditChange} placeholder="Số điện thoại" className="cart-edit-input" />
                    <input name="address" value={editData.address} onChange={handleEditChange} placeholder="Địa chỉ" className="cart-edit-input" />
                    <button onClick={handleSaveAddress} disabled={saving} className="cart-edit-save">Lưu</button>
                    <button onClick={() => setShowEdit(false)} className="cart-edit-cancel">Hủy</button>
                  </div>
                )}
              </div>
              <div className="cart-summary-box">
                <div className="cart-summary-row">
                  <span>Tổng tiền hàng</span>
                  <span>{total.toLocaleString()}₫</span>
                </div>
                <div className="cart-summary-row">
                  <span>Giảm giá trực tiếp</span>
                  <span>-{discount.toLocaleString()}₫</span>
                </div>
                <div className="cart-summary-row cart-summary-total">
                  <span>Tổng tiền thanh toán</span>
                  <span>{finalTotal.toLocaleString()}₫</span>
                </div>
                <div className="cart-summary-row cart-summary-saved">
                  <span>Tiết kiệm</span>
                  <span>{totalSavings.toLocaleString()}₫</span>
                </div>
                <button
                  className="cart-summary-checkout"
                  onClick={() => router.push('/checkout')}
                >
                  Mua Hàng ({cartItems.length})
                </button>
              </div>
        </div>
          </aside>
      </section>
      </div>
      <style jsx>{`
        .cart-bg {
          background: #f5f5fa;
          min-height: 100vh;
          padding: 0 0 40px 0;
          font-family: 'Roboto', Arial, sans-serif;
        }
        .cart-section {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: flex-start;
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'Roboto', Arial, sans-serif;
        }
        .cart-main {
          flex: 1 1 0;
          min-width: 0;
        }
        .cart-table {
          position: relative;
          width: 100%;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 0 0 24px 0;
          margin-top: 8px;
        }
        .cart-table-header, .cart-table-row {
          display: flex;
          align-items: center;
        }
        .cart-table-header {
          font-weight: 600;
          color: #888;
          background: #fafbfc;
          padding: 18px 0 18px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .cart-table-row {
          border-bottom: 1px solid #f0f0f0;
          padding: 18px 0;
        }
        .cart-table-row-promo {
          background: #fafbfc;
          border-bottom: none;
          padding: 0 0 18px 0;
        }
        .cart-table-col {
          padding: 0 12px;
          display: flex;
          align-items: center;
        }
        .select-col { width: 180px; }
        .shop-col { width: 140px; color: #1a94ff; font-weight: 500; }
        .product-col { flex: 2; display: flex; align-items: center; }
        .price-col { width: 140px; color: #e53935; font-weight: 700; flex-direction: column; }
        .qty-col { width: 120px; }
        .total-col { width: 140px; color: #e53935; font-weight: 700; }
        .promo-col { flex: 1; justify-content: flex-start; gap: 32px; color: #1a94ff; font-size: 15px; }
        .cart-promo-link { color: #1a94ff; cursor: pointer; margin-right: 24px; }
        .cart-shipping-info { color: #388e3c; font-size: 14px; margin-left: 12px; }
        .cart-shipping-info-icon { color: #888; font-size: 13px; margin-left: 4px; }
        .cart-product-img {
          width: 60px;
          height: 60px;
          object-fit: contain;
          border-radius: 6px;
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
          margin-bottom: 2px;
        }
        .cart-product-desc {
          font-size: 13px;
          color: #888;
        }
        .cart-product-price {
          color: #e53935;
          font-weight: 700;
          font-size: 16px;
          margin-right: 8px;
        }
        .cart-product-oldprice {
          color: #888;
          font-size: 13px;
          text-decoration: line-through;
        }
        .cart-qty-btn {
          width: 28px;
          height: 28px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .cart-qty-input {
          width: 48px;
          text-align: center;
          margin: 0 4px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .cart-product-total {
          color: #e53935;
          font-weight: 700;
          font-size: 16px;
        }
        .cart-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 320px;
          max-width: 360px;
        }
        .cart-shipping-box {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 18px 20px 18px 20px;
          margin-bottom: 8px;
        }
        .cart-shipping-title {
          font-weight: 600;
          color: #222;
          margin-bottom: 8px;
        }
        .cart-shipping-change {
          color: #1a94ff;
          font-size: 14px;
          cursor: pointer;
          float: right;
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
        .cart-summary-box {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 18px 20px 18px 20px;
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
          color: #e53935;
        }
        .cart-summary-saved {
          color: #388e3c;
          font-size: 15px;
        }
        .cart-summary-checkout {
          width: 100%;
          background: #e53935;
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          border: none;
          border-radius: 4px;
          padding: 14px 0;
          margin-top: 18px;
          cursor: pointer;
        }
        @media (max-width: 1100px) {
          .cart-section {
            flex-direction: column;
            justify-content: space-between;
            gap: 0;
          }
          .cart-sidebar {
            max-width: 100%;
            min-width: 0;
            margin-top: 32px;
          }
          .cart-main {
            padding-left: 0px;
          }
        }
        :global(body) {
          font-family: 'Roboto', Arial, sans-serif;
        }
        .cart-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.6);
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
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cart-edit-form { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; }
        .cart-edit-input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; }
        .cart-edit-save { background: #1a94ff; color: #fff; border: none; border-radius: 6px; padding: 8px 0; font-weight: 700; cursor: pointer; margin-top: 6px; }
        .cart-edit-cancel { background: #eee; color: #333; border: none; border-radius: 6px; padding: 8px 0; font-weight: 500; cursor: pointer; margin-top: 2px; }
      `}</style>
    </Page>
  );
}
