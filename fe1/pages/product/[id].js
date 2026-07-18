import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Page from '../../components/page';
import ErrorAlert from '../../components/alerts/error';
import LoadingPage from '../../components/loading-page';
import { productService } from '../../services/productService';
import StarRatings from 'react-star-ratings';
import { FaCartPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import ProductItem from '../../components/productItem';
import {
  getOriginalPrice,
  getFinalPrice,
  getDiscountPercent,
  hasDiscount,
  formatVND,
} from '../../utils/price';

const API_ORIGIN = 'http://127.0.0.1:8000';
/** Chiều cao tối đa khi thu gọn mô tả (px). Đổi giá trị này để chỉnh độ cao khối trước khi bấm «Xem thêm». */
const DESC_COLLAPSED_MAX_PX = 360;

/** Ảnh / file từ Laravel (/storage/...) */
function resolveMediaUrl(src) {
  if (!src || typeof src !== 'string') return '';
  const t = src.trim();
  if (/^https?:\/\//i.test(t)) return t;
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${API_ORIGIN}${path}`;
}

/** Chuẩn bị HTML mô tả (TinyMCE): bỏ script/on*, sửa URL tương đối */
function prepareProductHtml(html) {
  if (!html || typeof html !== 'string') return '';
  let s = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
  s = s.replace(/\son\w+=(["'])[\s\S]*?\1/gi, '');
  s = s.replace(/src="\/(?!\/)/gi, `src="${API_ORIGIN}/`);
  s = s.replace(/src='\/(?!\/)/gi, `src='${API_ORIGIN}/`);
  return s;
}

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { refreshCartCount } = useCart();
  const descRef = useRef(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descNeedsToggle, setDescNeedsToggle] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const allImages = [product.image, ...(product.images || []).map(img => img.image_url)].filter(Boolean);
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setSelectedImage((current) => {
        const currentIndex = allImages.indexOf(current);
        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % allImages.length;
        
        // Tự động cuộn thumbnail tương ứng vào giữa mà KHÔNG làm nhảy trang (vertical scroll)
        const thumbEl = document.getElementById(`pd-thumb-${nextIndex}`);
        const container = document.querySelector('.pd-thumbnail-strip');
        if (thumbEl && container) {
          const scrollLeft = thumbEl.offsetLeft - container.offsetWidth / 2 + thumbEl.offsetWidth / 2;
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
        
        return allImages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [product]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        if (response && response.status && response.data) {
          setProduct(response.data);
          setRelatedProducts(response.related || []);
        } else {
          setError('Không tìm thấy sản phẩm');
        }
      } catch (err) {
        setError('Không tìm thấy sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    setDescExpanded(false);
    setDescNeedsToggle(false);
  }, [id]);

  /** Đo sau paint: ảnh/HTML TinyMCE làm scrollHeight đổi trễ; thêm heuristic độ dài để luôn có «Xem thêm» khi nội dung rõ ràng là dài. */
  useEffect(() => {
    if (loading) {
      setDescNeedsToggle(false);
      return;
    }

    const raw = typeof product?.description === 'string' ? product.description.trim() : '';
    if (!raw) {
      setDescNeedsToggle(false);
      return;
    }

    const el = descRef.current;
    if (!el) {
      setDescNeedsToggle(false);
      return;
    }

    const prepared = prepareProductHtml(raw);
    const plainLen = prepared.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
    const longByChars = prepared.length > 550 || plainLen > 220;

    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const node = descRef.current;
      if (!node) return;
      const prevMax = node.style.maxHeight;
      const prevOv = node.style.overflow;
      node.style.maxHeight = 'none';
      node.style.overflow = 'visible';
      const fullH = node.scrollHeight;
      node.style.maxHeight = prevMax;
      node.style.overflow = prevOv;
      const longByHeight = fullH > DESC_COLLAPSED_MAX_PX;
      setDescNeedsToggle(longByHeight || longByChars);
    };

    const imgs = Array.from(el.querySelectorAll('img'));
    const onImg = () => {
      requestAnimationFrame(measure);
    };
    imgs.forEach((img) => {
      img.addEventListener('load', onImg);
      img.addEventListener('error', onImg);
    });

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }

    measure();
    const raf1 = requestAnimationFrame(() => {
      measure();
      requestAnimationFrame(measure);
    });
    const t1 = setTimeout(measure, 120);
    const t2 = setTimeout(measure, 450);
    const t3 = setTimeout(measure, 1200);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      imgs.forEach((img) => {
        img.removeEventListener('load', onImg);
        img.removeEventListener('error', onImg);
      });
      if (ro) ro.disconnect();
    };
  }, [loading, product?.id, product?.description]);

  if (loading) {
    return (
      <Page title="MANH STORE - Sản phẩm">
        <LoadingPage />
      </Page>
    );
  }

  if (error || !product) {
    return (
      <Page title="MANH STORE - Sản phẩm">
        <ErrorAlert message={error || 'Không tìm thấy sản phẩm'} />
      </Page>
    );
  }

  const finalPrice = getFinalPrice(product);
  const originalPrice = getOriginalPrice(product);
  const discountPercent = getDiscountPercent(product);

  const ensureLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng', { position: 'top-center' });
      router.push('/user/login');
      return false;
    }
    return true;
  };

  const addToCart = async ({ redirectToCart }) => {
    if (!ensureLoggedIn()) return;
    setAdding(true);
    try {
      const res = await productService.addToCart({
        product_id: product.id,
        quantity,
      });
      if (res.status) {
        await refreshCartCount?.();
        toast.success('Đã thêm vào giỏ hàng!', { position: 'top-center' });
        if (redirectToCart) router.push('/cart');
      } else {
        toast.error(res.message || 'Thêm vào giỏ hàng thất bại', { position: 'top-center' });
      }
    } catch {
      // popup lỗi đã được xử lý trong apiRequest
    } finally {
      setAdding(false);
    }
  };

  const inStock = Number(product.quantity || 0) > 0;

  return (
    <Page title={`MANH STORE - ${product.name}`}>
      <>
      <div className="pd-page">
        <div className="pd-shell">
          <div className="pd-main-card">
            <div className="pd-gallery">
              <div className="pd-gallery-inner">
                <div className="pd-image-wrap">
                  <img 
                    src={resolveMediaUrl(selectedImage || product.image) || 'https://placehold.co/800x800/eeeeee/999999?text=No+Image'} 
                    alt={product.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/800x800/eeeeee/999999?text=Image+Not+Found';
                    }}
                  />
                </div>
                {product.images && product.images.length > 0 && (
                  <div className="pd-thumbnail-strip">
                    {[product.image, ...product.images.map(img => img.image_url)].filter(Boolean).map((imgUrl, idx) => (
                      <div 
                        id={`pd-thumb-${idx}`}
                        key={idx} 
                        className={`pd-thumbnail ${selectedImage === imgUrl ? 'active' : ''}`}
                        onClick={(e) => {
                          setSelectedImage(imgUrl);
                          const thumbEl = e.currentTarget;
                          const container = document.querySelector('.pd-thumbnail-strip');
                          if (thumbEl && container) {
                            const scrollLeft = thumbEl.offsetLeft - container.offsetWidth / 2 + thumbEl.offsetWidth / 2;
                            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                          }
                        }}
                      >
                        <img 
                          src={resolveMediaUrl(imgUrl)} 
                          alt={`${product.name} thumbnail ${idx}`}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pd-info">
              <h1>{product.name}</h1>

              <div className="pd-rating-row">
                <StarRatings
                  rating={parseFloat(product.rating) || 0}
                  starRatedColor="#F9AD3D"
                  numberOfStars={5}
                  name="rating"
                  starDimension="20px"
                  starSpacing="1px"
                />
                <span className="pd-rating-text">{product.rating || 0}/5</span>
              </div>

              <div className="pd-meta-grid">
                <div className="pd-meta-item">
                  <span>Danh mục</span>
                  <b>{product.category?.name || product.category?.label || '—'}</b>
                </div>
                <div className="pd-meta-item">
                  <span>Tồn kho</span>
                  <b className={inStock ? 'stock-ok' : 'stock-out'}>
                    {inStock ? `${product.quantity} sản phẩm` : 'Hết hàng'}
                  </b>
                </div>
              </div>

              <div className="pd-desc-box">
                <div className="pd-desc-title">Mô tả sản phẩm</div>
                <div className="pd-desc-shell">
                  <div
                    key={`pd-desc-${product.id}`}
                    ref={descRef}
                    className="pd-desc-body"
                    style={
                      descNeedsToggle && !descExpanded
                        ? { maxHeight: DESC_COLLAPSED_MAX_PX, overflow: 'hidden' }
                        : undefined
                    }
                    dangerouslySetInnerHTML={{
                      __html: prepareProductHtml(product.description || ''),
                    }}
                  />
                  {descNeedsToggle && !descExpanded ? (
                    <div className="pd-desc-fade" aria-hidden="true" />
                  ) : null}
                </div>
                {descNeedsToggle ? (
                  <div className="pd-desc-toggle-wrap">
                    <button
                      type="button"
                      className="pd-desc-toggle"
                      aria-expanded={descExpanded}
                      onClick={() => setDescExpanded((v) => !v)}
                    >
                      <span className="pd-desc-toggle__inner">
                        {descExpanded ? (
                          <FaChevronUp className="pd-desc-toggle__icon" aria-hidden />
                        ) : (
                          <FaChevronDown className="pd-desc-toggle__icon" aria-hidden />
                        )}
                        <span className="pd-desc-toggle__label">
                          {descExpanded ? 'Thu gọn' : 'Xem thêm'}
                        </span>
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pd-buybox">
              <div className="pd-price-block">
                <span className="pd-main-price">{formatVND(finalPrice)}</span>
                {hasDiscount(product) && (
                  <div className="pd-discount-row">
                    <span className="pd-old-price">{formatVND(originalPrice)}</span>
                    <span className="pd-discount-badge">-{discountPercent}%</span>
                  </div>
                )}
              </div>

              <div className="pd-qty-box">
                <span>Số lượng</span>
                <div className="pd-qty-control">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={product.quantity || undefined}
                    value={quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isFinite(v) || v < 1) {
                        setQuantity(1);
                      } else {
                        setQuantity(product.quantity ? Math.min(v, product.quantity) : v);
                      }
                    }}
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) => (product.quantity ? Math.min(product.quantity, q + 1) : q + 1))
                    }
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className="pd-buy-now"
                disabled={adding || !inStock}
                onClick={() => addToCart({ redirectToCart: true })}
              >
                {inStock ? 'Mua ngay' : 'Hết hàng'}
              </button>
              <button
                className="pd-add-cart"
                disabled={adding || !inStock}
                onClick={() => addToCart({ redirectToCart: false })}
              >
                <FaCartPlus style={{ marginRight: 8 }} /> Thêm vào giỏ
              </button>
            </div>
          </div>

          {/* RELATED PRODUCTS SECTION */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="pd-related-section">
              <h2 className="pd-related-title">Sản phẩm liên quan</h2>
              <div className="pd-related-grid">
                {relatedProducts.map(p => (
                  <ProductItem 
                    key={p.id} 
                    id={p.id}
                    name={p.name}
                    rating={p.rating}
                    img_url={resolveMediaUrl(p.image)}
                    price={p.price}
                    discount={p.discount}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .pd-page {
          background: var(--bg-color);
          min-height: calc(100vh - 80px);
          padding: 32px 16px 64px;
        }
        .pd-shell {
          max-width: 1280px;
          margin: 0 auto;
        }
        .pd-related-section {
          margin-top: 48px;
        }
        .pd-related-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--surface-border);
        }
        .pd-related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }
        .pd-main-card {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) minmax(380px, 1.4fr) minmax(260px, 0.8fr);
          gap: 32px;
          background: var(--surface);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 32px;
          border: 1px solid var(--surface-border);
        }
        .pd-gallery {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          min-width: 0;
        }
        .pd-gallery-inner {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          min-width: 0;
        }
        .pd-image-wrap {
          width: 100%;
          border-radius: var(--radius);
          background: var(--surface);
          border: 1px solid var(--surface-border);
          min-height: 0;
          min-width: 0;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 24px;
        }
        .pd-image-wrap img {
          width: 100%;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
          mix-blend-mode: multiply;
        }
        .pd-thumbnail-strip {
          position: relative;
          display: flex;
          gap: 12px;
          flex-wrap: nowrap;
          overflow-x: auto;
          margin-top: 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 4px;
        }
        .pd-thumbnail-strip::-webkit-scrollbar {
          display: none;
        }
        .pd-thumbnail {
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
          background: var(--surface);
          transition: all var(--transition-fast);
        }
        .pd-thumbnail:hover {
          border-color: var(--surface-border);
        }
        .pd-thumbnail.active {
          border-color: var(--accent);
        }
        .pd-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .pd-info {
          min-width: 0;
        }
        .pd-info h1 {
          margin: 0;
          font-size: 2.25rem;
          line-height: 1.25;
          color: var(--text-main);
          font-weight: 800;
        }
        .pd-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 16px;
        }
        .pd-rating-text {
          color: var(--text-muted);
          font-weight: 600;
        }
        .pd-meta-grid {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .pd-meta-item {
          background: var(--surface-hover);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pd-meta-item span {
          color: var(--text-muted);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .pd-meta-item b {
          color: var(--text-main);
          font-size: 16px;
        }
        .stock-ok { color: var(--success) !important; }
        .stock-out { color: var(--danger) !important; }
        .pd-desc-box {
          margin-top: 24px;
          background: var(--surface);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          padding: 24px;
        }
        .pd-desc-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--surface-border);
        }
        .pd-desc-shell {
          position: relative;
        }
        .pd-desc-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 80px;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            var(--surface)
          );
        }
        .pd-desc-toggle-wrap {
          display: flex;
          justify-content: center;
          margin-top: 20px;
          padding-top: 8px;
        }
        .pd-desc-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          padding: 12px 28px;
          border-radius: 999px;
          border: 1px solid var(--surface-border);
          background: var(--surface);
          color: var(--text-main);
          font-weight: 600;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }
        .pd-desc-toggle__inner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .pd-desc-toggle__icon {
          font-size: 14px;
          color: var(--secondary);
          flex-shrink: 0;
        }
        .pd-desc-toggle__label {
          letter-spacing: 0.01em;
        }
        .pd-desc-toggle:hover {
          border-color: var(--secondary);
          color: var(--secondary);
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        .pd-desc-toggle:active {
          transform: translateY(0);
          box-shadow: none;
        }
        .pd-desc-toggle:focus-visible {
          outline: 2px solid var(--secondary);
          outline-offset: 2px;
        }
        .pd-buybox {
          background: var(--surface-hover);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: fit-content;
          position: sticky;
          top: 24px;
          min-width: 0;
        }
        .pd-main-price {
          color: var(--accent);
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.1;
        }
        .pd-discount-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 8px;
        }
        .pd-old-price {
          color: var(--text-muted);
          text-decoration: line-through;
          font-size: 16px;
          font-weight: 500;
        }
        .pd-discount-badge {
          color: #fff;
          background: var(--danger);
          border-radius: var(--radius-sm);
          padding: 4px 10px;
          font-size: 13px;
          font-weight: 800;
        }
        .pd-qty-box > span {
          color: var(--text-main);
          font-size: 14px;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }
        .pd-qty-control {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--surface);
        }
        .pd-qty-control button {
          width: 44px;
          height: 44px;
          border: none;
          background: var(--surface-hover);
          cursor: pointer;
          font-size: 20px;
          color: var(--text-main);
          transition: background var(--transition-fast);
        }
        .pd-qty-control button:hover {
          background: var(--surface-border);
        }
        .pd-qty-control input {
          width: 60px;
          height: 44px;
          border: none;
          border-left: 1px solid var(--surface-border);
          border-right: 1px solid var(--surface-border);
          text-align: center;
          outline: none;
          font-weight: 700;
          font-size: 16px;
          color: var(--text-main);
          background: var(--surface);
        }
        .pd-buy-now,
        .pd-add-cart {
          width: 100%;
          border-radius: var(--radius);
          padding: 16px 0;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all var(--transition-smooth);
        }
        .pd-buy-now {
          border: none;
          color: #fff;
          background: var(--accent);
          box-shadow: 0 4px 14px var(--accent-glow);
        }
        .pd-buy-now:hover:not(:disabled) {
          background: var(--accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--accent-glow);
        }
        .pd-add-cart {
          border: 2px solid var(--accent);
          color: var(--accent);
          background: transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .pd-add-cart:hover:not(:disabled) {
          background: var(--accent-glow);
          transform: translateY(-2px);
        }
        .pd-buy-now:disabled,
        .pd-add-cart:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        @media (max-width: 1100px) {
          .pd-main-card {
            grid-template-columns: 1fr;
          }
          .pd-buybox {
            position: static;
          }
          .pd-image-wrap {
            min-height: 0;
          }
        }
      `}</style>
      <style jsx global>{`
        /* Nội dung TinyMCE: styled-jsx scoped không khớp node con từ dangerouslySetInnerHTML → dùng global dưới .pd-desc-shell */
        .pd-desc-shell .pd-desc-body {
          color: var(--text-main);
          line-height: 1.7;
          font-size: 16px;
          text-align: left;
          word-wrap: break-word;
          overflow-wrap: anywhere;
          overflow-x: auto;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body p {
          margin: 0 0 16px;
        }
        .pd-desc-shell .pd-desc-body p:last-child {
          margin-bottom: 0;
        }
        .pd-desc-shell .pd-desc-body img {
          max-width: 100% !important;
          width: auto !important;
          height: auto !important;
          object-fit: contain;
          display: block;
          margin: 24px auto;
          border-radius: var(--radius);
          box-sizing: border-box;
          mix-blend-mode: multiply;
        }
        .pd-desc-shell .pd-desc-body figure,
        .pd-desc-shell .pd-desc-body picture {
          max-width: 100% !important;
          margin: 16px 0;
          text-align: center;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body svg {
          max-width: 100%;
          height: auto;
        }
        .pd-desc-shell .pd-desc-body a {
          color: var(--secondary);
          word-break: break-word;
          text-decoration: underline;
        }
        .pd-desc-shell .pd-desc-body ul,
        .pd-desc-shell .pd-desc-body ol {
          margin: 12px 0;
          padding-left: 1.5em;
        }
        .pd-desc-shell .pd-desc-body table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 15px;
          display: table;
          table-layout: fixed;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body th,
        .pd-desc-shell .pd-desc-body td {
          border: 1px solid var(--surface-border);
          padding: 12px;
          text-align: left;
          vertical-align: top;
          word-break: break-word;
        }
        .pd-desc-shell .pd-desc-body th {
          background: var(--surface-hover);
          font-weight: 600;
        }
        .pd-desc-shell .pd-desc-body h1,
        .pd-desc-shell .pd-desc-body h2,
        .pd-desc-shell .pd-desc-body h3,
        .pd-desc-shell .pd-desc-body h4 {
          margin: 24px 0 16px;
          line-height: 1.4;
          color: var(--text-main);
          font-weight: 700;
        }
        .pd-desc-shell .pd-desc-body video {
          max-width: 100%;
          height: auto;
          border-radius: var(--radius);
        }
      `}</style>
      </>
    </Page>
  );
}
