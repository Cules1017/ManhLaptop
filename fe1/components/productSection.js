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
        }
        #product .main {
          flex-grow: 1;
          padding-left: 30px;
        }
        @media (max-width: 900px) {
          #product .main {
            padding-left: 0;
          }
        }
      `}</style>
    </section>
  );
}
