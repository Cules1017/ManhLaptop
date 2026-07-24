import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiRequest';
import { toast } from 'react-toastify';

export default function LuckyWheel() {
  const [isOpen, setIsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState(null);
  const [user, setUser] = useState(null);
  const [remainingSpins, setRemainingSpins] = useState(0);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const prizes = [
    'Chúc may mắn',
    'Giảm 20K',
    'Chúc may mắn',
    'Giảm 50K',
    'Giảm 5%',
    'Chúc may mắn',
  ];

  // 6 ô, mỗi ô 60 độ
  const segmentAngle = 360 / prizes.length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(userData);
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await apiRequest('http://127.0.0.1:8000/api/lucky-wheel/status', {
        method: 'GET',
        silent: true
      });
      if (res.status && res.data) {
        setRemainingSpins(res.data.remaining_spins);
        setHistory(res.data.history || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchStatus();
    }
  }, [isOpen, user]);

  const spin = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để quay thưởng!');
      return;
    }
    if (spinning) return;

    setSpinning(true);
    setPrize(null);

    try {
      const res = await apiRequest('http://127.0.0.1:8000/api/lucky-wheel/spin', {
        method: 'POST',
        silent: true
      });

      if (res.status) {
        const winIndex = res.data.index;
        
        // Tính toán góc quay
        // Tìm số vòng hiện tại, cộng thêm 10 vòng để tạo hiệu ứng quay dài
        const currentSpins = Math.ceil(rotation / 360);
        const baseRotation = (currentSpins + 10) * 360; 
        
        // Tạo một góc ngẫu nhiên nhỏ trong phạm vi của ô đó (5 đến 55 độ)
        const randomOffset = Math.floor(Math.random() * (segmentAngle - 10)) + 5;
        
        // Công thức: Từ điểm 0 độ (baseRotation), quay ngược lại một góc bằng (vị trí ô * góc 1 ô),
        // và trừ thêm randomOffset để kim không chỉ ngay mép.
        const finalRotation = baseRotation - (winIndex * segmentAngle) - randomOffset;
        
        setRotation(finalRotation);

        // Chờ animation xong (4s)
        setTimeout(() => {
          setSpinning(false);
          setPrize(res.data);
          if (res.data.remaining_spins !== undefined) {
            setRemainingSpins(res.data.remaining_spins);
          }
          if (res.data.coupon_code) {
            toast.success(`🎉 Chúc mừng! Bạn đã trúng ${res.data.prize_name}. Mã: ${res.data.coupon_code}`, {
              autoClose: false
            });
            // Cập nhật giỏ quà
            setHistory(prev => [{ prize_name: res.data.prize_name, coupon_code: res.data.coupon_code, created_at: new Date() }, ...prev]);
          } else {
            toast.info(`😢 ${res.data.prize_name}! Hẹn bạn ngày mai nhé.`);
          }
        }, 4000);

      } else {
        toast.error(res.message, { toastId: 'wheel-error' });
        setSpinning(false);
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi quay thưởng. Vui lòng thử lại sau.', { toastId: 'wheel-error' });
      setSpinning(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        className="lucky-wheel-fab"
        onClick={() => setIsOpen(true)}
        title="Vòng Quay May Mắn"
      >
        🎁
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="lucky-wheel-overlay" onClick={() => !spinning && setIsOpen(false)}>
          <div className="lucky-wheel-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => !spinning && setIsOpen(false)}>×</button>
            
            {!showHistory ? (
              <>
                <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#eab308' }}>
                  Vòng Quay May Mắn
                </h2>
                
                {user && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#ef4444' }}>
                      Lượt quay hôm nay: {remainingSpins}
                    </p>
                    <button 
                      onClick={() => setShowHistory(true)}
                      style={{ background: '#fefce8', border: '1px solid #eab308', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', color: '#ca8a04', fontWeight: 'bold' }}
                    >
                      🎁 Giỏ quà
                    </button>
                  </div>
                )}

            <div className="wheel-container">
              {/* Kim chỉ */}
              <div className="wheel-pointer"></div>
              
              {/* Vòng quay */}
              <div 
                className="wheel" 
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
              >
                {prizes.map((p, i) => (
                  <div 
                    key={i} 
                    className="wheel-segment"
                    style={{
                      transform: `rotate(${i * segmentAngle}deg) skewY(${-(90 - segmentAngle)}deg)`,
                      backgroundColor: i % 2 === 0 ? '#fde047' : '#ef4444'
                    }}
                  >
                    <div 
                      className="segment-text"
                      style={{
                        transform: `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg)`,
                        color: i % 2 === 0 ? '#b91c1c' : '#fff'
                      }}
                    >
                      {p}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Tâm vòng quay */}
              <div className="wheel-center"></div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="spin-btn" 
                onClick={spin}
                disabled={spinning || (user && remainingSpins <= 0)}
              >
                {spinning ? 'Đang quay...' : (user && remainingSpins <= 0 ? 'HẾT LƯỢT' : 'QUAY NGAY')}
              </button>
            </div>

            {prize && (
              <div className="prize-result">
                <h3>{prize.coupon_code ? '🎉 Chúc mừng!' : 'Rất tiếc!'}</h3>
                <p>Bạn quay được: <b>{prize.prize_name}</b></p>
                {prize.coupon_code && (
                  <div className="coupon-box">
                    Mã của bạn: <span>{prize.coupon_code}</span>
                  </div>
                )}
              </div>
            )}
              </>
            ) : (
              <div className="gift-history">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ color: '#eab308', margin: 0 }}>🎁 Giỏ Quà Của Bạn</h2>
                  <button 
                    onClick={() => setShowHistory(false)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Quay lại
                  </button>
                </div>
                
                {history.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>Bạn chưa trúng mã nào. Hãy quay thử nhé!</p>
                ) : (
                  <ul className="gift-list">
                    {history.map((item, index) => (
                      <li key={index} className="gift-item">
                        <div className="gift-info">
                          <strong>{item.prize_name}</strong>
                          <span className="gift-code">{item.coupon_code}</span>
                        </div>
                        <div className="gift-date">
                          {new Date(item.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .lucky-wheel-fab {
          position: fixed;
          bottom: 24px;
          left: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #e53935;
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          z-index: 9999;
          transition: transform 0.3s ease;
          animation: bounce 2s infinite;
        }
        .lucky-wheel-fab:hover {
          transform: scale(1.1);
          animation: none;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .lucky-wheel-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .lucky-wheel-modal {
          background: white;
          padding: 30px;
          border-radius: 16px;
          position: relative;
          width: 90%;
          max-width: 400px;
        }
        .close-btn {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        .wheel-container {
          position: relative;
          width: 300px;
          height: 300px;
          margin: 0 auto;
          border-radius: 50%;
          border: 8px solid #eab308;
          box-shadow: 0 0 15px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        .wheel-pointer {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 30px solid #2563eb;
          z-index: 10;
        }
        .wheel {
          width: 100%;
          height: 100%;
          position: relative;
          border-radius: 50%;
          overflow: hidden;
        }
        .wheel-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: #eab308;
          border: 4px solid white;
          border-radius: 50%;
          z-index: 5;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
        .wheel-segment {
          position: absolute;
          top: 0;
          right: 0;
          width: 50%;
          height: 50%;
          transform-origin: 0% 100%;
        }
        .segment-text {
          position: absolute;
          left: -100%;
          width: 200%;
          height: 200%;
          text-align: center;
          padding-top: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .spin-btn {
          background: #ef4444;
          color: white;
          border: none;
          padding: 12px 40px;
          border-radius: 25px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 0 #b91c1c;
          transition: all 0.2s;
        }
        .spin-btn:active:not(:disabled) {
          transform: translateY(4px);
          box-shadow: none;
        }
        .spin-btn:disabled {
          background: #9ca3af;
          box-shadow: 0 4px 0 #6b7280;
          cursor: not-allowed;
        }
        .prize-result {
          margin-top: 20px;
          text-align: center;
          background: #fefce8;
          padding: 15px;
          border-radius: 8px;
          border: 1px dashed #eab308;
        }
        .coupon-box {
          margin-top: 10px;
          background: white;
          padding: 8px;
          border-radius: 4px;
          font-weight: bold;
          color: #ef4444;
          font-size: 18px;
          border: 1px solid #fecaca;
        }
        .gift-history {
          min-height: 300px;
        }
        .gift-list {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 400px;
          overflow-y: auto;
        }
        .gift-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border-bottom: 1px solid #eee;
        }
        .gift-item:last-child {
          border-bottom: none;
        }
        .gift-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .gift-code {
          color: #ef4444;
          font-weight: bold;
          font-size: 14px;
          background: #fef2f2;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }
        .gift-date {
          font-size: 12px;
          color: #999;
        }
      `}</style>
    </>
  );
}
