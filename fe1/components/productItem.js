import { useQuery } from '@apollo/client';
import Link from 'next/link';
import {
  FaCartArrowDown,
  FaCartPlus,
  FaRegHeart,
  FaHeart,
} from 'react-icons/fa';
import StarRatings from 'react-star-ratings';
import { toggleCart, toggleWishlist } from '../utils/toggleProductStates';
import { CART, WISHLIST } from '../apollo/client/queries';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/ProductItem.module.css';

export default function ProductItem({ id, name, rating, img_url, price }) {
  const cart = useQuery(CART);
  const wishlist = useQuery(WISHLIST);
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    // Lấy danh sách wishlist từ localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '{"products": []}');
    setIsWishlist(wishlist.products.includes(id));
  }, [id]);

  const toggleWishlist = (productId) => {
    // Lấy danh sách wishlist hiện tại
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '{"products": []}');
    
    // Kiểm tra sản phẩm đã có trong wishlist chưa
    const isInWishlist = wishlist.products.includes(productId);
    
    if (isInWishlist) {
      // Nếu có thì xóa khỏi wishlist
      wishlist.products = wishlist.products.filter(id => id !== productId);
    } else {
      // Nếu chưa có thì thêm vào wishlist
      wishlist.products.push(productId);
    }
    
    // Lưu lại vào localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Cập nhật state
    setIsWishlist(!isInWishlist);
  };

  return (
    <div className={styles['product-item']}>
      <div className={styles['top-buttons']}>
        <button className={styles['add-wishlist']} onClick={() => toggleWishlist(id)}>
          {isWishlist ? (
            <FaHeart size={20} color="#D8D8D8" />
          ) : (
            <FaRegHeart size={20} color="#D8D8D8" />
          )}
        </button>
      </div>
      <Link href={`/product/${id}`} className={styles['product-link']}>
        <div className={styles['product-content']}>
          <div className={styles['product-image']}>
            <img
              src={img_url}
              alt={name}
              width={200}
              height={200}
              style={{ objectFit: 'cover', width: '200px', height: '200px', borderRadius: 8, background: '#fafafa' }}
            />
          </div>
          <div className={styles['product-info']}>
            <h3>{name}</h3>
            <div className={styles.rating}>Rating: {rating}</div>
            <div className={styles.price}>${price}</div>
          </div>
      </div>
      </Link>
      </div>
  );
}
