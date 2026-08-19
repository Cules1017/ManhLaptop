import Link from 'next/link';
import { FaCartPlus, FaRegHeart, FaHeart } from 'react-icons/fa';
import StarRatings from 'react-star-ratings';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import {
  getOriginalPrice,
  getFinalPrice,
  getDiscountPercent,
  hasDiscount,
  formatVND,
} from '../utils/price';
import styles from '../styles/ProductItem.module.css';

export default function ProductItem({ id, name, rating, img_url, price, discount }) {
  const [isWishlist, setIsWishlist] = useState(false);
  const [adding, setAdding] = useState(false);
  const { refreshCartCount } = useCart();

  // ProductItem được dùng từ nhiều nơi với props khác nhau, nên tự build product-like object
  const product = { price, discount };

  const getWishlistKey = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user && user.id ? `wishlist_${user.id}` : 'wishlist_guest';
    } catch {
      return 'wishlist_guest';
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const wishlist = JSON.parse(localStorage.getItem(getWishlistKey()) || '{"products": []}');
      setIsWishlist(wishlist.products.includes(id));
    } catch {
      setIsWishlist(false);
    }
  }, [id]);

  const toggleWishlist = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof window === 'undefined') return;
    const key = getWishlistKey();
    let wishlist;
    try {
      wishlist = JSON.parse(localStorage.getItem(key) || '{"products": []}');
    } catch {
      wishlist = { products: [] };
    }
    const inList = wishlist.products.includes(id);
    wishlist.products = inList
      ? wishlist.products.filter((pid) => pid !== id)
      : [...wishlist.products, id];
    localStorage.setItem(key, JSON.stringify(wishlist));
    setIsWishlist(!inList);
    toast.success(inList ? 'Đã xoá khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích', {
      position: 'top-center',
      autoClose: 1500,
    });
  };

  const handleAddCart = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng', { position: 'top-center' });
      return;
    }
    setAdding(true);
    try {
      const res = await productService.addToCart({ product_id: id, quantity: 1 });
      if (res.status) {
        await refreshCartCount?.();
        toast.success('Đã thêm vào giỏ hàng!', { position: 'top-center', autoClose: 1500 });
      } else {
        toast.error(res.message || 'Thêm vào giỏ hàng thất bại', { position: 'top-center' });
      }
    } catch {
      // popup từ apiRequest
    } finally {
      setAdding(false);
    }
  };

  const finalPrice = getFinalPrice(product);
  const originalPrice = getOriginalPrice(product);
  const discountPercent = getDiscountPercent(product);

  return (
    <div className={styles['product-item']}>
      <div className={styles['top-buttons']}>
        {discountPercent > 0 && (
          <span className={styles['discount-badge']}>-{discountPercent}%</span>
        )}
        <button
          className={styles['add-wishlist']}
          onClick={toggleWishlist}
          aria-label="Yêu thích"
        >
          {isWishlist ? (
            <FaHeart size={20} color="#e53935" />
          ) : (
            <FaRegHeart size={20} color="#B0B0B0" />
          )}
        </button>
      </div>

      <Link href={`/product/${id}`}>
        <a className={styles['product-link']}>
          <div className={styles['product-content']}>
            <div className={styles['product-image']}>
              <img
                src={img_url || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'}
                alt={name}
                width={200}
                height={200}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/400x400/eeeeee/999999?text=Image+Not+Found';
                }}
                style={{
                  objectFit: 'contain',
                  width: '100%',
                  height: '200px',
                  borderRadius: 8,
                  mixBlendMode: 'multiply'
                }}
              />
            </div>
            <div className={styles['product-info']}>
              <h3 title={name}>{name}</h3>
              <div className={styles.rating}>
                <StarRatings
                  rating={parseFloat(rating) || 0}
                  starRatedColor="#F9AD3D"
                  numberOfStars={5}
                  name={`rating-${id}`}
                  starDimension="16px"
                  starSpacing="1px"
                />
                <span className={styles['rating-text']}>{rating || 0}/5</span>
              </div>
              <div className={styles.price}>
                <span className={styles['final-price']}>{formatVND(finalPrice)}</span>
                {hasDiscount(product) && (
                  <span className={styles['old-price']}>{formatVND(originalPrice)}</span>
                )}
              </div>
            </div>
          </div>
        </a>
      </Link>

      <button
        className={styles['add-cart-btn']}
        onClick={handleAddCart}
        disabled={adding}
        aria-label="Thêm vào giỏ hàng"
      >
        <FaCartPlus style={{ marginRight: 6 }} />
        {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
      </button>
    </div>
  );
}
