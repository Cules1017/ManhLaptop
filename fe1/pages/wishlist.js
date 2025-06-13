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
      // Lấy id sản phẩm từ localStorage
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '{"products": []}');
      if (!wishlist.products.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      // Lấy chi tiết từng sản phẩm
      const productPromises = wishlist.products.map(id => productService.getProductById(id));
      const productResults = await Promise.all(productPromises);
      setProducts(productResults.map(res => res.data));
      setLoading(false);
    };
    fetchWishlist();
  }, []);

  if (loading) return <></>;

  if (!products.length)
    return (
      <Page>
        <Title title="Wishlist" />
        <EmptySection name="wishlist" />
      </Page>
    );

  return (
    <Page>
      <Title title="Wishlist" />
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
        }
        .wishlist .main {
          flex-grow: 1;
          padding-left: 30px;
        }
      `}</style>
    </Page>
  );
}
