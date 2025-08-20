import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import useAuthStore from "../../stores/authStore";
import {
  Clock,
  CheckCircle,
  XCircle,
  Receipt,
  Utensils,
  Calendar,
  Hash,
  X,
  AlertTriangle,
} from "lucide-react";

const API_URL_ORDER = "http://localhost:3000/api/user/order-list";

const UserOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState({});
  const [currentTableNumber, setCurrentTableNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const socket = io("http://localhost:3000");

  const orderStatuses = {
    pending: {
      label: "รอดำเนินการ",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: Clock,
    },
    preparing: {
      label: "กำลังเตรียม",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Clock,
    },
    ready: {
      label: "พร้อมเสิร์ฟ",
      color: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle,
    },
    completed: {
      label: "เสร็จสิ้น",
      color: "bg-gray-50 text-gray-700 border-gray-200",
      icon: CheckCircle,
    },
    cancelled: {
      label: "ยกเลิก",
      color: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = useAuthStore.getState().token;
        if (!token) return;

        const tableNumber = window.location.pathname.split('/').pop();
        setCurrentTableNumber(tableNumber);
        
        // ดึงข้อมูลออเดอร์
        const res = await axios.get(`${API_URL_ORDER}/table/${tableNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Orders Response:", res.data);

        const sortedOrders = [...res.data.orders].sort(
          (a, b) => new Date(b.order_time) - new Date(a.order_time)
        );
        setOrders(sortedOrders);

        // ดึงรายละเอียดแต่ละออเดอร์
        const details = {};
        for (const order of sortedOrders) {
          try {
            const detailRes = await axios.get(
              `${API_URL_ORDER}/${order.order_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            details[order.order_id] = detailRes.data.items || [];
            console.log(`Details for Order ${order.order_id}:`, detailRes.data);
          } catch (err) {
            console.error(`Error fetching details for Order ${order.order_id}:`, err);
            details[order.order_id] = [];
          }
        }
        setOrderDetails(details);
      } catch (err) {
        console.error("ดึงข้อมูลล้มเหลว:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Socket.io สำหรับอัพเดทแบบ real-time
    socket.on("new_order", async (newOrder) => {
      if (newOrder.table_number === currentTableNumber) {
        setOrders(prev => {
          const updatedOrders = [newOrder, ...prev];
          return updatedOrders.sort(
            (a, b) => new Date(b.order_time) - new Date(a.order_time)
          );
        });

        // ดึงรายละเอียดออเดอร์ใหม่
        const token = useAuthStore.getState().token;
        try {
          const detailRes = await axios.get(
            `${API_URL_ORDER}/${newOrder.order_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setOrderDetails(prev => ({
            ...prev,
            [newOrder.order_id]: detailRes.data.items || []
          }));
        } catch (err) {
          console.error("Error fetching new order details:", err);
        }
      }
    });

    return () => {
      socket.off("new_order");
    };
  }, [currentTableNumber]);

  const handleCancelClick = (order) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const token = useAuthStore.getState().token;
      await axios.patch(
        `${API_URL_ORDER}/${orderToCancel.order_id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderToCancel.order_id
            ? { ...order, status: "cancelled" }
            : order
        )
      );
      setShowCancelModal(false);
      setOrderToCancel(null);
    } catch (err) {
      console.error("ยกเลิกคำสั่งซื้อล้มเหลว:", err);
      alert("ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancelOrder = (status) => {
    return status === "pending" || status === "preparing";
  };

  const formatPrice = (price) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(num || 0);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-orange-200">
            
            <h1 className="text-2xl font-bold text-orange-800">
              รายการคำสั่งซื้อทั้งหมด
            </h1>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-orange-500 mt-4">กำลังโหลดข้อมูล...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Utensils className="w-16 h-16 text-orange-300 mx-auto mb-4" />
            <p className="text-orange-500 text-lg">ไม่พบคำสั่งซื้อสำหรับโต๊ะนี้</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = orderStatuses[order.status] || {
                label: order.status,
                color: "bg-gray-50 text-gray-700 border-gray-200",
                icon: Clock,
              };

              const items = orderDetails[order.order_id] || [];
              const dateTime = formatDateTime(order.order_time);

              return (
              <div
                key={order.order_id}
                className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden transform hover:scale-[1.02] transition-all duration-200"
              >
                {/* Receipt Header */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          เลขที่คำสั่งซื้อ
                        </p>
                        <p className="font-mono text-lg font-bold">
                          {order.order_id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`${statusInfo.color} border px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm bg-white`}
                      >
                        <statusInfo.icon className="w-4 h-4" />
                        {statusInfo.label}
                      </div>
                      {canCancelOrder(order.status) && (
                        <button
                          onClick={() => handleCancelClick(order)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm transition-colors"
                        >
                          <X className="w-4 h-4" />
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Receipt Info */}
                <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600">หมายเลขโต๊ะ:</span>
                      <span className="font-semibold text-orange-800">
                        {order.table_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600">วันที่:</span>
                      <span className="font-semibold text-orange-800">
                        {dateTime.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-600">เวลา:</span>
                      <span className="font-semibold text-orange-800">
                        {dateTime.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Receipt Items */}
                <div className="p-6">
                  {items.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 italic">ไม่มีรายการอาหาร</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Items Header */}
                      <div className="grid grid-cols-12 gap-2 pb-2 border-b border-dashed border-orange-300 text-xs font-semibold text-orange-700 uppercase">
                        <div className="col-span-6">ชื่อเมนู</div>
                        <div className="col-span-2 text-center">จำนวน</div>
                        <div className="col-span-2 text-right">ราคา/หน่วย</div>
                        <div className="col-span-2 text-right">รวม</div>
                      </div>

                      {/* Items List */}
                      {items.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-12 gap-2 py-2 hover:bg-orange-50 rounded-lg px-2 -mx-2 transition-colors"
                        >
                          <div className="col-span-6">
                            <p className="font-medium text-gray-800">
                              {item.menu_name}
                            </p>
                          </div>
                          <div className="col-span-2 text-center">
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-mono">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="col-span-2 text-right text-gray-600 font-mono">
                            {formatPrice(item.price)}
                          </div>
                          <div className="col-span-2 text-right font-semibold text-gray-800 font-mono">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}

                      {/* Divider */}
                      <div className="border-t border-dashed border-orange-300 my-4"></div>

                      {/* Total */}
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-orange-700">
                            ยอดรวมทั้งหมด
                          </span>
                          <span className="text-2xl font-bold text-orange-600 font-mono">
                            {formatPrice(order.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Receipt Footer */}
                <div className="px-6 py-3 bg-orange-50 border-t border-orange-200">
                  <p className="text-center text-xs text-orange-600">
                    ขอบคุณที่ใช้บริการ • Thank you for your order
                  </p>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && orderToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ยืนยันการยกเลิกคำสั่งซื้อ
              </h3>
              <p className="text-gray-600 mb-2">
                คุณต้องการยกเลิกคำสั่งซื้อหมายเลข
              </p>
              <p className="font-mono font-bold text-lg text-red-600 mb-6">
                {orderToCancel.order_id}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setOrderToCancel(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                  disabled={isCancelling}
                >
                  ไม่ยกเลิก
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderList;