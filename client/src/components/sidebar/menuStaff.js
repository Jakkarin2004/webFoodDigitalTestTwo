import {
  Home,
  ShoppingCart,
  Utensils,
  CreditCard,
  Bell,
  Settings
} from 'lucide-react';

export const menuItems = [
  { id: 'dashboard', label: 'หน้าหลัก', icon: Home },
  { id: 'orders', label: 'ออเดอร์', icon: ShoppingCart },
  {
    id: 'menu',
    label: 'จัดการเมนู',
    icon: Utensils,
    children: [
      { id: 'menu-list', label: 'รายการเมนู' },
    ]
  },
  { id: 'billing', label: 'บิลและชำระเงิน', icon: CreditCard },
  { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell }
];

export const bottomMenuItems = [
  { id: 'settings', label: 'ตั้งค่า', icon: Settings }
];
