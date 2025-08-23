import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Eye,
  EyeOff,
  User,
  Phone,
  UserCheck,
} from "lucide-react";
import axios from "axios";
import useAuthStore from "../../stores/authStore";
import toast from "react-hot-toast";

const API_URL_STAFF = "http://localhost:3000/api/owner/staff";

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    phone_number: "",
    role: "staff",
  });
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showPassword, setShowPassword] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const { token } = useAuthStore();

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, [token]);

  const fetchStaff = async () => {
    try {
      if (!token) {
        console.log("ไม่มี token");
        return;
      }

      const response = await axios.get(API_URL_STAFF, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStaff(response.data);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่", {
          duration: 6000,
        });
        // logout(); // หรือ navigate("/login")
      }
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      first_name: "",
      last_name: "",
      username: "",
      password: "",
      phone_number: "",
      role: "staff",
    });
    setEditingId(null);
    setIsFormOpen(false);
    setShowPassword(false);
  };

  const handleAdd = async () => {
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.username.trim() ||
      !formData.password.trim() ||
      !formData.phone_number.trim()
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // ตรวจสอบว่าเบอร์โทรศัพท์เป็น 10 ตัว
    if (formData.phone_number.length !== 10) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์ 10 ตัวเท่านั้น");
      return;
    }

    const staffData = { ...formData, role: "staff" };

    try {
      await axios.post(API_URL_STAFF, staffData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("เพิ่มพนักงานสำเร็จ");
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error(
        "เพิ่มพนักงานล้มเหลว:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มพนักงาน"
      );
    }
  };

  const handleEdit = (staffMember) => {
    setFormData({
      id: staffMember.id,
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      username: staffMember.username,
      password: "",
      phone_number: staffMember.phone_number,
      role: staffMember.role,
    });
    setEditingId(staffMember.id);
    setIsFormOpen(true);
  };

  const handleUpdate = async () => {
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.username.trim() ||
      !formData.phone_number.trim()
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // ตรวจสอบว่าเบอร์โทรศัพท์เป็น 10 ตัว
    if (formData.phone_number.length !== 10) {
      toast.error("กรุณากรอกเบอร์โทรศัพท์ 10 ตัวเท่านั้น");
      return;
    }

    const updatedData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      phone_number: formData.phone_number,
      role: "staff",
    };

    if (formData.password.trim()) {
      updatedData.password = formData.password;
    }

    try {
      await axios.put(`${API_URL_STAFF}/${formData.id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("แก้ไขข้อมูลพนักงานสำเร็จ!");
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error(
        "แก้ไขข้อมูลพนักงานล้มเหลว:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.error || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงาน"
      );
    }
  };

  const filteredAndSortedStaff = staff
    .filter((staffMember) => {
      const matchesSearch =
        staffMember.first_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        staffMember.last_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        staffMember.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffMember.phone_number.includes(searchTerm);

      const matchesRole =
        filterRole === "all" || staffMember.role === filterRole;

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });

  const formatDateThai = (dateString) => {
    if (!dateString) return "-";
    try {
      const utcDate = new Date(dateString.replace(" ", "T"));
      const bangkokOffset = 7 * 60 * 60 * 1000;
      const localDate = new Date(utcDate.getTime() + bangkokOffset);

      return localDate.toLocaleString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL_STAFF}/${confirmDeleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("ลบพนักงานสำเร็จ!");
      setConfirmDeleteId(null);
      fetchStaff();
    } catch (error) {
      console.error(
        "ลบพนักงานล้มเหลว:",
        error.response?.data || error.message
      );
      toast.error(
        error.response?.data?.error || "เกิดข้อผิดพลาดในการลบพนักงาน"
      );
    }
  };

  const getRoleBadge = (role) => {
    if (role === "owner") {
      return (
        <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
          <UserCheck className="w-3 h-3" />
          เจ้าของ
        </span>
      );
    }
    return (
      <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit">
        <User className="w-3 h-3" />
        พนักงาน
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-8 border border-orange-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                จัดการพนักงาน
              </h1>
              <p className="text-gray-600">
                จัดการข้อมูลพนักงานและสิทธิ์การเข้าถึงระบบ
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              เพิ่มพนักงานใหม่
            </button>
          </div>
        </div>

        {isFormOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <div
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      placeholder="ชื่อ"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      placeholder="นามสกุล"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อผู้ใช้ *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="ชื่อผู้ใช้สำหรับเข้าสู่ระบบ"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่าน{" "}
                    {editingId ? "(ไม่ต้องกรอกหากไม่ต้องการเปลี่ยน)" : "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder={
                        editingId
                          ? "กรอกรหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)"
                          : "รหัสผ่าน"
                      }
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์ *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ""); // อนุญาตเฉพาะตัวเลข
                        if (value.length <= 10) {
                          setFormData({
                            ...formData,
                            phone_number: value,
                          });
                        }
                      }}
                      placeholder="08X-XXX-XXXX"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                      maxLength={10} // จำกัดการป้อนสูงสุด 10 ตัวใน HTML
                    />
                  </div>
                </div>

                {!editingId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 font-medium">
                        พนักงานใหม่จะถูกเพิ่มในตำแหน่ง "พนักงาน" เท่านั้น
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => (editingId ? handleUpdate() : handleAdd())}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-white font-semibold text-left">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    ชื่อ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    นามสกุล
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    สร้างเมื่อ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    อัปเดตล่าสุด
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedStaff.map((staffMember, idx) => (
                  <tr
                    key={staffMember.id}
                    className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 text-center font-medium text-gray-600">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-gray-800 text-lg">
                        {staffMember.first_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-semibold text-gray-800 text-lg">
                        {staffMember.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm inline-block">
                        {staffMember.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm inline-block">
                        {formatDateThai(staffMember.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      <div className="bg-blue-100 text-blue-700 rounded-lg px-3 py-1 text-sm inline-block">
                        {formatDateThai(staffMember.updated_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(staffMember)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(staffMember.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedStaff.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">
                          ไม่พบข้อมูลพนักงาน
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          ลองเปลี่ยนคำค้นหาหรือเพิ่มพนักงานใหม่
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {staff.length}
              </div>
              <div className="text-gray-600 text-sm">พนักงานทั้งหมด</div>
            </div>
          </div>
        </div>
      </div>

      {confirmDeleteId && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-red-600 mb-4">ยืนยันการลบ</h2>
            <p className="text-gray-700 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานนี้? การลบจะไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;