import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import ProductItem from './productItem';
import LoadingPage from './loading-page';
import { productService } from '../services/productService';
export default function Products({ category, sortParams }) {
  const router = useRouter();
  const search = (router?.query?.search || '').toString().trim();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        category,
        search: search || undefined,
        sort_by: sortParams?.field || 'rating',
        sort_order: sortParams?.order || 'DESC',
        page,
      });
      if (response && response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
          setPagination({
            current_page: response.data.current_page,
            last_page: response.data.last_page,
            total: response.data.total,
          });
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
          setPagination(null);
        } else {
          setProducts([]);
          setPagination(null);
        }
      } else {
        setProducts([]);
        setPagination(null);
      }
      setError(null);
    } catch (err) {
      setError('Không tải được danh sách sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Khi đổi filter (category, search, sort) thì reset về trang 1
  useEffect(() => {
    setPage(1);
  }, [category, sortParams, search]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sortParams, search, page]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--danger)' }}>{error}</div>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
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
          <p style={{ margin: '0 0 12px', color: 'var(--text-main)' }}>
            Kết quả tìm kiếm cho: <strong>{search}</strong> ({products.length} sản phẩm)
          </p>
        )}
        <motion.div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px',
            marginTop: '20px'
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
        >
          {products.map((product) => (
            <motion.div 
              key={product.id}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
              }}
            >
              <ProductItem
                id={product.id}
                name={product.name}
                rating={product.rating}
                img_url={product.image}
                price={product.price}
                discount={product.discount}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Phân trang */}
        {pagination && pagination.last_page > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              disabled={pagination.current_page === 1} 
              onClick={() => {
                setPage(prev => prev - 1);
                window.scrollTo({ top: document.getElementById('product')?.offsetTop - 100 || 0, behavior: 'smooth' });
              }}
            >
              Trang trước
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-num-btn ${p === pagination.current_page ? 'active' : ''}`}
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: document.getElementById('product')?.offsetTop - 100 || 0, behavior: 'smooth' });
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            
            <button 
              className="page-btn"
              disabled={pagination.current_page === pagination.last_page} 
              onClick={() => {
                setPage(prev => prev + 1);
                window.scrollTo({ top: document.getElementById('product')?.offsetTop - 100 || 0, behavior: 'smooth' });
              }}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .products {
          padding: 40px 0;
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 40px;
        }
        .page-btn {
          padding: 8px 16px;
          border: 1px solid var(--border-color, #e5e7eb);
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-main, #374151);
          transition: all 0.2s ease;
        }
        .page-btn:not(:disabled):hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f3f4f6;
        }
        .page-numbers {
          display: flex;
          gap: 8px;
        }
        .page-num-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color, #e5e7eb);
          background: #fff;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-main, #374151);
          transition: all 0.2s ease;
        }
        .page-num-btn:hover {
          background: #f9fafb;
        }
        .page-num-btn.active {
          background: #1e3a8a;
          color: #fff;
          border-color: #1e3a8a;
        }
        @media (max-width: 640px) {
          .pagination {
            flex-direction: column;
            gap: 12px;
          }
          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
