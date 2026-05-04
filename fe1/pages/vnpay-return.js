import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Page from '../components/page';
import Title from '../components/title';

export default function VnPayReturnPage() {
  const router = useRouter();
  const { result, orderId } = router.query;

  const isSuccess = result === 'success';

  useEffect(() => {
    if (!result) return;

    if (isSuccess) {
      toast.success('Thanh toán VNPay thành công', { position: 'top-center', autoClose: 3000 });
    } else {
      toast.error('Thanh toán VNPay thất bại', { position: 'top-center', autoClose: 3000 });
    }
  }, [result, isSuccess]);

  return (
    <Page>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
        <Title title="Kết quả thanh toán VNPay" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: isSuccess ? '#2e7d32' : '#e53935',
              marginBottom: 10,
            }}
          >
            {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
          </div>

          {orderId && (
            <div style={{ color: '#666', marginBottom: 18 }}>
              Mã đơn hàng: <b>#{orderId}</b>
            </div>
          )}

          <button
            onClick={() => router.push('/orders')}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: 'none',
              background: '#1a94ff',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </Page>
  );
}

