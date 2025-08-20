import React, { useState, useEffect } from "react";
import {
  Save,
  Edit2,
  User,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Camera,
  Check,
  Clock,
  UserCheck,
  Mail,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
const StaffProfileManagement = () => {
  const [userData, setUserData] = useState(null); // เริ่มต้นเป็น null

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = useAuthStore.getState().token; // ✅ ดึง token จาก zustand
        const res = await axios.get("http://localhost:3000/api/staff", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(res.data); // ✅ อัปเดตข้อมูลที่ได้
      } catch (error) {
        console.error("❌ โหลดข้อมูลผู้ใช้ล้มเหลว:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
  const safeUserData = userData || { role: "" /* default values */ };

  const roleOptions = {
    admin: {
      name: "ผู้ดูแลระบบ",
      color: "red",
      bgColor: "bg-red-50 border-red-200",
    },
    user: {
      name: "ผู้ใช้ทั่วไป",
      color: "gray",
      bgColor: "bg-gray-50 border-gray-200",
    },
  };

  useEffect(() => {
    if (userData) {
      setFormData({ ...userData });
    }
  }, [userData]);

  useEffect(() => {
    // Check if form data has changed
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(userData);
    setIsDirty(hasChanged);
  }, [formData, userData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

 const handleSave = async () => {
  const { first_name, last_name, phone_number } = formData;

  if (!first_name?.trim() || !last_name?.trim()) {
    return alert("กรุณากรอกชื่อและนามสกุล");
  }

  try {
    const token = useAuthStore.getState().token;

    const res = await fetch("http://localhost:3000/api/staff", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    first_name,
    last_name,
    phone_number,
  }),
});
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "เกิดข้อผิดพลาด");

    setUserData({ ...userData, first_name, last_name, phone_number, updated_at: new Date().toISOString() });
    setIsEditing(false);
    setIsDirty(false);
    toast.success("บันทึกข้อมูลสำเร็จ");
  } catch (error) {
    console.error("❌", error);
    toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  }
};


  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
    setIsDirty(false);
    setShowPassword(false);
  };

//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       // Simulate image upload - in real app, upload to server
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         handleInputChange("profile_image", e.target.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const getAccountAge = () => {
    const createdDate = new Date(userData.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              {/* <h1 className="text-3xl font-bold text-gray-800 mb-2">
                โปรไฟลผู้ใช้
              </h1> */}
              <p className="text-gray-600">
                จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี
              </p>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                      isDirty
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <Save size={20} />
                    บันทึก
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit2 size={20} />
                  แก้ไขข้อมูล
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-orange-400 to-orange-500 p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                {/* {isEditing && (
                  <label className="absolute inset-0 cursor-pointer bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )} */}
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">
                  {userData?.first_name} {userData?.last_name}
                </h2>
                <p className="text-orange-100 text-lg">@{userData?.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Shield
                    size={16}
                    className={
                      roleOptions[userData?.role]?.iconColor || "text-gray-200"
                    }
                  />
                  <span
                    className={
                      roleOptions[userData?.role]?.textColor || "text-gray-100"
                    }
                  >
                    {roleOptions[userData?.role]?.name ||
                      userData?.role ||
                      "ไม่ระบุบทบาท"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  ข้อมูลส่วนตัว
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ชื่อ *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.first_name || ""}
                        onChange={(e) =>
                          handleInputChange("first_name", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="ชื่อ"
                        required
                      />
                    ) : (
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <p className="text-orange-600 font-semibold">
                          {userData?.first_name || "ยังไม่ระบุชื่อ"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      นามสกุล *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.last_name || ""}
                        onChange={(e) =>
                          handleInputChange("last_name", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="นามสกุล"
                        required
                      />
                    ) : (
                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <p className="text-orange-600 font-semibold">
                          {userData?.last_name || "ยังไม่ระบุนามสกุล"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      เบอร์โทรศัพท์
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone_number || ""}
                        onChange={(e) =>
                          handleInputChange("phone_number", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="0812345678"
                        maxLength="10"
                      />
                    ) : (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center gap-3">
                          <Phone size={20} className="text-green-600" />
                          <p className="text-green-600 font-semibold">
                            {userData?.phone_number || "ยังไม่ระบุเบอร์โทร"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  {/* <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            อีเมล
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={formData.email || ""}
                                                onChange={(e) =>
                                                    handleInputChange("email", e.target.value)
                                                }
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                                placeholder="example@email.com"
                                            />
                                        ) : (
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                                <div className="flex items-center gap-3">
                                                    <Mail size={20} className="text-purple-600" />
                                                    <p className="text-purple-600 font-semibold">
                                                        {userData?.email || "ยังไม่ระบุอีเมล"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div> */}
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  ข้อมูลบัญชี
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ชื่อผู้ใช้ *
                    </label>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                          <User size={20} className="text-gray-600" />
                          <p className="text-gray-700 font-semibold">
                            {userData?.username || "ยังไม่ระบุชื่อผู้ใช้"}
                          </p>
                        </div>
                      </div>
                    
                  </div>

                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      บทบาท
                    </label>
                    
                      <div
                        className={`p-4 rounded-xl border ${
                          roleOptions[userData?.role]?.bgColor ||
                          "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Shield
                            size={20}
                            className={
                              roleOptions[userData?.role]?.color === "red"
                                ? "text-red-600"
                                : "text-gray-600"
                            }
                          />
                          <p
                            className={
                              "font-semibold " +
                              (roleOptions[userData?.role]?.color === "red"
                                ? "text-red-600"
                                : "text-gray-600")
                            }
                          >
                            {roleOptions[userData?.role]?.name ||
                              userData?.role ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    
                  </div>

                  {/* User ID */}
                  {/* <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ID ผู้ใช้
                    </label>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-gray-700 font-semibold">
                        #{userData?.id}
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Profile Image URL (only in edit mode) */}

              {/* Timestamps */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p className="font-semibold">วันที่สร้างบัญชี:</p>
                    <p>
                      {userData?.created_at
                        ? new Date(userData.created_at).toLocaleString("th-TH")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">อัปเดตล่าสุด:</p>
                    <p>
                      {userData?.updated_at
                        ? new Date(userData.updated_at).toLocaleString("th-TH")
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfileManagement;
