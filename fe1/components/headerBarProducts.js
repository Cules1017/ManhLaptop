import { useState, useEffect } from 'react';

export default function HeaderBarProducts({ onSortChange = () => {}, sortParams }) {
  const [activeSort, setActiveSort] = useState({
    field: 'rating',
    order: 'DESC'
  });

  useEffect(() => {
    if (sortParams) {
      setActiveSort(sortParams);
    }
  }, [sortParams]);

  const handleSort = (field, order) => {
    setActiveSort({ field, order });
    onSortChange(field, order);
  };

  return (
    <div className="header-bar-products">
      <div className="container">
        <div className="header-bar-products__content">
          <div className="header-bar-products__left">
            <h2>Popular Products</h2>
          </div>

          <div className="header-bar-products__right">
            <div className="sort-options">
              <button
                id="hot-products"
                className={
                  activeSort.field === 'rating' && activeSort.order === 'DESC'
                    ? 'active'
                    : ''
                }
                onClick={() => handleSort('rating', 'DESC')}
              >
                Hot nhất
              </button>
              <button
                id="newest-products"
                className={
                  activeSort.field === 'created_at' && activeSort.order === 'DESC'
                    ? 'active'
                    : ''
                }
                onClick={() => handleSort('created_at', 'DESC')}
              >
                Mới nhất
              </button>
              <button
                id="price-low-to-high"
                className={
                  activeSort.field === 'price' && activeSort.order === 'ASC'
                    ? 'active'
                    : ''
                }
                onClick={() => handleSort('price', 'ASC')}
              >
                Giá thấp đến cao
              </button>
              <button
                id="price-high-to-low"
                className={
                  activeSort.field === 'price' && activeSort.order === 'DESC'
                    ? 'active'
                    : ''
                }
                onClick={() => handleSort('price', 'DESC')}
              >
                Giá cao đến thấp
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .header-bar-products {
          padding: 20px 0;
          background: #fff;
          border-bottom: 1px solid #eee;
        }

        .header-bar-products__content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-bar-products__left h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .sort-options {
          display: flex;
          gap: 15px;
        }

        .sort-options button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: #fff;
          color: #666;
          cursor: pointer;
          transition: all 0.3s;
        }

        .sort-options button:hover {
          background: #f5f5f5;
        }

        .sort-options button.active {
          background: #007bff;
          color: #fff;
          border-color: #007bff;
        }
      `}</style>
    </div>
  );
}
