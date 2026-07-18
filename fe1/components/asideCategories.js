import { useState, useEffect } from 'react';
import CategoriesItem from './categoriesItem';
import offlineCategories from '../db/offlineData/categories';
import { productService } from '../services/productService';
import { useRouter } from 'next/router';

export default function AsideCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const currentCategory = router.query.category;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await productService.getCategories();
        if (response && response.data) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const list = categories.length ? categories : offlineCategories;

  return (
    <>
      <ul className="categories">
        <li className="title">Danh mục sản phẩm</li>
        {loading ? (
          <li className="loading">Đang tải...</li>
        ) : error && !list.length ? (
          <li className="loading">Không tải được danh mục</li>
        ) : (
          list.map((category) => (
            <CategoriesItem
              key={category.id}
              category={category}
              active={currentCategory == category.id}
            />
          ))
        )}
      </ul>
      <style jsx>{`
        .categories {
          list-style: none;
          margin: 0 0 20px;
          padding: 0;
          width: 100%;
          background: var(--surface);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .categories .title {
          padding: 16px 20px;
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--text-main);
          background: var(--surface-hover);
          border-bottom: 1px solid var(--surface-border);
        }
        .loading {
          padding: 16px 20px;
          color: var(--text-muted);
          font-size: 14px;
        }
      `}</style>
    </>
  );
}
