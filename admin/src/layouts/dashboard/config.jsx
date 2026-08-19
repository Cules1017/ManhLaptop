import ChartPieIcon from "@heroicons/react/24/solid/ChartPieIcon"
import CogIcon from "@heroicons/react/24/solid/CogIcon"
import DocumentTextIcon from "@heroicons/react/24/solid/DocumentTextIcon"
import ExclamationTriangleIcon from "@heroicons/react/24/solid/ExclamationTriangleIcon"
import ShoppingCartIcon from "@heroicons/react/24/solid/ShoppingCartIcon"
import StarIcon from "@heroicons/react/24/solid/StarIcon"
import UsersIcon from "@heroicons/react/24/solid/UsersIcon"
import ChatBubbleLeftRightIcon from "@heroicons/react/24/solid/ChatBubbleLeftRightIcon"
import TicketIcon from "@heroicons/react/24/solid/TicketIcon"
import { SvgIcon } from '@mui/material';

export const items = [
  {
    href: '/',
    icon: (
      <SvgIcon>
        <ChartPieIcon />
      </SvgIcon>
    ),
    label: 'Home'
  },
  {
    href: '/products',
    icon: (
      <SvgIcon>
        <ShoppingCartIcon />
      </SvgIcon>
    ),
    label: 'Products'
  },
  {
    href: '/categories',
    icon: (
      <SvgIcon>
      <StarIcon />
    </SvgIcon>
    ),
    label: 'Categories'
  },
  {
    href: '/orders',
    icon: (
      <SvgIcon>
        <ShoppingCartIcon />
      </SvgIcon>
    ),
    label: 'Orders'
  },
  {
    href: '/users',
    icon: (
      <SvgIcon>
        <UsersIcon />
      </SvgIcon>
    ),
    label: 'Users'
  },
  {
    href: '/coupons',
    icon: (
      <SvgIcon>
        <TicketIcon />
      </SvgIcon>
    ),
    label: 'Coupons'
  },
  {
    href: '/live-chat',
    icon: (
      <SvgIcon>
        <ChatBubbleLeftRightIcon />
      </SvgIcon>
    ),
    label: 'Live Chat'
  },
  {
    href: '/settings',
    icon: (
      <SvgIcon>
        <CogIcon />
      </SvgIcon>
    ),
    label: 'Settings'
  },
  {
    href: '/homepage-settings',
    icon: (
      <SvgIcon>
        <DocumentTextIcon />
      </SvgIcon>
    ),
    label: 'Homepage Config'
  }
];
