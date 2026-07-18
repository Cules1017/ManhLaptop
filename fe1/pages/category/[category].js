import { useRouter } from 'next/router';

import Page from '../../components/page';
import ProductSection from '../../components/productSection';

export default function Category() {
  const router = useRouter();
  const { category } = router.query;

  // Đợi Next.js parse xong params trên client (để tránh get category = undefined lúc reload)
  if (!router.isReady) {
    return <Page />;
  }

  // Đảm bảo category là id dạng số
  const categoryId = category ? parseInt(category, 10) : undefined;

  return (
    <Page>
      <ProductSection category={categoryId} />
    </Page>
  );
}
