import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Search, Menu, X } from "lucide-react";

const Navbar = ({ tableNumber: propTableNumber, order_code }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);

  const storedOrder = sessionStorage.getItem("order_code");
  const orderCodeToUse = order_code || storedOrder;

  //ดึงออเดอร์ที่เข้ามานับแล้วแสดงผล
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(sessionStorage.getItem("cart"));
      if (storedCart && Array.isArray(storedCart.items)) {
        const totalQty = storedCart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(totalQty);
      } else {
        setCartCount(0);
      }
    };

    // เรียกตอนโหลด
    updateCartCount();

    // กรณีมีการเปลี่ยนจากหน้าอื่น ให้ดักฟัง event custom (option เพิ่มเติม)
    window.addEventListener("cartUpdated", updateCartCount);

    // ล้าง event listener เมื่อ unmount
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);



  useEffect(() => {
    // ใช้ prop ก่อน ถ้าไม่มี ค่อยดึงจาก localStorage
    if (propTableNumber) {
      setTableNumber(propTableNumber);
    } else {
      const storedTable = sessionStorage .getItem("table_number");
      setTableNumber(storedTable);
    }
  }, [propTableNumber]);

  if (!tableNumber) {
    // กรณีไม่มีเลขโต๊ะ แสดงข้อความหรือ UI อื่นๆ ตามต้องการ
    return (
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg fixed w-full top-0 z-50 p-4 text-white text-center">
        กรุณาสแกน QR Code เพื่อเข้าสู่ระบบและเลือกโต๊ะก่อนใช้งาน
      </nav>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-white text-2xl font-bold">🍽️ ร้านอาหารป้าอ้อ</h1>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {/* <Link
                to={`/user-home/table/${tableNumber}`}
                className="text-white hover:text-orange-200 transition-colors"
              >
                หน้าแรก
              </Link> */}
              <Link
                to={`/user-menu/table/${tableNumber}`}
                className="text-white hover:text-orange-200 transition-colors"
              >
                เมนูอาหาร
              </Link>
              <Link
                 to={`/user/viewRes/${tableNumber}`}
                className="text-white hover:text-orange-200 transition-colors"
              >
                เกี่ยวกับเรา
              </Link>
              {orderCodeToUse && (
                <Link
                  to={`/user/viewOrder-list/${orderCodeToUse}`}
                  className="text-white hover:text-orange-200 transition-colors"
                >
                  รายการคำสั่งซื้อ
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-orange-200">
                <Search size={20} />
              </button>

              <Link to={`/user-product/table/${tableNumber}`}>
                <div className="text-white hover:text-orange-200 relative">
                  <ShoppingCart size={20} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                </div>
              </Link>

              <button
                className="md:hidden text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-orange-600">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to={`/user-menu/table/${tableNumber}`}
                className="text-white block px-3 py-2 hover:bg-orange-700 rounded"
              >
                เมนูอาหาร
              </Link>
              <Link
                to={`/user/viewRes/${tableNumber}`}
                className="text-white block px-3 py-2 hover:bg-orange-700 rounded"
              >
                เกี่ยวกับเรา
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
