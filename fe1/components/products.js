import { useState, useEffect } from 'react';
import ProductItem from './productItem';
import ProductsGrid from './productsGrid';
import LoadingPage from './loading-page';
import { productService } from '../services/productService';

export default function Products({ category, sortParams }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        category,
        sort_by: sortParams?.field || 'rating',
        sort_order: sortParams?.order || 'DESC'
      });
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sortParams]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!Array.isArray(products) || products.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Không có sản phẩm nào thuộc danh mục này</div>;
  }

  return (
    <div className="products">
      <div className="container">
        <div className="products-grid">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              id={product.id}
              name={product.name}
              rating={product.rating}
              img_url={product.image}
              price={product.price}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .products {
          padding: 40px 0;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 30px;
          margin-top: 30px;
        }
      `}</style>
    </div>
  );
}
