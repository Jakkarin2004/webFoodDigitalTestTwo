import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/user/Navbar";
import {
  Store,
  Phone,
  MapPin,
  FileText,
  Clock,
  Image as ImageIcon,
} from "lucide-react";

const ViewRes = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันแปลงชื่อวันเป็นภาษาไทย
  const getDayName = (day) => {
    const dayNames = {
      monday: "จันทร์",
      tuesday: "อังคาร",
      wednesday: "พุธ",
      thursday: "พฤหัสบดี",
      friday: "ศุกร์",
      saturday: "เสาร์",
      sunday: "อาทิตย์",
    };
    return dayNames[day.toLowerCase()] || day;
  };

  // ฟังก์ชันตรวจสอบและจัดรูปแบบเวลา
  const formatTime = (time) => {
    if (!time) return "--:--";
    if (typeof time !== "string") return "--:--";

    // ตรวจสอบรูปแบบเวลา HH:mm
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(time)) {
      return time;
    }

    // พยายามแปลงรูปแบบเวลา
    try {
      const [hours, minutes] = time.split(":");
      const formattedHours = hours.padStart(2, "0");
      const formattedMinutes = minutes.padStart(2, "0");
      return `${formattedHours}:${formattedMinutes}`;
    } catch (e) {
      return "--:--";
    }
  };

  // ตัวอย่างการเรียกใช้ API ใน React component
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/user/viewres/stores");
        if (response.data.success) {
          setStores(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching stores:", err);
        setError("ไม่สามารถโหลดข้อมูลร้านค้าได้");
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // ฟังก์ชันแสดงผลเวลาเปิด-ปิด
  const renderOperatingHours = (operatingHours) => {
    // ตรวจสอบว่า operatingHours เป็น object ที่มีข้อมูลหรือไม่
    if (
      !operatingHours ||
      typeof operatingHours !== "object" ||
      Object.keys(operatingHours).length === 0
    ) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock size={16} className="text-purple-500" />
          <span>ไม่ระบุเวลาเปิด-ปิด</span>
        </div>
      );
    }

    // เรียงลำดับวันตามสัปดาห์ (อาทิตย์-เสาร์)
    const daysOrder = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    return (
      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 mt-4">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-gray-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-700 mb-2">
              เวลาเปิด-ปิดร้าน
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {daysOrder.map((day) => {
                const dayData = operatingHours[day];

                // ถ้าไม่มีข้อมูลวันนี้ ให้ข้ามไป
                if (!dayData || typeof dayData !== "object") return null;

                return (
                  <div key={day} className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">
                      {getDayName(day)}:
                    </span>
                    <span className="text-gray-600">
                      {dayData.is_open
                        ? `${formatTime(dayData.open_time)} - ${formatTime(
                            dayData.close_time
                          )}`
                        : "ปิด"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
          รายการร้านอาหาร
        </h2>

        {loading ? (
          <p className="text-center text-orange-500 text-lg font-semibold animate-pulse">
            กำลังโหลดข้อมูลร้าน...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 text-lg font-semibold">
            {error}
          </p>
        ) : stores.length === 0 ? (
          <p className="text-center text-orange-500 text-lg font-semibold">
            ไม่พบข้อมูลร้านอาหาร
          </p>
        ) : (
          <div className="space-y-10">
            {stores.map((store) => (
              <div
                key={store.id || store._id}
                className="flex flex-col md:flex-row gap-6 items-start border-b border-orange-200 pb-6"
              >
                {/* รูปภาพร้าน */}
                {store.image_res ? (
                  <img
                    src={`http://localhost:3000/uploads/store/${store.image_res}`}
                    alt={store.store_name}
                    className="w-full md:w-64 h-40 object-cover rounded-xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/256x160?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full md:w-64 h-40 bg-orange-100 flex items-center justify-center rounded-xl text-orange-400">
                    <ImageIcon size={36} />
                  </div>
                )}

                {/* ข้อมูลร้าน */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <Store size={20} className="text-orange-500" />
                    {store.store_name}
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <FileText size={16} className="mt-1 text-gray-500" />
                    <span>{store.description || "ไม่มีคำอธิบายร้าน"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin size={16} className="text-blue-500" />
                    <span>{store.address || "ไม่ระบุที่อยู่"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone size={16} className="text-green-500" />
                    <span>{store.phone_number || "ไม่ระบุเบอร์โทร"}</span>
                  </div>

                  {/* แสดงเวลาเปิด-ปิดร้าน */}
                  {renderOperatingHours(store.operating_hours)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewRes;
