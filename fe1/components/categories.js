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
    </div>
  );
} 