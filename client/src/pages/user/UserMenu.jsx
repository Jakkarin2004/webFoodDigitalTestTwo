import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Star, Clock, Users, X } from "lucide-react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
//เอาไว้ทำ modal
import toast from "react-hot-toast";

import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";

const API_URL_CAT = `http://localhost:3000/api/user/home/categories`;
const API_URL_IMAGE = "http://localhost:3000/uploads/food";

const UserMenu = () => {
  const { table_number } = useParams();
  const navigate = useNavigate();

  const [categorie, setCategorie] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [noteByMenu, setNoteByMenu] = useState({});
  const [specialRequestByMenu, setSpecialRequestByMenu] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const options = ["ธรรมดา", "พิเศษ"];

  // ตรวจสอบโต๊ะ
  useEffect(() => {
    if (!table_number || !/^\d+$/.test(table_number)) {
      navigate("/404");
      return;
    }

    axios
      .get(`http://localhost:3000/api/user/check-table/${table_number}`)
      .then((res) => {
        sessionStorage.setItem("table_number", table_number);
      })
      .catch(() => navigate("/404"));
  }, [table_number, navigate]);

  // โหลดหมวดหมู่
  useEffect(() => {
    axios
      .get(API_URL_CAT)
      .then((res) => setCategorie(res.data))
      .catch((err) => console.error("โหลดหมวดหมู่ผิดพลาด:", err));
  }, []);

  // โหลดสินค้าทั้งหมด
  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/user/home/products/0`)
      .then((res) => setAllProducts(res.data))
      .catch((err) => console.error("โหลดเมนูผิดพลาด:", err));
  }, []);

  // สไลด์โชว์
  const slides = [
    {
      id: 1,
      image:
        "https://recipe.sgethai.com/wp-content/uploads/2025/06/240625-kaomankai-cover03.webp",
      title: "ข้าวมันไก่",
      subtitle: "อร่อยถึงใจ",
    },
    {
      id: 2,
      image:
        "https://www.thipkitchen.com/images/course/khamu/img1.jpg",
      title: "ข้าวขาหมู",
      subtitle: "รสชาติแท้ สูตรดั้งเดิม",
    },
    {
      id: 3,
      image:
        "https://img.wongnai.com/p/1968x0/2018/05/12/a6f94b454e5a410686d92dbffb17e71c.jpg",
      title: "ผัดคะน้าหมูกรอบ",
      subtitle: "เนื้อชั้นดี",
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  // เพิ่มเมนูลงตะกร้า
  const handleAddToOrder = (menu_id, menu_name, menu_image, price) => {
    const tableNumber = sessionStorage.getItem("table_number");
    if (!tableNumber) return alert("กรุณาสแกน QR Code ใหม่");

    let existingCart = JSON.parse(sessionStorage.getItem("cart")) || {
      table_number: tableNumber,
      session_id: uuidv4(),
      items: [],
    };

    if (existingCart.table_number !== tableNumber) {
      existingCart = {
        table_number: tableNumber,
        session_id: uuidv4(),
        items: [],
      };
    }

    const note = noteByMenu[menu_id] || "ไม่มี";
    const special = specialRequestByMenu[menu_id] || "ธรรมดา";
    const finalPrice =
      special === "พิเศษ" ? parseFloat(price) + 10 : parseFloat(price);

    const newItem = {
      cartItemId: uuidv4(),
      id: menu_id,
      name: menu_name,
      image: menu_image,
      price: finalPrice,
      note,
      specialRequest: special,
      quantity: 1,
    };

    existingCart.items.push(newItem);
    sessionStorage.setItem(
      "cart",
      JSON.stringify({
        table_number: tableNumber,
        items: existingCart.items,
      })
    );

    // เพิ่ม event เพื่อแจ้ง Navbar ว่ามีการเปลี่ยนแปลง
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("เพิ่มเมนูลงตะกร้าเรียบร้อย");
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar tableNumber={table_number} />

      {/* Hero Slider */}
      <div className="pt-16 relative ">
        <div className="relative h-96 overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide
                  ? "translate-x-0"
                  : index < currentSlide
                  ? "-translate-x-full"
                  : "translate-x-full"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-xl md:text-2xl">{slide.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full"
          >
            →
          </button>
        </div>
      </div>

      {/* Netflix-style Category Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8 ">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          เมนูอาหารทั้งหมด
        </h2>

        {categorie.map((cat) => {
          const filtered = allProducts.filter(
            (p) => p.menu_type_id === cat.menu_type_id
          );

          return (
            <div
              key={cat.menu_type_id}
              className="mb-10 bg-white shadow-md rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🍽️ {cat.type_name}
              </h3>

              {filtered.length === 0 ? (
                <p className="text-gray-500 italic">ไม่มีในหมวดอาหาร</p>
              ) : (
                <div className="flex overflow-x-auto space-x-4 pb-2 scrollbar-hide">
                  {filtered.map((product) => (
                    <div
                      key={product.menu_id}
                      className="min-w-[250px] bg-white rounded-xl shadow hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedFood(product);
                        setNoteByMenu((prev) => ({
                          ...prev,
                          [product.menu_id]: prev[product.menu_id] || "",
                        }));
                        setSpecialRequestByMenu((prev) => ({
                          ...prev,
                          [product.menu_id]: prev[product.menu_id] || "ธรรมดา",
                        }));
                      }}
                    >
                      <img
                        src={`${API_URL_IMAGE}/${product.menu_image}`}
                        alt={product.menu_name}
                        className="w-full h-40 object-cover rounded-t-xl"
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-lg">
                          {product.menu_name}
                        </h4>
                        <p className="text-orange-500 font-semibold">
                          ฿{parseFloat(product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedFood && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedFood(null)} //คลิกพื้นหลัง = ปิด
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()} //ป้องกันคลิกใน modal ไม่ให้ปิด
          >
            <div className="relative">
              <img
                src={`${API_URL_IMAGE}/${selectedFood.menu_image}`}
                alt={selectedFood.menu_name}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedFood.menu_name}
              </h2>

              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-orange-500">
                  ฿
                  {(specialRequestByMenu[selectedFood.menu_id] === "พิเศษ"
                    ? parseFloat(selectedFood.price) + 10
                    : parseFloat(selectedFood.price)
                  ).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 text-gray-600">
                <div className="flex items-center">
                  <Users size={18} />
                  <span className="ml-2">
                    หมวด : {selectedFood.category_name}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">รายละเอียดเมนู</h3>
              <p className="text-gray-700 mb-4">{selectedFood.detail_menu}</p>

              <h3 className="text-xl font-semibold mb-2">เลือกระดับ</h3>
              <div className="flex space-x-4 mb-4">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setSpecialRequestByMenu((prev) => ({
                        ...prev,
                        [selectedFood.menu_id]: option,
                      }))
                    }
                    className={`px-4 py-2 rounded-full border ${
                      specialRequestByMenu[selectedFood.menu_id] === option
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-800 border-gray-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-2">
                รายละเอียดเพิ่มเติม
              </h3>
              <input
                className="w-full p-2 border border-gray-500 rounded mb-6"
                type="text"
                value={noteByMenu[selectedFood.menu_id] || ""}
                onChange={(e) =>
                  setNoteByMenu((prev) => ({
                    ...prev,
                    [selectedFood.menu_id]: e.target.value,
                  }))
                }
                placeholder="เพิ่มรายละเอียดเพิ่มเติม เช่น ไม่เผ็ด, ไม่ใส่ผัก"
              />

              <div className="flex gap-4">
                <button
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium"
                  onClick={() =>
                    handleAddToOrder(
                      selectedFood.menu_id,
                      selectedFood.menu_name,
                      selectedFood.menu_image,
                      selectedFood.price
                    )
                  }
                >
                  เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default UserMenu;
