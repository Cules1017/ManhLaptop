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
      <div className="header-bar-products__content">
        <div className="header-bar-products__left">
          <h2>Sản phẩm nổi bật</h2>
        </div>

        <div className="header-bar-products__right">
          <div className="sort-options">
            <button
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

      <style jsx>{`
        .header-bar-products {
          padding: 0 0 24px 0;
          background: transparent;
          border-bottom: none;
        }

        .header-bar-products__content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-bar-products__left h2 {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.01em;
        }

        .sort-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sort-options button {
          padding: 8px 16px;
          border: none;
          background: #e2e8f0;
          color: #475569;
          cursor: pointer;
          border-radius: 99px; /* Pill shape */
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .sort-options button:hover {
          background: #cbd5e1;
          color: #1e293b;
        }

        .sort-options button.active {
          background: #ef4444; /* Clean solid red */
          color: #fff;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
        }

        @media (max-width: 768px) {
          .header-bar-products__content {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .sort-options {
            width: 100%;
            overflow-x: auto;
            padding-bottom: 8px;
            flex-wrap: nowrap;
          }
          
          .sort-options button {
            white-space: nowrap;
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
}
