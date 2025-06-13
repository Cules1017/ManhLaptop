import { useRouter } from 'next/router';

import Page from '../../components/page';
import ProductSection from '../../components/productSection';

export default function Category() {
  const router = useRouter();
  const { category } = router.query;

  // Đảm bảo category là id dạng số
  const categoryId = category ? parseInt(category, 10) : undefined;

  return (
    <Page>
      <ProductSection category={categoryId} />
    </Page>
  );
}
