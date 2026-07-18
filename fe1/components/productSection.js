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
          gap: 32px;
          padding: 40px 0;
          scroll-margin-top: 100px; /* Prevents the sticky header from covering content when scrolling to this section */
        }
        #product aside {
          width: 260px;
          flex-shrink: 0;
        }
        #product .main {
          flex-grow: 1;
          min-width: 0;
        }
        @media (max-width: 900px) {
          #product {
            flex-direction: column;
            gap: 24px;
            scroll-margin-top: 80px;
          }
          #product aside {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
