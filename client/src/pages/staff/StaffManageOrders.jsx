import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import useAuthStore from "../../stores/authStore";
import {
  Eye,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react";

//เอาไว้ทำ modal
import toast from "react-hot-toast";

const API_URL_ORDER = "http://localhost:3000/api/staff/orders";
const API_URL_REVENUE = "http://localhost:3000/api/owner/orders/today-revenue";

const StaffManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order_time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  //ยอดขาย
   const [revenueData, setRevenueData] = useState(null);
  // 
    const token = useAuthStore((state) => state.token);
  // 

  const socket = io("http://localhost:3000");



  const orderStatuses = {
    pending: {
      label: "รอดำเนินการ",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    preparing: {
      label: "กำลังเตรียม",
      color: "bg-blue-100 text-blue-800",
      icon: Clock,
    },
    ready: {
      label: "พร้อมเสิร์ฟ",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    completed: {
      label: "เสร็จสิ้น",
      color: "bg-gray-100 text-gray-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "ยกเลิก",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
  };


  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL_ORDER}/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orders = res.data.orders;
        setOrders(orders);

        // ✅ ดึงรายละเอียดแบบ Promise.all
        const detailsResult = await Promise.all(
          orders.map((order) =>
            axios
              .get(`${API_URL_ORDER}/${order.order_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((res) => [order.order_id, res.data.items || []])
              .catch((err) => {
                console.error(`ดึงออเดอร์ ${order.order_id} ล้มเหลว:`, err.message);
                return [order.order_id, []];
              })
          )
        );

        const details = Object.fromEntries(detailsResult);
        setOrderDetails(details);
      } catch (err) {
        console.error("ดึงข้อมูลล้มเหลว:", err.message);
      }
    };

    fetchData();

    // ✅ ใช้งาน socket
    const handleNewOrder = async (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);

      try {
        const res = await axios.get(`${API_URL_ORDER}/${newOrder.order_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrderDetails((prev) => ({
          ...prev,
          [newOrder.order_id]: res.data.items || [],
        }));
      } catch (err) {
        console.error("โหลดรายละเอียด order ใหม่ล้มเหลว", err.message);
      }
    };

    socket.on("new_order", handleNewOrder);
    return () => {
      socket.off("new_order", handleNewOrder);
    };
  }, [token]); // ✅ หาก token เปลี่ยน ควร fetch ใหม่


useEffect(() => {
  const token = useAuthStore.getState().token;

  // ดึงข้อมูลยอดขายตอนหน้าโหลดครั้งแรก
  axios
    .get("http://localhost:3000/api/owner/orders/today-revenue", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setRevenueData(res.data))
    .catch((err) => console.error("โหลดข้อมูลยอดขายล้มเหลว", err));

  // ฟัง event อัปเดตยอดขาย realtime
  const handleRevenueUpdate = (data) => {
    console.log("ได้รับข้อมูลยอดขาย realtime:", data);
    setRevenueData(data);
  };

  socket.on("today_revenue_updated", handleRevenueUpdate);

  // cleanup ถ้า component ถูกถอดออก
  return () => {
    socket.off("today_revenue_updated", handleRevenueUpdate);
  };
}, []);

  

  const formatPrice = (price) => {
    if (!price) return "฿0.00";
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ฟัง event realtime จาก socket.io
  // ✅ ฟังการเปลี่ยนสถานะแบบ realtime
  useEffect(() => {
    socket.on("order_status_updated", ({ orderId, status }) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId ? { ...order, status } : order
        )
      );
    });

    return () => {
      socket.off("order_status_updated");
    };
  }, []);

  // ✅ เปลี่ยนสถานะออเดอร์
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL_ORDER}/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // *ไม่ต้อง setOrders ตรงนี้ เพราะ socket จะทำให้แล้ว*
    } catch (err) {
      console.error("❌ เปลี่ยนสถานะไม่สำเร็จ", err);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const matchesSearch = order.table_number.toString().includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === "order_time") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_price, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-8 border border-orange-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                จัดการคำสั่งซื้อ
              </h1>
              <p className="text-gray-600">
                ติดตามและจัดการคำสั่งซื้อทั้งหมดในร้าน
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              รีเฟรช
            </button>
          </div>
        </div>

        {/* สถิติแดshboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <button
            onClick={() => setStatusFilter("all")}
            className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left ${
              statusFilter === "all" ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">คำสั่งทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.total}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left ${
              statusFilter === "pending"
                ? "ring-2 ring-yellow-500 bg-yellow-50"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">รอดำเนินการ</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("preparing")}
            className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left ${
              statusFilter === "preparing"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">กำลังเตรียม</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.preparing}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("ready")}
            className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left ${
              statusFilter === "ready"
                ? "ring-2 ring-green-500 bg-green-50"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">พร้อมเสิร์ฟ</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.ready}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("completed")}
            className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-left ${
              statusFilter === "completed"
                ? "ring-2 ring-gray-500 bg-gray-50"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">เสร็จสิ้น</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-gray-500" />
            </div>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">ยอดขายวันนี้</p>
                <p className="text-lg font-bold text-green-600">
                  {/* {formatPrice(revenueData.totalRevenue)} */}
                     {revenueData?.totalRevenue !== undefined
          ? revenueData.totalRevenue.toLocaleString()
          : "กำลังโหลด..."}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* ตัวกรองและค้นหา */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ค้นหาหมายเลขโต๊ะ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white min-w-[140px]"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="preparing">กำลังเตรียม</option>
                <option value="ready">พร้อมเสิร์ฟ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white min-w-[140px]"
              >
                <option value="order_time">เวลาสั่ง</option>
                <option value="table_number">หมายเลขโต๊ะ</option>
                <option value="total_price">ยอดรวม</option>
                <option value="status">สถานะ</option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 flex items-center gap-2 bg-white"
              >
                <Filter className="w-4 h-4" />
                <span className="text-lg">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ตารางคำสั่งซื้อ */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-white font-semibold text-left">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    โต๊ะ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    เวลาสั่ง
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    ยอดรวม
                  </th>
                  
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedOrders.map((order) => {
                  const statusInfo = orderStatuses[order.status];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={order.order_id}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        #{order.order_id}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mx-auto">
                          {order.table_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm inline-block">
                          {formatDateTime(order.order_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`${statusInfo.color} rounded-lg px-3 py-1 text-sm inline-flex items-center gap-1 font-medium`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-green-600">
                        {formatPrice(order.total_price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {order.status !== "completed" &&
                            order.status !== "cancelled" && (
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  updateOrderStatus(
                                    order.order_id,
                                    e.target.value
                                  )
                                }
                                className="text-sm border-2 border-gray-200 rounded-lg px-2 py-1 focus:border-orange-400"
                              >
                                <option value="pending">รอดำเนินการ</option>
                                <option value="preparing">กำลังเตรียม</option>
                                <option value="ready">พร้อมเสิร์ฟ</option>
                                <option value="completed">เสร็จสิ้น</option>
                                <option value="cancelled">ยกเลิก</option>
                              </select>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAndSortedOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">
                          ไม่พบคำสั่งซื้อ
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          ลองเปลี่ยนตัวกรองหรือคำค้นหา
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal รายละเอียดคำสั่งซื้อ */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  รายละเอียดคำสั่งซื้อ #{selectedOrder.order_id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* ข้อมูลคำสั่งซื้อ */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">โต๊ะหมายเลข</p>
                    <p className="text-xl font-bold text-blue-600">
                      {selectedOrder.table_number}
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-gray-600 text-sm">จำนวนลูกค้า</p>
                    <p className="text-xl font-bold text-purple-600">
                      {selectedOrder.customer_count} คน
                    </p>
                  </div> */}
                  
                  <div className="col-span-2">
                    <p className="text-gray-600 text-sm">เวลาสั่ง</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatDateTime(selectedOrder.order_time)}
                    </p>
                  </div>
                </div>
              </div>

              {/* รายการอาหาร */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  รายการอาหาร
                </h3>
                <div className="space-y-3">
                  {orderDetails[selectedOrder.order_id]?.map((item) => (
                    <div
                      key={item.item_id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.menu_name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          จำนวน: {item.quantity}
                        </p>
                        <p className="text-gray-600 text-sm">
                          ระดับการเสิร์ฟ: {item.specialRequest}
                        </p>
                        <p className="text-gray-600 text-sm">
                          รายละเอียดเพิ่มเติม: {item.note}
                        </p>
                      </div>
                     <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ราคารวม : {(item.price*item.quantity)} บาท
                        </p>
                        <p className="text-gray-500 text-sm">
                         ราคาต่อหน่วย : {formatPrice(item.price)} / 1 เมนู
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* สรุปยอดรวม */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">
                    ยอดรวมทั้งสิ้น:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(selectedOrder.total_price)}
                  </span>
                </div>
              </div>

              {/* ปุ่มปิด */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* สถิติด้านล่าง */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              <span className="font-medium">คำสั่งซื้อทั้งหมด:</span>{" "}
              {orders.length} รายการ
            </div>
            <div className="text-gray-600">
              <span className="font-medium">แสดงผล:</span>{" "}
              {filteredAndSortedOrders.length} รายการ
            </div>
            <div className="text-gray-600">
              <span className="font-medium">ยอดขายรวม:</span>{" "}
              <span className="text-green-600 font-bold">
                {/* {formatPrice(revenueData.totalRevenue)} */}
                 {/* {revenueData.totalRevenue.toLocaleString()} */}
                 
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManageOrders;
