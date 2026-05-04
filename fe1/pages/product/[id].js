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
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { refreshCartCount } = useCart();
  const descRef = useRef(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descNeedsToggle, setDescNeedsToggle] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        if (response && response.status && response.data) {
          setProduct(response.data);
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
              <div className="pd-image-wrap">
                <img src={resolveMediaUrl(product.image)} alt={product.name} />
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
        </div>
      </div>

      <style jsx>{`
        .pd-page {
          background: linear-gradient(180deg, #f8faff 0%, #f3f5fb 100%);
          min-height: calc(100vh - 80px);
          padding: 24px 16px 40px;
        }
        .pd-shell {
          max-width: 1280px;
          margin: 0 auto;
        }
        .pd-main-card {
          display: grid;
          grid-template-columns: minmax(280px, 1fr) minmax(380px, 1.4fr) minmax(260px, 0.8fr);
          gap: 24px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 14px 34px rgba(17, 24, 39, 0.08);
          padding: 24px;
          border: 1px solid #edf2f7;
        }
        .pd-gallery {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }
        .pd-image-wrap {
          width: 100%;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          min-height: 0;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          overflow: hidden;
          padding: 12px;
        }
        .pd-image-wrap img {
          width: 100%;
          max-width: 100%;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .pd-info h1 {
          margin: 0;
          font-size: 2rem;
          line-height: 1.2;
          color: #0f172a;
          font-weight: 800;
        }
        .pd-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
        }
        .pd-rating-text {
          color: #64748b;
          font-weight: 600;
        }
        .pd-meta-grid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .pd-meta-item {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .pd-meta-item span {
          color: #64748b;
          font-size: 13px;
        }
        .pd-meta-item b {
          color: #0f172a;
          font-size: 15px;
        }
        .stock-ok { color: #15803d !important; }
        .stock-out { color: #dc2626 !important; }
        .pd-desc-box {
          margin-top: 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
        }
        .pd-desc-title {
          font-size: 15px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 6px;
        }
        .pd-desc-shell {
          position: relative;
        }
        .pd-desc-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 56px;
          pointer-events: none;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.9),
            #ffffff
          );
        }
        .pd-desc-toggle-wrap {
          display: flex;
          justify-content: center;
          margin-top: 12px;
          padding-top: 2px;
        }
        .pd-desc-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          padding: 10px 22px;
          border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
          color: #0f172a;
          font-weight: 700;
          font-size: 14px;
          font-family: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease,
            color 0.18s ease;
        }
        .pd-desc-toggle__inner {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .pd-desc-toggle__icon {
          font-size: 14px;
          color: #2563eb;
          flex-shrink: 0;
        }
        .pd-desc-toggle__label {
          letter-spacing: 0.01em;
        }
        .pd-desc-toggle:hover {
          border-color: #93c5fd;
          color: #1d4ed8;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.15);
          transform: translateY(-1px);
        }
        .pd-desc-toggle:hover .pd-desc-toggle__icon {
          color: #1d4ed8;
        }
        .pd-desc-toggle:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
        }
        .pd-desc-toggle:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 3px;
        }
        .pd-buybox {
          background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
          border: 1px solid #dbeafe;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: fit-content;
          position: sticky;
          top: 16px;
        }
        .pd-main-price {
          color: #dc2626;
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.1;
        }
        .pd-discount-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
        }
        .pd-old-price {
          color: #64748b;
          text-decoration: line-through;
          font-size: 14px;
          font-weight: 500;
        }
        .pd-discount-badge {
          color: #fff;
          background: #ef4444;
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 800;
        }
        .pd-qty-box > span {
          color: #334155;
          font-size: 14px;
          font-weight: 700;
        }
        .pd-qty-control {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
        }
        .pd-qty-control button {
          width: 36px;
          height: 36px;
          border: none;
          background: #fff;
          cursor: pointer;
          font-size: 18px;
        }
        .pd-qty-control input {
          width: 58px;
          height: 36px;
          border: none;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          text-align: center;
          outline: none;
          font-weight: 700;
        }
        .pd-buy-now,
        .pd-add-cart {
          width: 100%;
          border-radius: 10px;
          padding: 12px 0;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .pd-buy-now {
          border: none;
          color: #fff;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 10px 24px rgba(220, 38, 38, 0.22);
        }
        .pd-buy-now:hover:not(:disabled),
        .pd-add-cart:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .pd-add-cart {
          border: 1.5px solid #ef4444;
          color: #dc2626;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .pd-buy-now:disabled,
        .pd-add-cart:disabled {
          opacity: 0.55;
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
          color: #374151;
          line-height: 1.65;
          font-size: 15px;
          text-align: left;
          word-wrap: break-word;
          overflow-wrap: anywhere;
          overflow-x: auto;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body p {
          margin: 0 0 12px;
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
          margin: 14px 0;
          border-radius: 8px;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body figure,
        .pd-desc-shell .pd-desc-body picture {
          max-width: 100% !important;
          margin: 12px 0;
          text-align: left;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body svg {
          max-width: 100%;
          height: auto;
        }
        .pd-desc-shell .pd-desc-body a {
          color: #2563eb;
          word-break: break-word;
        }
        .pd-desc-shell .pd-desc-body ul,
        .pd-desc-shell .pd-desc-body ol {
          margin: 8px 0;
          padding-left: 1.35em;
        }
        .pd-desc-shell .pd-desc-body table {
          width: 100% !important;
          max-width: 100% !important;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 14px;
          display: table;
          table-layout: fixed;
          box-sizing: border-box;
        }
        .pd-desc-shell .pd-desc-body th,
        .pd-desc-shell .pd-desc-body td {
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          text-align: left;
          vertical-align: top;
          word-break: break-word;
        }
        .pd-desc-shell .pd-desc-body h1,
        .pd-desc-shell .pd-desc-body h2,
        .pd-desc-shell .pd-desc-body h3,
        .pd-desc-shell .pd-desc-body h4 {
          margin: 16px 0 8px;
          line-height: 1.3;
          color: #0f172a;
        }
        .pd-desc-shell .pd-desc-body video {
          max-width: 100%;
          height: auto;
        }
      `}</style>
      </>
    </Page>
  );
}
