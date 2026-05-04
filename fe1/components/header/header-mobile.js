import { useState } from 'react';
import Logo from '../logo';
import OpenDrawerButton from './open-drawer-button';
import SideDrawer from './side-drawer';

export default function HeaderMobile({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDrawer() {
    setIsOpen((prev) => !prev);
  }

  return (
    <div className="header-mobile">
      <OpenDrawerButton openDrawer={toggleDrawer} />

      <SideDrawer closeDrawer={toggleDrawer} user={user} isOpen={isOpen} />

      <Logo />

      <style jsx>{`
        .header-mobile {
          display: flex;
          align-items: center;
          padding: 14px 20px;
        }
      `}</style>
    </div>
  );
}
