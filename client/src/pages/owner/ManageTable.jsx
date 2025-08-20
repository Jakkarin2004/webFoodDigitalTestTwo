import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  QrCode,
  Table,
  Download,
  Eye,
} from "lucide-react";
import axios from "axios";

//เอาไว้ทำ modal
import toast from "react-hot-toast";

const API_URL_TEBLE = "http://localhost:3000/api/owner/tables";

const ManageTable = () => {
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  //ยืนยันลบ
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);
  useEffect(() => {
    console.log("🔥 ตารางที่โหลดมา:", tables);
  }, [tables]);
  const fetchTables = async () => {
    try {
      // เรียก API จริงด้วย axios
      const response = await axios.get(`${API_URL_TEBLE}`);
      // สมมติ API ตอบ JSON array ของโต๊ะตรง ๆ
      setTables(response.data);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการโหลดข้อมูลโต๊ะ:", error);
    }
  };
  const [formData, setFormData] = useState({
    table_number: "",
    table_name: "",
  });

  const resetForm = () => {
    setFormData({
      table_number: "",
      table_name: "",
    });
    setEditingTable(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.table_number) {
      toast.error("กรุณากรอกหมายเลขโต๊ะ");
      return;
    }

    try {
      if (editingTable) {
        // Update existing table ผ่าน API
        const updatedTable = {
          table_number: formData.table_number,
          table_name: formData.table_name,
        };
        await axios.put(
          `${API_URL_TEBLE}/${editingTable.table_id}`,
          updatedTable
        );
        // อัปเดต state หลังจาก update สำเร็จ
        setTables(
          tables.map((table) =>
            table.table_id === editingTable.table_id
              ? { ...table, ...updatedTable }
              : table
          )
        );
      } else {
        // เพิ่มโต๊ะใหม่ผ่าน API
        const newTablePayload = {
          table_number: formData.table_number,
          table_name: formData.table_name,
        };
        const response = await axios.post(`${API_URL_TEBLE}`, newTablePayload);
        const newTableFromServer = response.data; // สมมติ API ส่งข้อมูลโต๊ะกลับมา

        // อัปเดต state เพิ่มข้อมูลใหม่
        setTables([...tables, newTableFromServer]);
      }

      resetForm();
      toast.success(editingTable ? "แก้ไขโต๊ะสำเร็จ" : "เพิ่มโต๊ะใหม่สำเร็จ");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูลโต๊ะ:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลโต๊ะ");
    }
  };

  const handleEdit = (table) => {
    setFormData({
      table_number: table.table_number,
      table_name: table.table_name || "",
    });
    setEditingTable(table);
    setShowForm(true);
  };

  const confirmDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL_TEBLE}/${confirmDeleteId}`);
      setTables((prev) =>
        prev.filter((table) => table.table_id !== confirmDeleteId)
      );
      toast.success("ลบโต๊ะสำเร็จ!");
      setConfirmDeleteId(null); // ปิด modal หลังลบ
    } catch (err) {
      console.error("❌ เกิดข้อผิดพลาดในการลบโต๊ะ:", err);
      toast.error("ไม่สามารถลบโต๊ะได้");
    }
  };

  const handleGenerateQR = (table) => {
    setSelectedTable(table);
    setShowQRModal(true);
  };

  const handleDownloadQR = (table) => {
    // Simulate QR code download
    toast(
      `ดาวน์โหลด QR Code สำหรับ ${table.table_name || table.table_number}`,
      {
        duration: 6000,
      }
    );
  };

  const generateQRCodeData = (table) => {
    return `https://restaurant.com/order?table=${table.table_number}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="max-w-8xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                จัดการโต๊ะและ QR Code
              </h1>
              <p className="text-gray-600">
                เพิ่ม แก้ไข และสร้าง QR Code สำหรับโต๊ะในร้าน
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={20} />
              เพิ่มโต๊ะใหม่
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingTable ? "แก้ไขข้อมูลโต๊ะ" : "เพิ่มโต๊ะใหม่"}
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
                      หมายเลขโต๊ะ *
                    </label>
                    <input
                      type="text"
                      value={formData.table_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          table_number: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="เช่น T001, VIP01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อโต๊ะ
                    </label>
                    <input
                      type="text"
                      value={formData.table_name}
                      onChange={(e) =>
                        setFormData({ ...formData, table_name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="เช่น โต๊ะหน้าร้าน, โต๊ะ VIP"
                    />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode size={20} className="text-orange-600" />
                    <span className="font-semibold text-orange-800">
                      QR Code
                    </span>
                  </div>
                  <p className="text-sm text-orange-700">
                    QR Code จะถูกสร้างอัตโนมัติเมื่อบันทึกโต๊ะใหม่
                    ลูกค้าสามารถสแกนเพื่อสั่งอาหารได้
                  </p>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {editingTable ? "บันทึกการแก้ไข" : "เพิ่มโต๊ะ"}
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

        {/* QR Code Modal */}
        {showQRModal && selectedTable && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">QR Code</h2>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 text-center">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedTable.table_name || selectedTable.table_number}
                  </h3>
                  <p className="text-sm text-gray-600">
                    หมายเลข: {selectedTable.table_number}
                  </p>
                </div>

                {/* QR Code Placeholder */}
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6">
                  <div className="w-48 h-48 mx-auto bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <img
                        src={`http://localhost:3000/uploads/qrcode/${selectedTable?.qrcode_image}`}
                        alt={`QR Code โต๊ะ ${selectedTable?.table_number}`}
                        width={150}
                        height={150}
                        className="mx-auto mb-2"
                      />

                      {/* <p className="text-xs text-gray-500">QR Code Preview</p> */}
                      <p className="text-xs text-gray-400 mt-1">
                        {generateQRCodeData(selectedTable)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadQR(selectedTable)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    ดาวน์โหลด
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
            <h2 className="text-xl font-bold text-white">
              รายการโต๊ะทั้งหมด ({tables.length} โต๊ะ)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    หมายเลขโต๊ะ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ชื่อโต๊ะ
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    วันที่สร้าง
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    QR Code
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tables.map((table, index) => (
                  <tr
                    key={`${table.table_id}-${index}`} // ✅ ป้องกัน key ซ้ำ
                    className={`hover:bg-orange-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                          <Table size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-gray-800">
                            {table.table_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {table.table_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">
                        {table.table_name || "-"}
                      </p>
                    </td>
                   
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(table.created_at).toLocaleString("th-TH", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                     <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-200">
                          <button onClick={() => handleGenerateQR(table)}>
                            <Eye size={16} />
                          </button>
                        </span>
                      </div>
                    </td> 

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* <button
                                                    onClick={() => handleEdit(table)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-md transform hover:scale-105"
                                                    title="แก้ไข"
                                                >
                                                    <Edit2 size={16} />
                                                </button> */}
                        <button
                          onClick={() => confirmDelete(table.table_id)}
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

          {tables.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🪑</div>
              <p className="text-gray-500 text-lg">ยังไม่มีโต๊ะในระบบ</p>
              <p className="text-gray-400">เริ่มต้นโดยการเพิ่มโต๊ะแรกของคุณ</p>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  โต๊ะทั้งหมด
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {tables.length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Table size={24} className="text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  QR Code ที่สร้างแล้ว
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {tables.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <QrCode size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600">โต๊ะที่ใช้งานได้</p>
                                <p className="text-3xl font-bold text-gray-800">{tables.length}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Save size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div> */}
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
                onClick={handleConfirmDelete}
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

export default ManageTable;
