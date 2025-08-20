import {
  Home,
  ShoppingCart,
  Utensils,
  Users,
  BarChart3,
  CreditCard,
  Calendar,
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
      { id: 'menu-category', label: 'หมวดหมู่' },
      { id: 'menu-ingredients', label: 'วัตถุดิบ' }
    ]
  },
  { id: 'customers', label: 'ลูกค้า', icon: Users },
  { id: 'reports', label: 'รายงาน', icon: BarChart3 },
  { id: 'billing', label: 'บิลและชำระเงิน', icon: CreditCard },
  { id: 'calendar', label: 'ปฏิทิน', icon: Calendar },
  { id: 'notifications', label: 'การแจ้งเตือน', icon: Bell }
];

export const bottomMenuItems = [
  { id: 'settings', label: 'ตั้งค่า', icon: Settings }
];
