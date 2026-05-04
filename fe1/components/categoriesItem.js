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
              {Icon && <Icon color="#D8D8D8" size="22" />}
            </div>
            {/* Fallback label nếu không có thì dùng name */}
            <p>{category.label || category.name}</p>
          </div>
          <div className="arrow-button">
            <MdKeyboardArrowRight color="#D8D8D8" size="26" />
          </div>
        </a>
      </Link>

      <style jsx>{`
        li a {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          color: #555;
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.2s, color 0.2s;
        }
        li:last-child a {
          border-bottom: none;
        }
        li a:hover {
          background: #fff5f5;
          color: #e53935;
        }
        li.active a,
        li a.active {
          background: #ffeeee;
          color: #e53935;
          font-weight: 600;
        }
        li a .content {
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        li a .content .icon {
          padding-right: 12px;
          display: inline-flex;
        }
        li a .arrow-button {
          display: inline-flex;
        }
      `}</style>
    </li>
  );
}
