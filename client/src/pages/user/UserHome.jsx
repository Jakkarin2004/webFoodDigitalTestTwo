import React, { useEffect, useState } from 'react';
import { FiSearch, FiClock, FiStar, FiShoppingCart } from 'react-icons/fi';
import Navbar from '../../components/user/Navbar';
import { useParams, useNavigate} from "react-router-dom";
import axios from 'axios';

const UserHome = () => {
  const { table_number } = useParams();

  const [tableInfo, setTableInfo] = useState(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [errorTable, setErrorTable] = useState(null);
const navigate = useNavigate(); // เพิ่มบรรทัดนี้
  // ตัวอย่างเมนูยอดนิยม
  const popularMenus = [
    { id: 1, name: 'ข้าวผัดปู', price: 120, image: '/images/crab-fried-rice.jpg', time: '15-20 นาที', rating: 4.8 },
    { id: 2, name: 'ต้มยำกุ้ง', price: 150, image: '/images/tom-yum.jpg', time: '20-25 นาที', rating: 4.7 },
    { id: 3, name: 'ผัดไทย', price: 90, image: '/images/pad-thai.jpg', time: '10-15 นาที', rating: 4.5 },
    { id: 4, name: 'ส้มตำไทย', price: 80, image: '/images/som-tum.jpg', time: '5-10 นาที', rating: 4.6 },
  ];

  const categories = [
    { id: 1, name: 'อาหารไทย', icon: '🍜' },
    { id: 2, name: 'อาหารญี่ปุ่น', icon: '🍣' },
    { id: 3, name: 'อาหารอิตาเลียน', icon: '🍕' },
    { id: 4, name: 'อาหารฟิวชั่น', icon: '🍴' },
    { id: 5, name: 'เครื่องดื่ม', icon: '🍹' },
    { id: 6, name: 'ของหวาน', icon: '🍰' },
  ];

  useEffect(() => {
    // ตรวจสอบ format ของ table_number ก่อน
    if (!table_number || !/^\d+$/.test(table_number)) {
      console.error("❌ เลขโต๊ะไม่ถูกต้อง:", table_number);
      navigate("/404");
      return;
    }

    // เรียก API ตรวจสอบสถานะโต๊ะ (แก้ endpoint ให้ตรงกับที่ใช้ในส่วนอื่น)
    axios.get(`http://localhost:3000/api/user/check-table/${table_number}`)
      .then(res => {
        console.log("✅ โต๊ะมีอยู่:", res.data);
        if (res.data && res.data.table) {
          setTableInfo(res.data.table);
          setErrorTable(null);
          // เซฟเลขโต๊ะถ้าเช็คผ่าน
          localStorage.setItem("table_number", table_number);
        } else {
          console.error("❌ โต๊ะไม่ถูกต้อง");
          navigate("/404");
        }
      })
      .catch((err) => {
        console.error("❌ ไม่พบโต๊ะ:", err);
        navigate("/404");
      })
      .finally(() => setLoadingTable(false));
  }, [table_number, navigate]); // เพิ่ม navigate ใน dependency array

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar tableNumber={table_number} />

      <div className="container mx-auto px-4 py-2">
        {loadingTable && <p className="text-center text-gray-600">กำลังโหลดข้อมูลโต๊ะ...</p>}
        {errorTable && <p className="text-center text-red-600 font-semibold">{errorTable}</p>}
        {tableInfo && (
          <p className="text-center text-green-600 font-semibold mb-4">
            ✅ โต๊ะหมายเลข {tableInfo.table_number} พร้อมใช้งาน
          </p>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">เมนูอาหารอร่อยทุกจาน</h1>
          <p className="text-xl mb-8">สั่งอาหารออนไลน์ง่ายๆ ในไม่กี่คลิก</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative ">
            <input
              type="text"
              placeholder="ค้นหาอาหารที่คุณชอบ..."
              className="w-full py-4 px-6 rounded-full shadow-lg bg-white text-gray-800 focus:outline-none"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition">
              <FiSearch size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">หมวดหมู่</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition cursor-pointer hover:bg-orange-50"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="text-lg font-medium text-gray-800">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Menus */}
      <div className="container mx-auto px-4 py-12 bg-white">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">เมนูยอดนิยม</h2>
          <button className="text-orange-600 font-medium hover:text-orange-700 transition">
            ดูทั้งหมด →
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularMenus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition">
              <div className="relative">
                <img 
                  src={menu.image} 
                  alt={menu.name} 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <FiStar className="inline mr-1" /> {menu.rating}
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{menu.name}</h3>
                  <span className="text-orange-600 font-bold">{menu.price} บาท</span>
                </div>
                
                <div className="flex items-center text-gray-500 mb-4">
                  <FiClock className="mr-2" /> {menu.time}
                </div>
                
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition">
                  <FiShoppingCart className="mr-2" />
                  เพิ่มในตะกร้า
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Banner */}
      <div className="bg-orange-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">โปรโมชั่นพิเศษ!</h2>
          <p className="text-xl text-gray-600 mb-6">สั่งอาหารครบ 500 บาท รับส่วนลดทันที 10%</p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg transition">
            สั่งอาหารตอนนี้
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FoodExpress</h3>
              <p className="text-gray-300">บริการสั่งอาหารออนไลน์ที่รวดเร็วและสะดวกสบาย</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">เมนู</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white transition">หน้าหลัก</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">เมนูอาหาร</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">โปรโมชั่น</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">เกี่ยวกับเรา</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
              <ul className="text-gray-300 space-y-2">
                <li>โทร: 02-123-4567</li>
                <li>อีเมล: contact@foodexpress.com</li>
                <li>ที่อยู่: กรุงเทพมหานคร</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">ติดตามเรา</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Instagram</a>
                <a href="#" className="text-gray-300 hover:text-white transition">Line</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2023 FoodExpress. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserHome;
