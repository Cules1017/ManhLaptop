import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, CategoryIcon } from '../../icons';

const Sidebar = () => {
  const location = window.location;

  return (
    <div className="sidebar">
      <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: '#333', textDecoration: 'none', borderRadius: 8, background: location.pathname === '/products' ? '#f0f4f8' : 'transparent' }}>
        <ShoppingBagIcon style={{ width: 20, height: 20 }} />
        <span>Quản lý sản phẩm</span>
      </Link>
      <Link to="/categories" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: '#333', textDecoration: 'none', borderRadius: 8, background: location.pathname === '/categories' ? '#f0f4f8' : 'transparent' }}>
        <CategoryIcon style={{ width: 20, height: 20 }} />
        <span>Quản lý danh mục</span>
      </Link>
    </div>
  );
};

export default Sidebar; 