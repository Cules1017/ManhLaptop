import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Page from '../../components/page';
import ErrorAlert from '../../components/alerts/error';
import LoadingPage from '../../components/loading-page';
import { productService } from '../../services/productService';
import StarRatings from 'react-star-ratings';
import { FaCartPlus } from 'react-icons/fa';
import { apiRequest } from '../../utils/apiRequest';
import { toast } from 'react-toastify';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        if (response && response.status && response.data) {
          setProduct(response.data);
        } else {
          setError('This product is not found!');
        }
      } catch (err) {
        setError('This product is not found!');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Page title="MANH STORE - Products">
        <LoadingPage />
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="MANH STORE - Products">
        <ErrorAlert message={error}></ErrorAlert>
      </Page>
    );
  }

  if (!product) {
    return (
      <Page title="MANH STORE - Products">
        <ErrorAlert message="This product is not found!" />
      </Page>
    );
  }

  // Tính giá sau giảm
  const hasDiscount = product.discount && product.discount > 0;
  const priceAfterDiscount = hasDiscount
    ? (product.price * (1 - product.discount / 100)).toFixed(0)
    : product.price;

  return (
    <Page title={`MANH STORE - ${product.name}`}> 
      <div className="product-detail-layout">
        {/* Ảnh sản phẩm */}
        <div className="product-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        {/* Thông tin sản phẩm */}
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <div className="product-detail-rating">
            <StarRatings
              rating={parseFloat(product.rating) || 0}
              starRatedColor="#F9AD3D"
              numberOfStars={5}
              name="rating"
              starDimension="20px"
              starSpacing="1px"
            />
            <span style={{ marginLeft: 8, color: '#888' }}>{product.rating || 0}/5</span>
          </div>
          <div className="product-detail-category">
            Category: <b>{product.category?.name}</b>
          </div>
          <div className="product-detail-description">
            {product.description}
          </div>
        </div>
        {/* Box mua hàng */}
        <div className="product-detail-buybox">
          <div className="product-detail-price">
            {hasDiscount && (
              <span className="old-price">{product.price}₫</span>
            )}
            <span className="main-price">{priceAfterDiscount}₫</span>
            {hasDiscount && (
              <span className="discount">-{product.discount}%</span>
            )}
          </div>
          <div className="product-detail-qty">
            <span>Số lượng:</span>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
            />
            <button onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>
          <button
            className='buy-now'
            disabled={adding}
            onClick={async () => {
              setAdding(true);
              try {
                const res = await apiRequest(
                  'http://127.0.0.1:8000/api/cart/add',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: product.id, quantity }),
                  }
                );
                if (res.status) {
                  toast.success('Đã thêm vào giỏ hàng!', { position: 'top-center' });
                  router.push('/cart');
                } else {
                  toast.error('Thêm vào giỏ hàng thất bại!', { position: 'top-center' });
                }
              } catch (err) {
                // popup lỗi đã được xử lý trong apiRequest
              } finally {
                setAdding(false);
              }
            }}
          >
            Mua ngay
          </button>
          <button
            className="add-to-cart"
            disabled={adding}
            onClick={async () => {
              setAdding(true);
              try {
                const res = await apiRequest(
                  `http://127.0.0.1:8000/api/cart/add`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: product.id, quantity }),
                  }
                );
                if (res.status) {
                  toast.success('Đã thêm vào giỏ hàng!', { position: 'top-center' });
                } else {
                  toast.error('Thêm vào giỏ hàng thất bại!', { position: 'top-center' });
                }
              } catch (err) {
                // popup lỗi đã được xử lý trong apiRequest
              } finally {
                setAdding(false);
              }
            }}
          >
            <FaCartPlus style={{ marginRight: 8 }} /> Thêm vào giỏ
          </button>
        </div>
      </div>
      <style jsx>{`
        .product-detail-layout {
          display: flex;
          flex-direction: row;
          gap: 32px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 32px;
          margin: 32px auto;
          max-width: 1200px;
        }
        .product-detail-image {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-detail-image img {
          max-width: 320px;
          max-height: 400px;
          border-radius: 8px;
          object-fit: contain;
          background: #fafafa;
        }
        .product-detail-info {
          flex: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .product-detail-info h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .product-detail-rating {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .product-detail-category {
          margin-bottom: 16px;
          color: #888;
        }
        .product-detail-description {
          font-size: 1rem;
          color: #444;
          margin-bottom: 24px;
        }
        .product-detail-buybox {
          flex: 1;
          background: #fafbfc;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.03);
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 260px;
          max-width: 320px;
          height: fit-content;
        }
        .product-detail-price {
          font-size: 2rem;
          font-weight: 700;
          color: #e53935;
          margin-bottom: 16px;
        }
        .product-detail-price .old-price {
          text-decoration: line-through;
          color: #888;
          font-size: 1.1rem;
          margin-right: 12px;
        }
        .product-detail-price .main-price {
          color: #e53935;
          margin-right: 12px;
        }
        .product-detail-price .discount {
          color: #388e3c;
          font-weight: 600;
        }
        .product-detail-qty {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .product-detail-qty span {
          margin-right: 8px;
        }
        .product-detail-qty button {
          width: 28px;
          height: 28px;
          border: 1px solid #ddd;
          background: #fff;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .product-detail-qty input {
          width: 48px;
          text-align: center;
          margin: 0 4px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .buy-now {
          width: 100%;
          background: #e53935;
          color: #fff;
          font-weight: 700;
          font-size: 1.1rem;
          border: none;
          border-radius: 4px;
          padding: 12px 0;
          margin-bottom: 10px;
          cursor: pointer;
        }
        .add-to-cart {
          width: 100%;
          background: #fff;
          color: #e53935;
          font-weight: 700;
          font-size: 1.1rem;
          border: 2px solid #e53935;
          border-radius: 4px;
          padding: 12px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 900px) {
          .product-detail-layout {
            flex-direction: column;
            padding: 16px;
            gap: 16px;
          }
          .product-detail-buybox {
            max-width: 100%;
            width: 100%;
          }
        }
      `}</style>
    </Page>
  );
}
