import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  Star,
  Plus,
  Eye,
  Edit,
  Bell,
  Settings,
  LogOut
} from "lucide-react";

import Sidebar from '../../components/sidebar/Sidebar';
const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data
  const stats = [
    {
      title: "ยอดขายวันนี้",
      value: "12,450",
      unit: "฿",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    {
      title: "ออเดอร์วันนี้",
      value: "48",
      unit: "รายการ",
      change: "+8.3%",
      trend: "up",
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "ลูกค้าใหม่",
      value: "15",
      unit: "คน",
      change: "+25.0%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "เมนูยอดนิยม",
      value: "24",
      unit: "เมนู",
      change: "+5.2%",
      trend: "up",
      icon: Star,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "สมชาย ใจดี", items: 3, total: 450, status: "กำลังทำ", time: "10:30" },
    { id: "ORD-002", customer: "มาลี สวยงาม", items: 2, total: 320, status: "เสร็จแล้ว", time: "10:25" },
    { id: "ORD-003", customer: "สมศรี รักษ์ดี", items: 5, total: 680, status: "รอชำระ", time: "10:20" },
    { id: "ORD-004", customer: "วิชัย มั่นคง", items: 1, total: 150, status: "เสร็จแล้ว", time: "10:15" },
    { id: "ORD-005", customer: "นิรมล สุขใส", items: 4, total: 520, status: "กำลังทำ", time: "10:10" }
  ];

  const topMenus = [
    { name: "ผัดไทย", sales: 32, revenue: 1280 },
    { name: "ส้มตำ", sales: 28, revenue: 840 },
    { name: "แกงเขียวหวาน", sales: 24, revenue: 1440 },
    { name: "ข้าวผัด", sales: 20, revenue: 800 },
    { name: "ต้มยำกุ้ง", sales: 18, revenue: 1080 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "กำลังทำ": return "bg-yellow-100 text-yellow-800";
      case "เสร็จแล้ว": return "bg-green-100 text-green-800";
      case "รอชำระ": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">ระบบจัดการร้านอาหาร</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('th-TH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-lg font-semibold text-gray-800">
                  {currentTime.toLocaleTimeString('th-TH')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  <Bell size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                  <Settings size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                      <span className="text-gray-500 text-sm">{stat.unit}</span>
                    </div>
                    <div className="flex items-center mt-2">
                      <TrendingUp size={16} className="text-green-500 mr-1" />
                      <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent size={28} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">ออเดอร์ล่าสุด</h2>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <Plus size={16} />
                  เพิ่มออเดอร์
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">รหัส</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ลูกค้า</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">รายการ</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ยอดรวม</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">เวลา</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order, index) => (
                    <tr key={order.id} className={`hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.items} รายการ</td>
                      <td className="px-6 py-4 text-sm font-semibold text-orange-600">{order.total.toLocaleString()} ฿</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                        <Clock size={14} />
                        {order.time}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Eye size={16} />
                          </button>
                          <button className="p-1 text-orange-600 hover:bg-orange-50 rounded transition-colors">
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Menus */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
              <h2 className="text-xl font-bold text-white">เมนูยอดนิยม</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {topMenus.map((menu, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{menu.name}</p>
                        <p className="text-sm text-gray-600">{menu.sales} ขาย</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{menu.revenue.toLocaleString()} ฿</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">การดำเนินการด่วน</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "จัดการเมนู", icon: "🍽️", color: "from-orange-500 to-orange-600" },
              { name: "รายงานขาย", icon: "📊", color: "from-blue-500 to-blue-600" },
              { name: "จัดการลูกค้า", icon: "👥", color: "from-purple-500 to-purple-600" },
              { name: "ตั้งค่าร้าน", icon: "⚙️", color: "from-gray-500 to-gray-600" },
              { name: "โปรโมชั่น", icon: "🎯", color: "from-green-500 to-green-600" },
              { name: "ช่วยเหลือ", icon: "❓", color: "from-red-500 to-red-600" }
            ].map((action, index) => (
              <button
                key={index}
                className={`bg-gradient-to-r ${action.color} hover:opacity-90 text-white p-4 rounded-xl transition-all transform hover:scale-105 shadow-lg flex flex-col items-center space-y-2`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-sm font-semibold">{action.name}</span>
              </button>
            ))}
          </div>
        </div> */}
      </div>
    </div>
    
  );
};

export default Dashboard;