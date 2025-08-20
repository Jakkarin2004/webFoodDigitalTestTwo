import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart3,
  Users,
  User,
  ShoppingCart,
  Menu,
  Settings,
  Gift,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Utensils,
  FileText,
  Star,
  CreditCard,
  Bell,
  Calendar,
  Store,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import axios from "axios";
import { io } from "socket.io-client";

// const OrderContext = createContext();
const socket = io("http://localhost:3000"); // ปรับตาม backend

const SidebarStaff = ({ children, isOpen = true, onToggle }) => {
  const [collapsed, setCollapsed] = useState(!isOpen);
  //  const [orderCount, setOrderCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  // ฟังก์ชันโหลดออเดอร์ใหม่

  // useEffect(() => {
  //   const socket = io("http://localhost:3000");

  //   socket.on("connect", () => {
  //     console.log("Socket connected:", socket.id);
  //   });

  //   socket.on("connect_error", (err) => {
  //     console.error("Socket connection error:", err);
  //   });

  //   // ฟัง event orderCountUpdated
  //   socket.on("orderCountUpdated", (data) => {
  //     console.log("Received orderCountUpdated:", data);
  //     setOrderCount(data.count);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);
  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:3000", {
      auth: { token }, // ส่ง token ถ้าต้องการ
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("orderCountUpdated", (data) => {
      console.log("Received orderCountUpdated:", data);
      setOrderCount(data.count);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // clean up เมื่อ component ถูก unmount หรือ token เปลี่ยนแปลง
    return () => {
      socket.off("connect");
      socket.off("orderCountUpdated");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [token]);

  //  useEffect(() => {
  //     // ฟัง event จำนวนออเดอร์ที่ยังไม่เสร็จ
  //     socket.on("orderCountUpdated", (data) => {
  //       console.log("Received orderCountUpdated:", data.count);
  //       setOrderCount(data.count);
  //     });

  //     // ฟัง event ยอดขายวันนี้
  //     socket.on("today_revenue_updated", (data) => {
  //       console.log("Received today_revenue_updated:", data);
  //       setTodayRevenue(data);
  //     });

  //     // ล้าง event listener เมื่อ component unmount
  //     return () => {
  //       socket.off("orderCountUpdated");
  //       socket.off("today_revenue_updated");
  //     };
  //   }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed);
  };
  const navigate = useNavigate();
  console.log("orderCount:", orderCount);

  // useEffect(() => {
  //   const fetchOrderCount = async () => {
  //     try {
  //       const token = useAuthStore.getState().token;
  //       console.log('orderCount:', orderCount); // ✅ ควรมีค่า เช่น 3

  //       const res = await axios.get('http://localhost:3000/api/owner/orders/count', {
  //         headers: {
  //           Authorization: `Bearer ${token}` // ถ้ามี verifyToken
  //         }
  //       });
  //       setOrderCount(res.data.count);
  //     } catch (err) {
  //       console.error('โหลดจำนวนออเดอร์ล้มเหลว:', err);
  //     }
  //   };

  //   fetchOrderCount();
  // }, []);

  const menuItems = [
    {
      id: "staff",
      label: "จัดการข้อมูลส่วนตัว",
      icon: User,
      path: "/staff",
    },
    {
      id: "orders",
      label: "คำสั่งซื้อ",
      icon: ShoppingCart,
      badge: orderCount > 0 ? orderCount.toString() : null,
      path: "/staff/orders",
    },
  ];

  const bottomMenuItems = [
    {
      id: "LogOut",
      label: "ออกจากระบบ",
      icon: LogOut,
    },
  ];

  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const renderMenuItem = (item, isChild = false) => {
    const IconComponent = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <div
          className={`
            flex items-center px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all duration-200 group
            ${
              item.active
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
            }
            ${isChild ? "ml-4 py-2" : ""}
            ${collapsed && !isChild ? "justify-center" : ""}
          `}
          onClick={() => {
            if (item.id === "LogOut") {
              logout(); // ✅ เรียก logout จาก Zustand
              navigate("/login"); // ✅ ย้ายไปหน้า login
            } else if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
        >
          {IconComponent && (
            <IconComponent
              size={20}
              className={`${collapsed && !isChild ? "" : "mr-3"} ${
                item.active ? "text-white" : ""
              }`}
            />
          )}

          {(!collapsed || isChild) && (
            <span className={`flex-1 font-medium ${isChild ? "text-sm" : ""}`}>
              {item.label}
            </span>
          )}

          {item.badge && (!collapsed || isChild) && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
              {item.badge}
            </span>
          )}

          {hasChildren && (!collapsed || isChild) && (
            <ChevronRight
              size={16}
              className={`transition-transform duration-200 ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          )}
        </div>

        {hasChildren && isExpanded && (!collapsed || isChild) && (
          <div className="mt-1 mb-2">
            {item.children.map((child) => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Sidebar */}
      <div
        className={`
        bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col
        sticky top-0 h-screen
        ${collapsed ? "w-16" : "w-64"}
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-orange-100">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🍽️</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-800">
                    ร้านอาหารป้าอ้อ
                  </h1>
                  <p className="text-xs text-gray-600">
                    ระบบจัดการเมนูร้านอาหารดิจิทัล
                  </p>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white text-sm">🍽️</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>

        {/* Bottom Menu */}
        <div className="border-t border-orange-100 py-4">
          <nav className="space-y-1">
            {bottomMenuItems.map((item) => renderMenuItem(item))}
          </nav>
        </div>

        {/* Toggle Button */}
        <div className="p-4 border-t border-orange-100">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span className="ml-2 text-sm">ซ่อนเมนู</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default SidebarStaff;
