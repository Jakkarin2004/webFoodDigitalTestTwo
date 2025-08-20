import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Package,
  Filter,
  Search,
  Eye,
  Printer,
  Download,
  ChevronDown,
  Receipt,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";

const OrderHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const token = useAuthStore((state) => state.token);

  // Filter states
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    day: "",
    status: "all",
    searchTerm: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/owner/order-history/all", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setReceipts(data.receipts);
          setFilteredReceipts(data.receipts); // เริ่มต้นด้วยข้อมูลทั้งหมด
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReceipts = filteredReceipts.slice(startIndex, endIndex);

  // Filter functions
  const getAvailableYears = () => [
    ...new Set(filteredReceipts.flatMap(r => r.orders.map(o => new Date(o.order_time).getFullYear()))),
  ].sort((a, b) => b - a);

  const getAvailableMonths = (year) =>
    year
      ? [
          ...new Set(
            filteredReceipts
              .flatMap(r => r.orders)
              .filter((o) => new Date(o.order_time).getFullYear() === parseInt(year))
              .map((o) => new Date(o.order_time).getMonth() + 1)
          ),
        ].sort((a, b) => a - b)
      : [];

  const getAvailableDays = (year, month) =>
    year && month
      ? [
          ...new Set(
            filteredReceipts
              .flatMap(r => r.orders)
              .filter((o) => {
                const date = new Date(o.order_time);
                return (
                  date.getFullYear() === parseInt(year) &&
                  date.getMonth() + 1 === parseInt(month)
                );
              })
              .map((o) => new Date(o.order_time).getDate())
          ),
        ].sort((a, b) => a - b)
      : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "cancelled":
        return "ยกเลิก";
      case "pending":
        return "รอดำเนินการ";
      default:
        return "ไม่ระบุ";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const isoString = dateString.replace(" ", "T");
    const date = new Date(isoString);
    if (isNaN(date)) return "Invalid Date";
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    const number = parseFloat(price);
    if (isNaN(number)) return "-";
    return `฿${number.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
  };

  const getMonthName = (month) => {
    const months = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
    ];
    return months[month - 1];
  };

  const applyFilters = () => {
    let filtered = [...receipts];

    if (filters.year) {
      filtered = filtered.filter((r) =>
        r.orders.some((o) => new Date(o.order_time).getFullYear() === parseInt(filters.year))
      );
    }

    if (filters.month) {
      filtered = filtered.filter((r) =>
        r.orders.some((o) => new Date(o.order_time).getMonth() + 1 === parseInt(filters.month))
      );
    }

    if (filters.day) {
      filtered = filtered.filter((r) =>
        r.orders.some((o) => new Date(o.order_time).getDate() === parseInt(filters.day))
      );
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((r) =>
        r.orders.some((o) => o.status === filters.status)
      );
    }

    if (filters.searchTerm) {
      filtered = filtered.filter((r) =>
        r.receipt_code.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        r.orders.some((o) =>
          o.pending_order_id.toString().toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          o.table_number.toString().toLowerCase().includes(filters.searchTerm.toLowerCase())
        )
      );
    }

    setFilteredReceipts(filtered);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      year: "",
      month: "",
      day: "",
      status: "all",
      searchTerm: "",
    });
    setFilteredReceipts(receipts);
    setCurrentPage(1);
  };

  const handleYearChange = (year) => {
    setFilters({
      ...filters,
      year: year,
      month: "",
      day: "",
    });
  };

  const handleMonthChange = (month) => {
    setFilters({
      ...filters,
      month: month,
      day: "",
    });
  };

  const getTotalStats = () => {
    const completed = filteredReceipts.flatMap(r => r.orders).filter((o) => o.status === "completed");
    const totalRevenue = completed.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
    return {
      totalOrders: filteredReceipts.flatMap(r => r.orders).length,
      completedOrders: completed.length,
      totalRevenue: totalRevenue,
    };
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getFilterDisplayText = () => {
    if (filters.day && filters.month && filters.year) {
      return `${filters.day} ${getMonthName(parseInt(filters.month))} ${filters.year}`;
    } else if (filters.month && filters.year) {
      return `${getMonthName(parseInt(filters.month))} ${filters.year}`;
    } else if (filters.year) {
      return `ปี ${filters.year}`;
    }
    return "ทั้งหมด";
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                ประวัติคำสั่งซื้อ
              </h1>
              <p className="text-gray-600">
                ดูประวัติและจัดการคำสั่งซื้อทั้งหมด
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" />
                <span className="text-sm text-gray-600">
                  ช่วงเวลา:{" "}
                  <span className="font-semibold text-orange-600">
                    {getFilterDisplayText()}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilterModal(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Filter size={20} />
                กรองข้อมูล
              </button>
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    กรองข้อมูล
                  </h2>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    เลือกช่วงเวลา
                  </h3>
                  <p className="text-sm text-blue-600">
                    เลือกปี → เดือน → วัน ตามลำดับ
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ปี
                    </label>
                    <select
                      value={filters.year}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">เลือกปี</option>
                      {getAvailableYears().map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เดือน
                    </label>
                    <select
                      value={filters.month}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      disabled={!filters.year}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">เลือกเดือน</option>
                      {getAvailableMonths(filters.year).map((month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      วัน
                    </label>
                    <select
                      value={filters.day}
                      onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                      disabled={!filters.year || !filters.month}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">เลือกวัน</option>
                      {getAvailableDays(filters.year, filters.month).map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    สถานะคำสั่งซื้อ
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="completed">สำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                    <option value="pending">รอดำเนินการ</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    ค้นหา
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    รีเซ็ต
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal รายละเอียดคำสั่งซื้อ */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  รายละเอียดคำสั่งซื้อ #{selectedOrder.receipt_code}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {selectedOrder.orders.map((order) => (
                <div key={order.pending_order_id} className="mb-6 bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Order ID</p>
                      <p className="text-xl font-bold text-blue-600">
                        #{order.pending_order_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">โต๊ะหมายเลข</p>
                      <p className="text-xl font-bold text-blue-600">
                        {order.table_number}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 text-sm">เวลาสั่ง</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatDateTime(order.order_time)}
                      </p>
                    </div>
                  </div>

                  {/* รายการอาหาร */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      รายการอาหาร
                    </h3>
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div
                          key={item.pending_item_id}
                          className="flex justify-between items-center p-4 bg-white rounded-lg"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              {item.menu_name}
                            </p>
                            <p className="text-gray-600 text-sm">
                              จำนวน: {item.quantity}
                            </p>
                            <p className="text-gray-600 text-sm">
                              ระดับการเสิร์ฟ: {item.specialRequest || "-"}
                            </p>
                            <p className="text-gray-600 text-sm">
                              รายละเอียดเพิ่มเติม: {item.note || "-"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-gray-500 text-sm">
                              ราคาต่อหน่วย: {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* สรุปยอดรวม */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">
                        ยอดรวมทั้งสิ้น:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(order.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

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

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    {/* รหัสคำสั่งซื้อ */}
                    ลำดับ
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
                {currentReceipts.map((receipt,i) => {
                  // หา order ล่าสุดเพื่อใช้แสดงข้อมูลในตาราง
                  const latestOrder = receipt.orders.reduce((latest, current) => {
                    return new Date(latest.order_time) > new Date(current.order_time) ? latest : current;
                  }, receipt.orders[0]);

                  return (
                    <tr
                      key={receipt.receipt_code}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800 text-center">
                        {/* {receipt.receipt_code}  */} {i+1}

                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mx-auto">
                          {latestOrder.table_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm inline-block">
                          {formatDateTime(latestOrder.order_time)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div
                          className={`${getStatusColor(latestOrder.status)} rounded-lg px-3 py-1 text-sm inline-flex items-center gap-1 font-medium`}
                        >
                          {getStatusText(latestOrder.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-green-600">
                        {formatPrice(
                          receipt.orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0)
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(receipt)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="พิมพ์ใบเสร็จ"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredReceipts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
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

        {/* Pagination Component */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">แสดง</span>
              <select
                value={itemsPerPage}
                onChange={(e) => changeItemsPerPage(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">รายการต่อหน้า</span>
            </div>
            <div className="text-sm text-gray-600">
              แสดง {startIndex + 1} - {Math.min(endIndex, filteredReceipts.length)} จาก{" "}
              {filteredReceipts.length} รายการ
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <ChevronLeft size={16} />
                ก่อนหน้า
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..."}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      page === currentPage
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                        : page === "..."
                        ? "text-gray-400 cursor-default"
                        : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                ถัดไป
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="md:hidden mt-4 flex items-center justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              }`}
            >
              <ChevronLeft size={16} />
              ก่อนหน้า
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">หน้า</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    goToPage(page);
                  }
                }}
                className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-600">จาก {totalPages}</span>
            </div>
            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              }`}
            >
              ถัดไป
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;