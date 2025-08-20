import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './stores/authStore';

// Layouts
import OwnerLayout from './layouts/OwnerLayout';
import StaffLayout from './layouts/StaffLayout';

// Owner Pages
import ManageCategory from './pages/owner/ManageCategory';
import ManageStaff from './pages/owner/ManageStaff';
import ManageMenu from './pages/owner/ManageMenu';
import ManageTable from './pages/owner/ManageTable';
import ManageOrders from './pages/owner/ManageOrders';
import OrderHistory from './pages/owner/OrderHistory';
import StoreManagement from './pages/owner/StoreManagement';
import UserProfileManagement from './pages/owner/UserProfileManagement';

// Staff Pages
import StaffProfileManagement from './pages/staff/StaffProfileManagement'
import StaffManageOrders from './pages/staff/StaffManageOrders';

// User Pages
import UserMenu from './pages/user/UserMenu';
import UserProduct from './pages/user/UserProduct';
import UserHome from './pages/user/UserHome';
import UserOrderList from './pages/user/UserOrderList';
import ViewBill from './pages/user/ViewBill';
import ViewRes from './pages/user/ViewRes';

// Auth
import Login from './pages/auth/Login';

// Others
import ScrollToTop from "./ScrollToTop";
import Error404Page from './components/Error404Page';

function App() {
  const isHydrated = useAuthStore((state) => state._hasHydrated);

  if (!isHydrated) return <div>⏳ Loading authentication...</div>;

  return (
    <Router>
      <ScrollToTop />
      <Routes>

        {/* 🔓 Public Route */}
        <Route path="/login" element={<Login />} />

        {/* 🔐 Owner Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute requiredRole="owner">
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StoreManagement />} />
          <Route path="menu" element={<ManageMenu />} />
          <Route path="category" element={<ManageCategory />} />
          <Route path="ManageStaff" element={<ManageStaff />} />
          <Route path="table" element={<ManageTable />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="profile" element={<UserProfileManagement />} />
        </Route>

        {/* 🔐 Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="staff">
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffProfileManagement />} />
          <Route path="/staff/orders" element={<StaffManageOrders />} />
          {/* <Route path="orders" element={<StaffOrders />} /> */}
          {/* <Route path="order-history" element={<StaffOrderHistory />} /> */}
        </Route>

        {/*User Routes (ไม่ต้อง login) */}
        <Route path="/user-menu/table/:table_number" element={<UserMenu />} />
        <Route path="/user-product/table/:table_number" element={<UserProduct />} />
        <Route path="/user-home/table/:table_number" element={<UserHome />} />
        <Route path="/user-orders/table/:table_number" element={<UserOrderList />} />
        <Route path="/user/viewOrder-list/:order_code" element={<ViewBill />} />
        <Route path="/user/viewRes/:table_number" element={<ViewRes />} />

        {/* ❌ Fallback */}
        <Route path="/404" element={<Error404Page />} />
        <Route path="*" element={<Error404Page />} />
      </Routes>
    </Router>
  );
}

export default App;
