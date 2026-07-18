import Link from 'next/link';
import {
  MdDesktopWindows,
  MdDesktopMac,
  MdLaptop,
  MdKeyboard,
  MdMemory,
  MdSpeaker,
  MdSmartphone,
  MdTv,
  MdVideogameAsset,
  MdWatch,
  MdKeyboardArrowRight,
} from 'react-icons/md';
const iconSlugs = {
  MdDesktopWindows,
  MdDesktopMac,
  MdLaptop,
  MdKeyboard,
  MdMemory,
  MdSpeaker,
  MdSmartphone,
  MdTv,
  MdVideogameAsset,
  MdWatch,
};

export default function CategoriesItem({ category, active }) {
  // Fallback icon nếu không có md_icon hoặc không tìm thấy icon
  const Icon = iconSlugs[category.md_icon] || MdDesktopWindows;

  return (
    <li key={category.id} className={active ? 'active' : ''}>
      <Link href={`/category/${category.id}`}>
        <a className={active ? 'active' : ''}>
          <div className="content">
            <div className="icon">
              {/* Chỉ render icon nếu có */}
              {Icon && <Icon size="22" className="cat-icon" />}
            </div>
            {/* Fallback label nếu không có thì dùng name */}
            <p>{category.label || category.name}</p>
          </div>
          <div className="arrow-button">
            <MdKeyboardArrowRight size="26" />
          </div>
        </a>
      </Link>

      <style jsx>{`
        li a {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          color: var(--text-muted);
          border-bottom: 1px solid var(--surface-border);
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }
        li:last-child a {
          border-bottom: none;
        }
        li a::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--accent);
          opacity: 0;
          transition: opacity var(--transition-fast);
          box-shadow: 0 0 10px var(--accent-glow);
        }
        li a:hover {
          background: var(--surface-hover);
          color: var(--text-main);
          box-shadow: inset 0 0 20px var(--accent-glow);
        }
        li a:hover::before {
          opacity: 1;
        }
        li.active a,
        li a.active {
          background: var(--surface-hover);
          color: var(--text-main);
          font-weight: 600;
          box-shadow: inset 0 0 20px var(--accent-glow);
        }
        li.active a::before,
        li a.active::before {
          opacity: 1;
        }
        li a .content {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        li a .content .icon {
          padding-right: 12px;
          display: inline-flex;
          color: var(--accent);
          filter: drop-shadow(0 0 5px var(--accent-glow));
          transition: all var(--transition-fast);
        }
        li a:hover .content .icon,
        li.active a .content .icon {
          color: var(--text-main);
          filter: drop-shadow(0 0 8px var(--accent-glow));
        }
        li a .arrow-button {
          display: inline-flex;
          color: var(--text-muted);
          transition: transform var(--transition-fast), color var(--transition-fast);
        }
        li a:hover .arrow-button,
        li.active a .arrow-button {
          transform: translateX(4px);
          color: var(--accent);
        }
      `}</style>
    </li>
  );
}
