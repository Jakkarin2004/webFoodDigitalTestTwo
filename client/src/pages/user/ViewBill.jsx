import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/user/Navbar";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const socket = io("http://localhost:3000");

const ViewBill = ({ tableNumber: propTableNumber }) => {
  const { order_code } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [tableNumber, setTableNumber] = useState(null);

  const orderStatuses = {
    pending: { label: "รอดำเนินการ" },
    preparing: { label: "กำลังเตรียม" },
    ready: { label: "พร้อมเสิร์ฟ" },
    completed: { label: "เสร็จสิ้น" },
    cancelled: { label: "ยกเลิก" },
  };

  useEffect(() => {
    if (propTableNumber) setTableNumber(propTableNumber);
    else setTableNumber(sessionStorage.getItem("table_number"));
  }, [propTableNumber]);

  // ฟังก์ชันดึงข้อมูลบิล
  const fetchBill = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/user/viewOrder-list/${order_code}`);
      setBill(res.data);
    } catch (error) {
      console.error("Fetch bill error:", error);
      toast.error("ไม่พบคำสั่งซื้อนี้");
    }
  };

  useEffect(() => {
    fetchBill();
  }, [order_code]);

  // รีเฟรชบิลเมื่อมีการอัปเดตจาก socket.io
  useEffect(() => {
    socket.on("order_status_updated", fetchBill);
    return () => socket.off("order_status_updated");
  }, []);

  // ฟังก์ชันยกเลิกออเดอร์ (เปิด modal)
  const handleCancelOrder = (orderId) => {
    if (!orderId || !bill.orders.some((o) => o.order_id === orderId)) {
      toast.error("ไม่พบคำสั่งซื้อนี้ในบิล");
      return;
    }
    setSelectedOrderId(orderId);
    setShowCancelModal(true);
  };

  // ฟังก์ชันยืนยันการยกเลิก
  const confirmCancelOrder = async () => {
    if (!selectedOrderId) return;
    setShowCancelModal(false);
    setLoading((prev) => ({ ...prev, [selectedOrderId]: true }));
    try {
      await axios.put(`http://localhost:3000/api/user/viewOrder-list/cancel-order/${selectedOrderId}`, {
        status: "cancelled",
      });
      await fetchBill();
      toast.success(`ยกเลิกคำสั่งซื้อ #${selectedOrderId} เรียบร้อยแล้ว!`);
    } catch (error) {
      console.error("AxiosError:", error);
      const errorMessage = error.response?.data?.message || `ไม่สามารถยกเลิกคำสั่งซื้อ #${selectedOrderId} ได้`;
      toast.error(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, [selectedOrderId]: false }));
    }
  };

  
  if (!bill) return <p className="text-center py-10">กำลังโหลด...</p>;

  const { temp_receipt, orders } = bill;

  const formatPrice = (num) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(num || 0);

  const totalPrice = formatPrice(
    orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-xl relative">
          <h2 className="text-3xl font-bold mb-2">ใบรวมรายการคำสั่งซื้อ</h2>
          <p className="text-lg text-orange-100 mb-4">
            รหัสบิล: <span className="font-semibold text-white">{temp_receipt.temp_receipt_code}</span>
          </p>
          <div className="flex gap-4 text-sm text-orange-100">
            <div>เลขโต๊ะ: {temp_receipt.table_number}</div>
            <div>วันที่/เวลา: {new Date(temp_receipt.temp_receipt_time).toLocaleString("th-TH")}</div>
          </div>
        </div>

        {/* Orders */}
        {orders.map((order, idx) => (
          <div key={idx} className={`mt-6 ${order.status === "cancelled" ? "opacity-50" : ""}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-orange-700 mb-2">
                คำสั่งซื้อที่ {order.order_id} - สถานะ: {orderStatuses[order.status]?.label || order.status}
              </h3>
              {order.status === "pending" && (
                <button
                  onClick={() => handleCancelOrder(order.order_id)}
                  disabled={loading[order.order_id]}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  {loading[order.order_id] ? "กำลังยกเลิก..." : "ยกเลิก"}
                </button>
              )}
            </div>
            {order.items.map((item, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-orange-100 p-4 mb-2 flex justify-between">
                <div>
                  <h4 className="text-orange-800 font-bold">{item.menu_name}</h4>
                  <p>จำนวน: {item.quantity} จาน</p>
                  {item.note && <p>รายละเอียดเพิ่มเติม: {item.note}</p>}
                  {item.specialRequest && <p>ระดับการเสิร์ฟ: {item.specialRequest}</p>}
                </div>
                <div className="text-orange-600 font-bold">{formatPrice(item.subtotal)}</div>
              </div>
            ))}
          </div>
        ))}

        {/* Total */}
        <div className="mt-6 bg-white rounded-xl shadow-xl border-2 border-orange-200 p-4 flex justify-between text-xl font-bold">
          <span>ยอดรวมทั้งหมด:</span>
          <span>{totalPrice}</span>
        </div>

        

        <div className="flex justify-center mt-4">
          <Link to={`/user-menu/table/${tableNumber}`} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl">
            หน้าหลัก
          </Link>
        </div>

        {/* Modal ยกเลิกออเดอร์ */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
              <h3 className="text-lg font-bold text-orange-700 mb-4">
                ยืนยันการยกเลิก
              </h3>
              <p className="text-gray-600 mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อ #<span className="font-bold">{selectedOrderId}</span>?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmCancelOrder}
                  disabled={loading[selectedOrderId]}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  {loading[selectedOrderId] ? "กำลังยกเลิก..." : "ยืนยัน"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ViewBill;