import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Save, X, Search } from "lucide-react";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/api/owner/menu-types";

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    menu_type_id: null,
    type_name: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการโหลดหมวดหมู่:", error);
      toast.error("ไม่สามารถโหลดหมวดหมู่ได้");
    }
  };

  const resetForm = () => {
    setFormData({ menu_type_id: null, type_name: "" });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleAdd = async () => {
    if (!formData.type_name.trim()) {
      toast.error("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    try {
      await axios.post(API_URL, { type_name: formData.type_name.trim() });
      toast.success("เพิ่มหมวดหมู่สำเร็จ!");
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("เพิ่มหมวดหมู่ล้มเหลว:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่");
    }
  };

  const handleUpdate = async () => {
    if (!formData.type_name.trim()) {
      toast.error("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    try {
      await axios.put(`${API_URL}/${editingId}`, { type_name: formData.type_name.trim() });
      toast.success("แก้ไขหมวดหมู่สำเร็จ!");
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("แก้ไขหมวดหมู่ล้มเหลว:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่");
    }
  };

  const handleEdit = (category) => {
    setFormData({
      menu_type_id: category.menu_type_id,
      type_name: category.type_name,
    });
    setEditingId(category.menu_type_id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success("ลบหมวดหมู่สำเร็จ!");
      fetchCategories();
    } catch (error) {
      console.error("ลบหมวดหมู่ล้มเหลว:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่");
    }
    setConfirmDeleteId(null);
  };

  const filteredAndSortedCategories = categories
    .filter((category) =>
      category.type_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 p-8 border border-orange-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                จัดการหมวดหมู่อาหาร
              </h1>
              <p className="text-gray-600">
                จัดการและเพิ่มหมวดหมู่อาหารในระบบของคุณ
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setIsFormOpen(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              เพิ่มหมวดหมู่ใหม่
            </button>
          </div>
        </div>

        {/* Modal */}
        {isFormOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <div
              className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อหมวดหมู่อาหาร
                </label>
                <input
                  type="text"
                  value={formData.type_name}
                  onChange={(e) =>
                    setFormData({ ...formData, type_name: e.target.value })
                  }
                  placeholder="กรอกชื่อหมวดหมู่อาหาร..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      editingId ? handleUpdate() : handleAdd();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  disabled={!formData.type_name.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
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

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    ลำดับ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-left">
                    ชื่อหมวดหมู่
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    สร้างเมื่อ
                  </th>
                  <th className="px-6 py-4 text-white font-semibold text-center">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedCategories.map((cat, idx) => (
                  <tr
                    key={cat.menu_type_id}
                    className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4 text-center font-medium text-gray-600">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 text-lg">
                        {cat.type_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm inline-block">
                        {formatDate(cat.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.menu_type_id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedCategories.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">
                          ไม่พบหมวดหมู่อาหาร
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          ลองเปลี่ยนคำค้นหาหรือเพิ่มหมวดหมู่ใหม่
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-600">
              <span className="font-medium">ทั้งหมด:</span> {categories.length}{" "}
              หมวดหมู่
            </div>
            <div className="text-gray-600">
              <span className="font-medium">แสดงผล:</span>{" "}
              {filteredAndSortedCategories.length} หมวดหมู่
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ยืนยันการลบ
              </h2>
              <p className="text-gray-600 mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?
                การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(confirmDeleteId);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-md"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategory;