import React, { useState, useEffect } from "react";
import { Calendar, Filter, Download, ChevronDown } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FileDown } from "lucide-react";

const ManageSale = () => {
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    month: "",
    day: "",
  });
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/owner/order-sale/all",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setReceipts(data.receipts);
          setFilteredReceipts(data.receipts);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", err);
      }
    };
    if (token) fetchSales();
  }, [token]);

  // Filter functions (reuse และปรับ)
  const getAvailableYears = () =>
    [
      ...new Set(
        receipts.flatMap(
          (r) => r.orders.map((o) => new Date(o.order_time).getFullYear() + 543) // แปลงเป็น พ.ศ.
        )
      ),
    ].sort((a, b) => b - a);

  const getAvailableMonths = (year) =>
    year
      ? [
          ...new Set(
            receipts
              .flatMap((r) => r.orders)
              .filter(
                (o) =>
                  new Date(o.order_time).getFullYear() + 543 === parseInt(year)
              )
              .map((o) => new Date(o.order_time).getMonth() + 1)
          ),
        ].sort((a, b) => a - b)
      : [];

  const getAvailableDays = (year, month) =>
    year && month
      ? [
          ...new Set(
            receipts
              .flatMap((r) => r.orders)
              .filter((o) => {
                const date = new Date(o.order_time);
                return (
                  date.getFullYear() + 543 === parseInt(year) &&
                  date.getMonth() + 1 === parseInt(month)
                );
              })
              .map((o) => new Date(o.order_time).getDate())
          ),
        ].sort((a, b) => a - b)
      : [];

  const applyFilters = () => {
    let filtered = [...receipts];
    const adjYear = filters.year ? parseInt(filters.year) - 543 : null; // แปลง พ.ศ. กลับเป็น ค.ศ. สำหรับ filter

    if (filters.year) {
      filtered = filtered.filter((r) =>
        r.orders.some((o) => new Date(o.order_time).getFullYear() === adjYear)
      );
    }

    if (filters.month) {
      filtered = filtered.filter((r) =>
        r.orders.some(
          (o) =>
            new Date(o.order_time).getMonth() + 1 === parseInt(filters.month)
        )
      );
    }

    if (filters.day) {
      filtered = filtered.filter((r) =>
        r.orders.some(
          (o) => new Date(o.order_time).getDate() === parseInt(filters.day)
        )
      );
    }

    setFilteredReceipts(filtered);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      year: "",
      month: "",
      day: "",
    });
    setFilteredReceipts(receipts);
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

  // คำนวณ stats
  const getSalesStats = () => {
    const orders = filteredReceipts.flatMap((r) => r.orders);
    const totalSales = orders.reduce(
      (sum, o) => sum + parseFloat(o.total_price || 0),
      0
    );

    // Use filtered date or today if no filter
    const filterDate =
      filters.day && filters.month && filters.year
        ? new Date(
            parseInt(filters.year) - 543,
            parseInt(filters.month) - 1,
            parseInt(filters.day)
          )
        : new Date();
    const todayOrders = orders.filter((o) => {
      const date = new Date(o.order_time);
      return date.toDateString() === filterDate.toDateString();
    });
    const todaySales = todayOrders.reduce(
      (sum, o) => sum + parseFloat(o.total_price || 0),
      0
    );
    const numOrders = todayOrders.length;

    // Previous day for growth (based on filtered date)
    const prevDay = new Date(filterDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevOrders = orders.filter((o) => {
      const date = new Date(o.order_time);
      return date.toDateString() === prevDay.toDateString();
    });
    const prevSales = prevOrders.reduce(
      (sum, o) => sum + parseFloat(o.total_price || 0),
      0
    );
    const growth = todaySales - prevSales; // ส่วนต่างจำนวนเงิน
    const growthPercent =
      prevSales > 0 ? ((todaySales - prevSales) / prevSales) * 100 : 0; // เปอร์เซ็นต์การเปลี่ยนแปลง

    return { totalSales, numOrders, todaySales, growth, growthPercent };
  };

  const getFilteredSales = () => {
    const orders = filteredReceipts.flatMap((r) => r.orders);
    let daily = 0,
      monthly = 0,
      yearly = 0;

    if (filters.day && filters.month && filters.year) {
      // รายวัน: sum เฉพาะวัน
      daily = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
      // Monthly: sum เดือนทั้งหมด
      monthly = receipts
        .flatMap((r) => r.orders)
        .filter((o) => {
          const date = new Date(o.order_time);
          return (
            date.getMonth() + 1 === parseInt(filters.month) &&
            date.getFullYear() + 543 === parseInt(filters.year)
          );
        })
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
      // Yearly: sum ปีทั้งหมด
      yearly = receipts
        .flatMap((r) => r.orders)
        .filter((o) => {
          const date = new Date(o.order_time);
          return date.getFullYear() + 543 === parseInt(filters.year);
        })
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    } else if (filters.month && filters.year) {
      daily = "ไม่ได้กำหนดเป้าหมาย";
      monthly = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
      yearly = receipts
        .flatMap((r) => r.orders)
        .filter((o) => {
          const date = new Date(o.order_time);
          return date.getFullYear() + 543 === parseInt(filters.year);
        })
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    } else if (filters.year) {
      daily = "ไม่ได้กำหนดเป้าหมาย";
      monthly = "ไม่ได้กำหนดเป้าหมาย";
      yearly = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    } else {
      // Default: all
      daily = getSalesStats().todaySales;
      monthly = receipts
        .flatMap((r) => r.orders)
        .filter((o) => {
          const date = new Date(o.order_time);
          return date.getMonth() === new Date().getMonth();
        })
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
      yearly = receipts
        .flatMap((r) => r.orders)
        .filter((o) => {
          const date = new Date(o.order_time);
          return date.getFullYear() === new Date().getFullYear();
        })
        .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    }

    return { daily, monthly, yearly };
  };

  // Data for Bar Chart (ปรับตาม filter)
  const getBarData = () => {
    const orders = filteredReceipts.flatMap((r) => r.orders);
    let data = [];

    if (filters.day) {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const daySales = orders
          .filter(
            (o) => new Date(o.order_time).toDateString() === d.toDateString()
          )
          .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        data.push({
          name: d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          }),
          sales: daySales,
        });
      }
    } else if (filters.month) {
      // Days in month
      const daysInMonth = new Date(
        parseInt(filters.year) - 543,
        parseInt(filters.month),
        0
      ).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const daySales = orders
          .filter((o) => new Date(o.order_time).getDate() === day)
          .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        data.push({ name: `${day}`, sales: daySales });
      }
    } else if (filters.year) {
      // Months in year
      for (let m = 1; m <= 12; m++) {
        const monthSales = orders
          .filter((o) => new Date(o.order_time).getMonth() + 1 === m)
          .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        data.push({ name: getMonthName(m), sales: monthSales });
      }
    } else {
      // Default last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const daySales = orders
          .filter(
            (o) => new Date(o.order_time).toDateString() === d.toDateString()
          )
          .reduce((sum, o) => sum + parseFloat(o.total_price), 0);
        data.push({
          name: d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
          }),
          sales: daySales,
        });
      }
    }
    return data;
  };

  // Data for Pie Chart (top 4 menus)
  const getPieData = () => {
    const filterDate =
      filters.day && filters.month && filters.year
        ? new Date(
            parseInt(filters.year) - 543,
            parseInt(filters.month) - 1,
            parseInt(filters.day)
          )
        : new Date(); // วันที่ปัจจุบัน (22 ส.ค. 2568, 14:52 +07)
    const items = filteredReceipts.flatMap((r) =>
      r.orders
        .filter((o) => {
          const orderDate = new Date(o.order_time);
          return orderDate.toDateString() === filterDate.toDateString();
        })
        .flatMap((o) => o.items)
    );
    const menuSales = items.reduce((acc, item) => {
      acc[item.menu_name] =
        (acc[item.menu_name] || 0) + item.quantity * item.price;
      return acc;
    }, {});
    const sorted = Object.entries(menuSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    return sorted.map(([name, sales]) => ({ name, value: sales }));
  };

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

  // Download CSV
  const downloadReport = () => {
    const orders = filteredReceipts.flatMap((r) => r.orders);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Order ID,Table,Time,Total\n" +
      orders
        .map(
          (o) =>
            `${o.pending_order_id},${o.table_number},${formatDateTime(
              o.order_time
            )},${o.total_price}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPrice = (price) => {
    if (typeof price === "string") return price;
    return `฿${price.toLocaleString("th-TH", { minimumFractionDigits: 0 })}.00`;
  };

  const getMonthName = (month) => {
    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    return months[month - 1];
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stats = getSalesStats();
  const filteredSales = getFilteredSales();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                จัดการยอดขายย้อนหลัง
              </h1>
              <p className="text-gray-600">ดูยอดขายและสถิติย้อนหลัง</p>
              <div className="mt-2 flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" />
                <span className="text-sm text-gray-600">
                  ช่วงเวลา:{" "}
                  <span className="font-semibold text-orange-600">
                    {filters.day
                      ? `${filters.day}/${filters.month}/${filters.year}`
                      : filters.month
                      ? `${getMonthName(parseInt(filters.month))}/${
                          filters.year
                        }`
                      : filters.year
                      ? `ปี ${filters.year}`
                      : "ทั้งหมด"}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilterModal(true)}
                className="bg-orange-500 from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Filter size={20} />
                กรองข้อมูล
              </button>
            </div>
          </div>
        </div>

        {/* Filter Modal (reuse) */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    กรองข้อมูลยอดขาย
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
                      ปี (พ.ศ.)
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
                      onChange={(e) =>
                        setFilters({ ...filters, day: e.target.value })
                      }
                      disabled={!filters.year || !filters.month}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">เลือกวัน</option>
                      {getAvailableDays(filters.year, filters.month).map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        )
                      )}
                    </select>
                  </div>
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

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
            <Calendar className="w-10 h-10 text-orange-500" />
            <div>
              <p className="text-gray-600">ยอดขายวันนี้</p>
              <h2 className="text-2xl font-bold">
                {formatPrice(stats.todaySales)}
              </h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
            <FileDown className="w-10 h-10 text-blue-500" />
            <div>
              <p className="text-gray-600">คำสั่งซื้อ</p>
              <h2 className="text-2xl font-bold">{stats.numOrders}</h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
            <FileDown className="w-10 h-10 text-gray-500 transition-colors duration-200" />
            <div>
              <p className="text-gray-600">ยอดขายเพิ่ม/ลด (จากเมื่อวาน)</p>
              <h2
                className={`text-2xl font-bold ${
                  stats.growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.growth >= 0
                  ? `+${stats.growth.toLocaleString(
                      "th-TH"
                    )} บาท (+${stats.growthPercent.toFixed(1)}%)`
                  : `${stats.growth.toLocaleString("th-TH")} บาท (-${Math.abs(
                      stats.growthPercent
                    ).toFixed(1)}%)`}
              </h2>
            </div>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">
              ยอดขายย้อนหลัง{" "}
              {filters.day
                ? "7 วันล่าสุด"
                : filters.month
                ? "ตามวันในเดือน"
                : "ตามเดือนในปี"}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getBarData()}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4">
              ยอดขายตามเมนู 4 เมนูยอดนิยม
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPieData()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {getPieData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center mb-6">
          <button
            onClick={downloadReport}
            className="bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-orange-600 flex items-center gap-2 mx-auto"
          >
            <Download size={20} />
            ดาวน์โหลดรายงาน
          </button>
        </div>

        {/* Bottom Filtered Sales Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-600">ยอดขายรายวัน</p>
              <h2 className="text-2xl font-bold">
                {formatPrice(filteredSales.daily)}
              </h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-600">ยอดขายรายเดือน</p>
              <h2 className="text-2xl font-bold">
                {formatPrice(filteredSales.monthly)}
              </h2>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
            <div>
              <p className="text-gray-600">ยอดขายรายปี</p>
              <h2 className="text-2xl font-bold">
                {formatPrice(filteredSales.yearly)}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSale;
