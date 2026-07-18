import { FaShippingFast, FaShieldAlt, FaHeadset, FaCreditCard, FaGift } from 'react-icons/fa';
import { MdVerifiedUser } from 'react-icons/md';

const renderIcon = (type) => {
  switch(type) {
    case 'shipping': return <FaShippingFast size={18} className="fallback-icon" />;
    case 'shield': return <FaShieldAlt size={18} className="fallback-icon" />;
    case 'verify': return <MdVerifiedUser size={18} className="fallback-icon" />;
    case 'support': return <FaHeadset size={18} className="fallback-icon" />;
    case 'payment': return <FaCreditCard size={18} className="fallback-icon" />;
    case 'gift': return <FaGift size={18} className="fallback-icon" />;
    default: return <MdVerifiedUser size={18} className="fallback-icon" />;
  }
};

export default function TrustBadges({ badges = [] }) {
  if (!badges || badges.length === 0) {
    return null;
  }

  // Duplicate the badges multiple times to ensure the marquee always has enough content to scroll seamlessly
  const marqueeBadges = [...badges, ...badges, ...badges, ...badges, ...badges, ...badges];

  return (
    <section className="trust-badges-bar">
      <div className="marquee-wrapper">
        <div className="marquee-content">
          {marqueeBadges.map((badge, index) => {
            const hasImage = !!badge.icon_url;
            const isShipping = badge.text.toLowerCase().includes('giao hàng');
            
            return (
              <div className="badge-item" key={`badge-${index}`}>
                {badge.icon_type ? (
                  renderIcon(badge.icon_type)
                ) : hasImage ? (
                  <img src={`http://127.0.0.1:8000${badge.icon_url}`} alt={badge.text} className="badge-icon" />
                ) : (
                  isShipping ? <FaShippingFast size={18} className="fallback-icon" /> : <MdVerifiedUser size={18} className="fallback-icon" />
                )}
                <span className="badge-text">{badge.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .trust-badges-bar {
          width: 100%;
          background: #1a1a1a;
          border-top: 1px solid #333;
          border-bottom: 1px solid #333;
          display: flex;
          align-items: center;
          height: 60px;
          flex-shrink: 0; /* Prevents it from being squished in flex container */
          overflow: hidden;
          position: relative;
        }

        .marquee-wrapper {
          display: flex;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
        }

        .marquee-content {
          display: flex;
          align-items: center;
          width: max-content;
          flex-shrink: 0;
          gap: 60px; /* Space between items */
          padding-right: 60px;
          animation: marquee 25s linear infinite;
        }

        /* Hover pauses the animation */
        .marquee-wrapper:hover .marquee-content {
          animation-play-state: paused;
        }

        .badge-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .badge-icon {
          width: 18px;
          height: 18px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }
        
        :global(.fallback-icon) {
          color: #ffffff;
          opacity: 0.8;
          flex-shrink: 0;
        }

        .badge-text {
          font-size: 0.95rem;
          font-weight: 500;
          color: #f1f1f1;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
