import { Outlet } from 'react-router-dom';
import { Layout as DashboardLayout } from './layouts/dashboard/layout';
import IconsPage from './pages/icons';
import NotFoundPage from './pages/404';
import OrdersPage from './pages/orders';
import ReportsPage from './pages';
import SettingsPage from './pages/settings';
import ThemePage from './pages/theme';
import ProductManager from './pages/products';
import AdminLogin from './pages/login';
import CategoryManager from './pages/categories';
import { Users } from './pages/userman';
import CustomerCare from './pages/customer-care';
import HomepageSettingsPage from './pages/homepage-settings';
import LiveChat from './pages/live-chat.jsx';

export const routes = [
  {
    element: (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    ),
    children: [
      {
        index: true,
        element: <ReportsPage />
      },
      {
        path: 'orders',
        element: <OrdersPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'homepage-settings',
        element: <HomepageSettingsPage />
      },
      {
        path: 'theme',
        element: <ThemePage />
      },
      {
        path: 'icons',
        element: <IconsPage />
      },
      {
        path: 'products',
        element: <ProductManager />
      },
      {
        path: 'categories',
        element: <CategoryManager />
      },
      {
        path: 'users',
        element: <Users />
      },
      {
        path: 'customer-care',
        element: <CustomerCare />
      },
      {
        path: 'live-chat',
        element: <LiveChat />
      },
      {
        path: 'login',
        element: <AdminLogin />
      }
    ]
  },
  {
    path: '404',
    element: <NotFoundPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
