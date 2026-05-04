import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { FaCopy } from 'react-icons/fa';
import { apiRequest } from '../utils/apiRequest';
import Page from '../components/page';

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

async function copyToClipboard(text, label) {
  const t = String(text ?? '');
  if (!t) {
    toast.info('Không có nội dung để sao chép');
    return;
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(t);
    } else {
      throw new Error('no clipboard api');
    }
    toast.success(`Đã sao chép ${label}`, { position: 'top-center' });
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(`Đã sao chép ${label}`, { position: 'top-center' });
    } catch {
      toast.error('Không sao chép được — thử chọn và copy thủ công.', { position: 'top-center' });
    }
  }
}

export default function PaymentSimulatorPage() {
  const router = useRouter();
  const {
    method = 'bank_transfer',
    orderId = '',
    amount = 0,
    qrCodeUrl = '',
    paymentUrl = '',
    expiresAt = '',
  } = router.query;

  const [config, setConfig] = useState({
    vietqr_bank_bin: '970422',
    vietqr_account_no: '0123456789',
    vietqr_account_name: 'LAPTOP SHOP',
    vietqr_template: 'compact2',
  });
  const [remainingMs, setRemainingMs] = useState(0);
  /** VietQR: chờ API cấu hình công khai xong (MoMo bỏ qua). */
  const [vietqrConfigReady, setVietqrConfigReady] = useState(false);
  /** Ảnh QR đã load (hoặc lỗi — không chặn vô hạn). */
  const [qrImageStatus, setQrImageStatus] = useState('idle');
  const imgRef = useRef(null);

  const isMomo = method === 'momo';
  const methodLabel = isMomo ? 'MoMo' : 'Chuyển khoản ngân hàng';
  const amountNumber = Math.round(Number(amount) || 0);
  const momoPaymentLink = useMemo(() => {
    if (!isMomo) return '';
    return String(paymentUrl || qrCodeUrl || '').trim();
  }, [isMomo, paymentUrl, qrCodeUrl]);

  const qrUrl = useMemo(() => {
    if (isMomo) {
      const raw = String(qrCodeUrl || paymentUrl || '').trim();
      if (!raw) return '';
      if (raw.startsWith('http://') || raw.startsWith('https://')) {
        return raw;
      }
      return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(raw)}`;
    }

    if (!amountNumber) return '';
    const bankBin = config.vietqr_bank_bin || '970422';
    const accountNo = config.vietqr_account_no || '0123456789';
    const accountName = config.vietqr_account_name || 'LAPTOP SHOP';
    const template = config.vietqr_template || 'compact2';
    const addInfo = `DH ${String(orderId)}`;
    return `https://img.vietqr.io/image/${bankBin}-${accountNo}-${template}.png?amount=${amountNumber}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
  }, [isMomo, qrCodeUrl, paymentUrl, amountNumber, config, orderId]);

  const transferContent = `DH ${orderId || 'N/A'}`;

  /** Gỡ overlay: có URL QR thì chờ ảnh load; không URL (lỗi/thiếu tiền) thì chờ cấu hình VietQR xong. */
  const paymentReady = useMemo(() => {
    if (!qrUrl) {
      if (isMomo) return true;
      return vietqrConfigReady;
    }
    if (isMomo) return qrImageStatus === 'loaded' || qrImageStatus === 'error';
    return vietqrConfigReady && (qrImageStatus === 'loaded' || qrImageStatus === 'error');
  }, [qrUrl, isMomo, vietqrConfigReady, qrImageStatus]);

  useEffect(() => {
    setQrImageStatus('idle');
  }, [qrUrl]);

  useEffect(() => {
    const img = imgRef.current;
    if (!qrUrl || !img) return;
    if (img.complete && img.naturalHeight > 0) {
      setQrImageStatus('loaded');
    }
  }, [qrUrl, vietqrConfigReady]);

  useEffect(() => {
    if (isMomo) {
      setVietqrConfigReady(true);
      return;
    }
    let cancelled = false;
    setVietqrConfigReady(false);
    apiRequest('http://127.0.0.1:8000/api/payment-config/public')
      .then((res) => {
        if (!cancelled && res?.status && res?.data) {
          setConfig((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setVietqrConfigReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isMomo]);

  useEffect(() => {
    if (!isMomo || !expiresAt) {
      setRemainingMs(0);
      return;
    }

    const target = new Date(String(expiresAt)).getTime();
    if (!Number.isFinite(target)) return;

    const tick = () => setRemainingMs(Math.max(0, target - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isMomo, expiresAt]);

  const handleSimulateSuccess = () => {
    if (!paymentReady) return;
    toast.success(`Thanh toán ${methodLabel} thành công (giả lập)`, { position: 'top-center' });
    router.push('/orders');
  };

  const handleQrLoad = () => setQrImageStatus('loaded');
  const handleQrError = () => {
    setQrImageStatus('error');
    toast.error('Không tải được ảnh QR. Kiểm tra mạng hoặc cấu hình VietQR.', { position: 'top-center' });
  };

  const handleOpenMomo = () => {
    if (!momoPaymentLink) {
      toast.info('Chưa có link thanh toán MoMo khả dụng', { position: 'top-center' });
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.href = momoPaymentLink;
    }
  };

  return (
    <Page>
      <div className="payment-page">
        <div className="payment-card" aria-busy={!paymentReady}>
          {!paymentReady ? (
            <div className="payment-loading-overlay" role="status" aria-live="polite">
              <div className="payment-loading-spinner" />
              <p className="payment-loading-text">Đang tạo mã QR…</p>
              <p className="payment-loading-hint">Vui lòng đợi đến khi mã hiển thị để sao chép thông tin chuyển khoản.</p>
            </div>
          ) : null}

          <div className={`payment-card-inner ${!paymentReady ? 'payment-card-inner--blocked' : ''}`}>
            <div className="payment-header">
              <div>
                <div className="payment-method-badge">{isMomo ? 'Ví điện tử MoMo' : 'Chuyển khoản VietQR'}</div>
                <h1 className="payment-title">Thanh toán đơn hàng</h1>
                <p className="payment-subtitle">Hoàn tất thanh toán để hệ thống xác nhận và xử lý đơn hàng của bạn.</p>
              </div>
              <div className="payment-amount-wrap">
                <span>Tổng thanh toán</span>
                <b>{amountNumber.toLocaleString('vi-VN')}₫</b>
              </div>
            </div>

            <div className="payment-body">
              <div className="payment-qr-col">
                <div className="order-meta">
                  Mã đơn hàng: <b>#{orderId || 'N/A'}</b>
                </div>
                {isMomo && (
                  <div className="momo-logo-wrap" aria-label="MoMo">
                    <div className="momo-logo">momo</div>
                    {expiresAt ? <span>Hết hạn sau: {formatRemaining(remainingMs)}</span> : null}
                  </div>
                )}
                {qrUrl ? (
                  <img
                    ref={imgRef}
                    key={qrUrl}
                    src={qrUrl}
                    alt="QR thanh toán"
                    className="payment-qr"
                    onLoad={handleQrLoad}
                    onError={handleQrError}
                  />
                ) : (
                  <div className="payment-qr-empty">Không tạo được mã QR (thiếu số tiền hoặc dữ liệu).</div>
                )}
                <div className="payment-note">Quét mã QR để thanh toán qua {methodLabel}.</div>
                <button
                  type="button"
                  className="payment-success-btn"
                  onClick={handleSimulateSuccess}
                  disabled={!paymentReady}
                >
                  Giả lập thanh toán thành công
                </button>
                {isMomo ? (
                  <button
                    type="button"
                    className="payment-open-momo-btn"
                    onClick={handleOpenMomo}
                    disabled={!momoPaymentLink}
                  >
                    Mở bằng MoMo
                  </button>
                ) : null}
              </div>

              <div className="payment-info-col">
                <div className="info-box">
                  <div className="info-box-title">Thông tin thanh toán</div>
                  {isMomo ? (
                    <>
                      <div className="info-row">
                        <span>Phương thức</span>
                        <div className="info-row-right">
                          <b>MoMo Sandbox (QR)</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép phương thức"
                            onClick={() => copyToClipboard('MoMo Sandbox (QR)', 'phương thức')}
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>Nội dung</span>
                        <div className="info-row-right">
                          <b>Thanh toan don hang #{orderId || 'N/A'}</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép nội dung"
                            onClick={() =>
                              copyToClipboard(`Thanh toan don hang #${orderId || 'N/A'}`, 'nội dung')
                            }
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>Số tiền</span>
                        <div className="info-row-right">
                          <b>{amountNumber.toLocaleString('vi-VN')}₫</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép số tiền"
                            onClick={() =>
                              copyToClipboard(`${amountNumber.toLocaleString('vi-VN')}đ`, 'số tiền')
                            }
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                      {expiresAt ? (
                        <div className="info-row">
                          <span>Hết hạn</span>
                          <div className="info-row-right">
                            <b>{new Date(String(expiresAt)).toLocaleString('vi-VN')}</b>
                            <button
                              type="button"
                              className="info-copy-btn"
                              disabled={!paymentReady}
                              aria-label="Sao chép thời hạn"
                              onClick={() =>
                                copyToClipboard(new Date(String(expiresAt)).toLocaleString('vi-VN'), 'hết hạn')
                              }
                            >
                              <FaCopy />
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div className="info-row">
                        <span>Ngân hàng (BIN)</span>
                        <div className="info-row-right">
                          <b>{config.vietqr_bank_bin || '-'}</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép BIN"
                            onClick={() => copyToClipboard(config.vietqr_bank_bin, 'BIN ngân hàng')}
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>Số tài khoản</span>
                        <div className="info-row-right">
                          <b>{config.vietqr_account_no || '-'}</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép số tài khoản"
                            onClick={() => copyToClipboard(config.vietqr_account_no, 'số tài khoản')}
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>Chủ tài khoản</span>
                        <div className="info-row-right">
                          <b>{config.vietqr_account_name || '-'}</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép tên chủ TK"
                            onClick={() => copyToClipboard(config.vietqr_account_name, 'chủ tài khoản')}
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                      <div className="info-row">
                        <span>Nội dung CK</span>
                        <div className="info-row-right">
                          <b>{transferContent}</b>
                          <button
                            type="button"
                            className="info-copy-btn"
                            disabled={!paymentReady}
                            aria-label="Sao chép nội dung chuyển khoản"
                            onClick={() => copyToClipboard(transferContent, 'nội dung CK')}
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-page {
          max-width: 1040px;
          margin: 0 auto;
          padding: 28px 16px 40px;
        }
        .payment-card {
          position: relative;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 16px 40px rgba(17, 24, 39, 0.1);
          overflow: hidden;
        }
        .payment-card-inner--blocked {
          pointer-events: none;
          user-select: none;
          filter: blur(0.5px);
          opacity: 0.55;
        }
        .payment-loading-overlay {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(4px);
          padding: 24px;
          text-align: center;
        }
        .payment-loading-spinner {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #e2e8f0;
          border-top-color: #2563eb;
          animation: pay-spin 0.75s linear infinite;
        }
        @keyframes pay-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .payment-loading-text {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
        }
        .payment-loading-hint {
          margin: 0;
          max-width: 320px;
          font-size: 13px;
          color: #64748b;
          line-height: 1.45;
        }
        .payment-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          border-bottom: 1px solid #eef2f7;
          background: linear-gradient(120deg, #f8fafc 0%, #eff6ff 100%);
        }
        .payment-method-badge {
          display: inline-block;
          background: ${isMomo ? '#f3e8ff' : '#dcfce7'};
          color: ${isMomo ? '#7e22ce' : '#166534'};
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 10px;
          margin-bottom: 10px;
        }
        .payment-title {
          margin: 0;
          font-size: 30px;
          color: #111827;
        }
        .payment-subtitle {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }
        .payment-amount-wrap {
          text-align: right;
          color: #64748b;
          font-size: 13px;
        }
        .payment-amount-wrap b {
          display: block;
          margin-top: 6px;
          color: #dc2626;
          font-size: 30px;
          line-height: 1.1;
        }
        .payment-body {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
          padding: 24px;
        }
        .payment-qr-col {
          background: #f8fafc;
          border-radius: 14px;
          padding: 18px;
          text-align: center;
        }
        .order-meta {
          color: #334155;
          margin-bottom: 10px;
        }
        .momo-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
          color: #7e22ce;
          font-size: 13px;
          font-weight: 600;
        }
        .momo-logo {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #b0006d;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          text-transform: lowercase;
          letter-spacing: 0.2px;
        }
        .payment-qr {
          width: 100%;
          max-width: 300px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
        }
        .payment-qr-empty {
          height: 300px;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          background: #fff;
          padding: 16px;
          text-align: center;
        }
        .payment-note {
          margin-top: 10px;
          color: #64748b;
          font-size: 14px;
        }
        .payment-success-btn {
          margin-top: 16px;
          width: 100%;
          border: none;
          background: #16a34a;
          color: #fff;
          border-radius: 10px;
          padding: 12px 14px;
          font-weight: 800;
          cursor: pointer;
          font-size: 15px;
        }
        .payment-success-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .payment-open-momo-btn {
          margin-top: 10px;
          width: 100%;
          border: 1px solid #c026d3;
          background: #fff;
          color: #a21caf;
          border-radius: 10px;
          padding: 11px 14px;
          font-weight: 800;
          cursor: pointer;
          font-size: 15px;
        }
        .payment-open-momo-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .payment-info-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .info-box {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          background: #fff;
        }
        .info-box-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-top: 1px dashed #e2e8f0;
          padding: 10px 0;
          font-size: 14px;
          color: #475569;
        }
        .info-row:first-of-type {
          border-top: none;
          padding-top: 0;
        }
        .info-row-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          min-width: 0;
        }
        .info-row-right b {
          color: #0f172a;
          text-align: right;
          word-break: break-word;
        }
        .info-copy-btn {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #2563eb;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .info-copy-btn:hover:not(:disabled) {
          background: #eff6ff;
          border-color: #93c5fd;
        }
        .info-copy-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        @media (max-width: 900px) {
          .payment-header {
            flex-direction: column;
          }
          .payment-amount-wrap {
            text-align: left;
          }
          .payment-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Page>
  );
}
