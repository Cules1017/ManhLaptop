import AsideCategories from './asideCategories';
import PromoCard from './promoCard';
import HeaderBarProducts from './headerBarProducts';
import Products from './products';
import { useState } from 'react';

export default function ProductSection({ category }) {
  const [sortParams, setSortParams] = useState({
    field: 'rating',
    order: 'DESC'
  });

  const handleSortChange = (field, order) => {
    setSortParams({ field, order });
  };

  return (
    <section id="product">
      <aside>
        <AsideCategories />
        <PromoCard />
      </aside>
      <div className="main">
        <HeaderBarProducts onSortChange={handleSortChange} sortParams={sortParams} />
        <Products category={category} sortParams={sortParams} />
      </div>

      <style jsx>{`
        #product {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
          gap: 24px;
        }
        #product aside {
          width: 240px;
          flex-shrink: 0;
        }
        #product .main {
          flex-grow: 1;
          min-width: 0;
        }
        @media (max-width: 900px) {
          #product {
            flex-direction: column;
          }
          #product aside {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
