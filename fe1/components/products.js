import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProductItem from './productItem';
import LoadingPage from './loading-page';
import { productService } from '../services/productService';

export default function Products({ category, sortParams }) {
  const router = useRouter();
  const search = (router?.query?.search || '').toString().trim();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        category,
        search: search || undefined,
        sort_by: sortParams?.field || 'rating',
        sort_order: sortParams?.order || 'DESC',
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
      setError('Không tải được danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortParams, search]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#e53935' }}>{error}</div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        {search
          ? `Không tìm thấy sản phẩm nào với từ khoá "${search}"`
          : 'Không có sản phẩm nào thuộc danh mục này'}
      </div>
    );
  }

  return (
    <div className="products">
      <div className="container">
        {search && (
          <p style={{ margin: '0 0 12px', color: '#555' }}>
            Kết quả tìm kiếm cho: <strong>{search}</strong> ({products.length} sản phẩm)
          </p>
        )}
        <div className="products-grid">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              id={product.id}
              name={product.name}
              rating={product.rating}
              img_url={product.image}
              price={product.price}
              discount={product.discount}
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
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
