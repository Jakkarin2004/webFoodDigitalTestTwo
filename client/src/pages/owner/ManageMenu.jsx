import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, Upload } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:3000/api/owner/menu";
const API_URL_MENU_TYPE = "http://localhost:3000/api/owner/menu/menu_type";
const API_URL_IMAGE = "http://localhost:3000/uploads/food";

const ManageMenu = () => {
  const [menus, setMenus] = useState([]);
  const [menusType, setMenusType] = useState([]); // แก้จาก "" เป็น []
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

  const [formData, setFormData] = useState({
    menu_name: "",
    menu_image: "",
    price: "",
    special: false,
    detail_menu: "",
    menu_type_id: "", // ค่าเริ่มต้นเป็น ""
  });

  useEffect(() => {
    fetchMenu();
    fetchMenuType();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(API_URL);
      const menusData = Array.isArray(response.data) ? response.data : response.data.menus || [];
      setMenus(menusData);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการโหลดเมนู:", error);
      toast.error("ไม่สามารถโหลดเมนูได้");
    }
  };

  const fetchMenuType = async () => {
    try {
      const response = await axios.get(API_URL_MENU_TYPE);
      const menuTypesData = Array.isArray(response.data) ? response.data : response.data.menus || [];
      setMenusType(menuTypesData);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการโหลดหมวดหมู่:", error);
      toast.error("ไม่สามารถโหลดประเภทเมนูได้");
    }
  };

  const resetForm = () => {
    setFormData({
      menu_name: "",
      menu_image: "",
      price: "",
      special: false,
      detail_menu: "",
      menu_type_id: "", // แก้จาก 1 เป็น ""
    });
    setEditingMenu(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.menu_name || !formData.price) {
      toast.error("กรุณากรอกชื่อเมนูและราคา");
      return;
    }

    if (!formData.menu_type_id) {
      toast.error("กรุณาเลือกประเภทเมนู");
      return;
    }

    const menuTypeId = parseInt(formData.menu_type_id, 10);
    if (isNaN(menuTypeId)) {
      toast.error("กรุณาเลือกประเภทเมนูที่ถูกต้อง");
      return;
    }

    const form = new FormData();
    form.append("menu_name", formData.menu_name.trim());
    form.append("price", parseFloat(formData.price).toString());
    form.append("special", formData.special ? "1" : "0");
    form.append("detail_menu", formData.detail_menu?.trim() || "ไม่มีรายละเอียด");
    form.append("menu_type_id", menuTypeId.toString());

    if (formData.menu_image_file instanceof File) {
      form.append("menu_image", formData.menu_image_file);
    }

    if (editingMenu && editingMenu.menu_image) {
      form.append("oldImage", editingMenu.menu_image);
    }

    try {
      if (editingMenu) {
        await axios.put(`${API_URL}/${editingMenu.menu_id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("แก้ไขเมนูสำเร็จ!");
      } else {
        await axios.post(API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("เพิ่มเมนูสำเร็จ!");
      }
      fetchMenu();
      resetForm();
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกเมนู:", error.response?.data || error.message);
      toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกเมนู");
    }
  };

  const handleEdit = (menu) => {
    setFormData({
      menu_name: menu.menu_name,
      menu_image: menu.menu_image,
      menu_image_file: menu.menu_image,
      price: menu.price.toString(),
      special: menu.special === 1,
      detail_menu: menu.detail_menu || "",
      menu_type_id: menu.menu_type_id.toString(),
    });
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleDelete = async (menuId) => {
    try {
      await axios.delete(`${API_URL}/${menuId}`);
      setMenus(menus.filter((menu) => menu.menu_id !== menuId));
      toast.success("ลบเมนูสำเร็จ!");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการลบเมนู:", error);
      toast.error(error.response?.data?.error || "เกิดข้อผิดพลาดในการลบเมนู");
    }
    setShowDeleteModal(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        menu_image_file: e.target.files[0],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                จัดการเมนูอาหาร
              </h1>
              <p className="text-gray-600">เพิ่ม แก้ไข และลบเมนูอาหารในร้าน</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              เพิ่มเมนูใหม่
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingMenu ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อเมนู *
                    </label>
                    <input
                      type="text"
                      value={formData.menu_name}
                      onChange={(e) =>
                        setFormData({ ...formData, menu_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="กรอกชื่อเมนู"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ราคา (บาท) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || parseFloat(value) >= 0) {
                          setFormData({ ...formData, price: value });
                        } else {
                          toast.error("ราคาต้องมากกว่าหรือเท่ากับ 0");
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ประเภทเมนู *
                  </label>
                  <select
                    value={formData.menu_type_id === undefined || formData.menu_type_id === null ? "" : formData.menu_type_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        menu_type_id: value === "" ? "" : parseInt(value, 10),
                      });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="" disabled>
                      เลือกประเภทเมนู
                    </option>
                    {menusType.map((type) => (
                      <option key={type.menu_type_id} value={type.menu_type_id}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รูปภาพเมนู
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="bg-orange-100 hover:bg-orange-200 text-orange-600 px-4 py-3 rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
                      <Upload size={18} />
                      อัพโหลด
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {formData.menu_image_file && (
                      <div className="text-sm text-gray-700">
                        {typeof formData.menu_image_file === "string" ? (
                          <>ชื่อไฟล์เดิม: {formData.menu_image_file}</>
                        ) : (
                          <>
                            ชื่อไฟล์ใหม่: {formData.menu_image_file.name} (
                            {(formData.menu_image_file.size / 1024).toFixed(2)}{" "}
                            KB)
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    รายละเอียดเมนู
                  </label>
                  <textarea
                    value={formData.detail_menu}
                    onChange={(e) =>
                      setFormData({ ...formData, detail_menu: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="รายละเอียดของเมนู เช่น วัตถุดิบ รสชาติ..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      สถานะเมนู
                    </label>
                    <select
                      name="special"
                      value={formData.special ? "1" : "0"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          special: e.target.value === "1",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="1">พร้อมเสิร์ฟ</option>
                      <option value="0">ไม่พร้อมเสิร์ฟ</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {editingMenu ? "บันทึกการแก้ไข" : "เพิ่มเมนู"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-xl font-bold text-white">
              รายการเมนูทั้งหมด ({menus.length} เมนู)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ชื่อเมนู
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ประเภท
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ราคา
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    สถานะ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    รายละเอียด
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menus.map((menu, index) => (
                  <tr
                    key={menu.menu_id}
                    className={`hover:bg-orange-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden">
                          {menu.menu_image ? (
                            <img
                              src={`${API_URL_IMAGE}/${menu.menu_image}`}
                              alt={menu.menu_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-lg">
                                {menu.menu_name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-gray-800">{menu.menu_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {menusType.find((type) => type.menu_type_id === menu.menu_type_id)?.type_name || "ไม่ระบุ"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-orange-600">
                        {typeof menu.price === "number"
                          ? menu.price.toFixed(2)
                          : parseFloat(menu.price).toFixed(2)}{" "}
                        ฿
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {menu.special === 1 ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 border border-orange-200">
                          พร้อมเสิร์ฟ
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          ไม่พร้อมเสิร์ฟ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p
                        className="text-sm text-gray-600 max-w-xs truncate"
                        title={menu.detail_menu}
                      >
                        {menu.detail_menu || "ไม่มีรายละเอียด"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(menu)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-md transform hover:scale-105"
                          title="แก้ไข"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setMenuToDelete(menu.menu_id);
                            setShowDeleteModal(true);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-md transform hover:scale-105"
                          title="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {menus.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-gray-500 text-lg">ยังไม่มีเมนูในระบบ</p>
              <p className="text-gray-400">เริ่มต้นโดยการเพิ่มเมนูแรกของคุณ</p>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                ยืนยันการลบเมนู
              </h2>
              <p className="text-gray-600 mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(menuToDelete);
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold"
                >
                  ลบเมนู
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMenu;