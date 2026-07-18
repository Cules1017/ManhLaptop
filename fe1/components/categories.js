import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import LoadingPage from './loading-page';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await productService.getCategories();
        if (response && response.data) {
          setCategories(response.data);
        } else {
          setError('Failed to fetch categories');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="categories">
      <h2>Categories</h2>
      <div className="category-list">
        {categories.map((category) => (
          <div key={category.id} className="category-item">
            <a href={`/category/${category.id}`}>{category.name}</a>
          </div>
        ))}
      </div>
      <style jsx>{`
        .categories {
          background: var(--surface);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          margin-bottom: 24px;
        }
        .categories h2 {
          font-size: 18px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: var(--text-main);
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--surface-border);
        }
        .category-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px;
        }
        .category-item a {
          display: block;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius);
          text-align: center;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
        }
        .category-item a:hover {
          background: var(--surface-hover);
          color: var(--text-main);
          border-color: var(--accent);
          box-shadow: 0 0 15px var(--accent-glow);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
} 