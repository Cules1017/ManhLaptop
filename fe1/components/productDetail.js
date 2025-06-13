import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { productService } from '../services/productService';
import LoadingPage from './loading-page';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await productService.getProductById(id);
        if (response.status) {
          setProduct(response.data);
        } else {
          setError('Failed to fetch product details');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-info">
        <h1>{product.name}</h1>
        <p className="price">${product.price}</p>
        {product.discount > 0 && (
          <p className="discount">Discount: {product.discount}%</p>
        )}
        <p className="description">{product.description}</p>
        <div className="category">
          Category: {product.category?.name}
        </div>
        <div className="rating">
          Rating: {product.rating}
        </div>
      </div>
    </div>
  );
} 