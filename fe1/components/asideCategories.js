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

  if (loading) return <></>;

  if (!categories.length || error)
    return (
      <ul className="categories">
        {offlineCategories.map((category) => (
          <CategoriesItem key={category.id} category={category} active={currentCategory == category.id} />
        ))}
        <style jsx>{`
          .categories {
            width: 255px;
            max-width: 255px;
            background: #ffff;
            border-radius: 6px;
            margin-bottom: 30px;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
          }
          @media (max-width: 1000px) {
            .categories {
              display: none;
            }
          }
        `}</style>
      </ul>
    );

  return (
    <ul className="categories">
      {categories.map((category) => (
        <CategoriesItem key={category.id} category={category} active={currentCategory == category.id} />
      ))}
      <style jsx>{`
        .categories {
          width: 255px;
          max-width: 255px;
          background: #ffff;
          border-radius: 6px;
          margin-bottom: 30px;
          box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.05);
        }
        @media (max-width: 1000px) {
          .categories {
            display: none;
          }
        }
      `}</style>
    </ul>
  );
}
