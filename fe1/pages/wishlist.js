import { useEffect, useState } from 'react';
import Page from '../components/page';
import EmptySection from '../components/emptySection';
import Title from '../components/title';
import AsideCategories from '../components/asideCategories';
import ProductsGrid from '../components/productsGrid';
import ProductItem from '../components/productItem';
import { productService } from '../services/productService';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      let wishlist = { products: [] };
      try {
        wishlist = JSON.parse(localStorage.getItem('wishlist') || '{"products": []}');
      } catch {
        wishlist = { products: [] };
      }
      if (!wishlist.products?.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const productPromises = wishlist.products.map((id) =>
          productService.getProductById(id).catch(() => null)
        );
        const productResults = await Promise.all(productPromises);
        setProducts(
          productResults
            .filter((res) => res && res.data)
            .map((res) => res.data)
        );
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <></>;

  if (!products.length)
    return (
      <Page>
        <Title title="Sản phẩm yêu thích" />
        <EmptySection name="wishlist" />
      </Page>
    );

  return (
    <Page>
      <Title title="Sản phẩm yêu thích" />
      <section className="wishlist">
        <aside>
          <AsideCategories />
        </aside>
        <div className="main">
          <ProductsGrid>
            {products.map((product) => (
              <ProductItem
                key={product.id}
                id={product.id}
                name={product.name}
                rating={product.rating}
                img_url={product.image || product.img_url}
                price={product.price}
                discount={product.discount}
              />
            ))}
          </ProductsGrid>
        </div>
      </section>
      <style jsx>{`
        .wishlist {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
          box-sizing: border-box;
          gap: 32px;
        }
        .wishlist aside {
          flex: 0 0 240px;
        }
        .wishlist .main {
          flex-grow: 1;
        }
        @media (max-width: 768px) {
          .wishlist {
            flex-direction: column;
            padding: 16px;
            gap: 20px;
          }
          .wishlist aside {
            flex: auto;
          }
        }
      `}</style>
    </Page>
  );
}
