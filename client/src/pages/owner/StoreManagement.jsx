import React, { useState, useEffect } from "react";
import { Save, Edit2, Store, Phone, MapPin, FileText, Image, Camera, X, Check, Clock, Loader2 } from "lucide-react";
import { DateTime } from "luxon";
//เอาไว้ทำ modal
import toast from "react-hot-toast";

const StoreManagement = () => {
    const [storeData, setStoreData] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const dayNames = {
        monday: "จันทร์",
        tuesday: "อังคาร", 
        wednesday: "พุธ",
        thursday: "พฤหัสบดี",
        friday: "ศุกร์",
        saturday: "เสาร์",
        sunday: "อาทิตย์"
    };

    // Fetch store data from API
    const fetchStoreData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch('http://localhost:3000/api/owner/store');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setStoreData(data);
            setFormData({ 
                ...data,
                // Clear any file references from previous edits
                image_file: null,
                hasNewImage: false
            });
        } catch (error) {
            console.error('Error fetching store data:', error);
            setError('ไม่สามารถโหลดข้อมูลร้านได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchStoreData();
    }, []);

    useEffect(() => {
        if (storeData) {
            setFormData({ 
                ...storeData,
                image_file: null,
                hasNewImage: false
            });
        }
    }, [storeData]);

    useEffect(() => {
        if (storeData) {
            // Create comparison objects without file-related properties
            const currentData = { ...formData };
            delete currentData.image_file;
            delete currentData.hasNewImage;
            
            const originalData = { ...storeData };
            
            const hasChanged = JSON.stringify(currentData) !== JSON.stringify(originalData) || formData.hasNewImage;
            setIsDirty(hasChanged);
        }
    }, [formData, storeData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOperatingHoursChange = (day, field, value) => {
        setFormData(prev => ({
            ...prev,
            operating_hours: {
                ...prev.operating_hours,
                [day]: {
                    ...prev.operating_hours[day],
                    [field]: value
                }
            }
        }));
    };

   const getCurrentStatus = () => {
    if (!storeData) return "กำลังโหลด...";

    // ใช้เวลาประเทศไทย
    const now = DateTime.now().setZone("Asia/Bangkok");
    const currentDay = now.toFormat("cccc").toLowerCase(); // เช่น "monday"
    const currentTimeMinutes = now.hour * 60 + now.minute;

    const todayHours = storeData.operating_hours?.[currentDay];
    if (!todayHours || !todayHours.is_open) return "ปิดร้าน";

    const [openHour, openMinute] = todayHours.open_time.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.close_time.split(":").map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    if (currentTimeMinutes >= openMinutes && currentTimeMinutes <= closeMinutes) {
        return "เปิดร้าน";
    }
    return "ปิดร้าน";
};


const handleSave = async () => {
    if (!formData.store_name?.trim()) {
        toast.success("กรุณากรอกชื่อร้าน");
        return;
    }

    try {
        setIsSaving(true);
        setError(null);

        const formDataToSend = new FormData();
        formDataToSend.append('store_name', formData.store_name);
        formDataToSend.append('address', formData.address || '');
        formDataToSend.append('phone_number', formData.phone_number || '');
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('operating_hours', JSON.stringify(formData.operating_hours || {}));

        if (formData.hasNewImage && formData.image_file) {
            formDataToSend.append('image_res', formData.image_file);

            // ✅ เปลี่ยนจาก old_image → oldImage ให้ตรง backend
            if (storeData.image_res && !storeData.image_res.startsWith('data:')) {
                formDataToSend.append('oldImage', storeData.image_res);
            }
        } else if (formData.image_res && !formData.image_res.startsWith('data:')) {
            formDataToSend.append('image_res', formData.image_res);
        }

        const response = await fetch(`http://localhost:3000/api/owner/store/${storeData.id}`, {
            method: 'PUT',
            body: formDataToSend
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        await fetchStoreData(); // โหลดข้อมูลใหม่หลังบันทึก

        setIsEditing(false);
        setIsDirty(false);
        toast.success("บันทึกข้อมูลสำเร็จ");
    } catch (error) {
        console.error("Error saving store:", error);
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
        setIsSaving(false);
    }
};


    const handleCancel = () => {
        setFormData({ 
            ...storeData,
            image_file: null,
            hasNewImage: false
        });
        setIsEditing(false);
        setIsDirty(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
                return;
            }
            
            // Store the file for upload and mark as having new image
            setFormData(prev => ({
                ...prev,
                image_file: file,
                hasNewImage: true
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setFormData(prev => ({
                    ...prev,
                    image_res: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRetry = () => {
        fetchStoreData();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">กำลังโหลดข้อมูล...</h2>
                        <p className="text-gray-500">กรุณารอสักครู่</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !storeData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-red-500 mb-4">
                            <X className="mx-auto h-12 w-12" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">เกิดข้อผิดพลาด</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                        >
                            ลองใหม่อีกครั้ง
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main component render
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <X className="h-5 w-5 text-red-500" />
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl mb-6 p-6 border-l-4 border-orange-500">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                โปรไฟล์ร้านอาหารป้าอ้อ
                            </h1>
                            <p className="text-gray-600">จัดการข้อมูลเกี่ยวกับร้านอาหาร</p>
                        </div>
                        <div className="flex gap-3">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!isDirty || isSaving}
                                        className={`px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 ${
                                            isDirty && !isSaving
                                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSaving ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <Save size={20} />
                                        )}
                                        {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
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
                    {/* Store Image Section */}
                    <div className="relative h-64 bg-gradient-to-r from-orange-400 to-orange-500 overflow-hidden">
                        {formData.image_res ? (
                            <img
                                src={formData.image_res.startsWith('data:') ? formData.image_res : `http://localhost:3000/uploads/store/${formData.image_res}`}
                                alt={formData.store_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Store size={48} className="mx-auto mb-2 opacity-80" />
                                    <p className="text-lg font-semibold">ไม่มีรูปภาพร้าน</p>
                                </div>
                            </div>
                        )}
                        
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <label className="cursor-pointer bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-white transition-all flex items-center gap-2 shadow-lg">
                                    <Camera size={20} />
                                    {formData.hasNewImage ? 'เปลี่ยนรูปภาพอีกครั้ง' : 'เปลี่ยนรูปภาพ'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Store Info Section */}
                    <div className="p-8">
                        <div className="space-y-8">
                            {/* Store Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    ชื่อร้าน *
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.store_name || ''}
                                        onChange={(e) => handleInputChange('store_name', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg font-semibold"
                                        placeholder="ชื่อร้านของคุณ"
                                        required
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                                            <Store size={24} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {storeData.store_name}
                                            </h2>
                                            {/* <p className="text-sm text-gray-500">ID: {storeData.id}</p> */}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    คำอธิบายร้าน
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                                        placeholder="เล่าเรื่องราวของร้านคุณ..."
                                        rows="4"
                                        maxLength="255"
                                    />
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-xl border">
                                        <div className="flex items-start gap-3">
                                            <FileText size={20} className="text-gray-600 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-gray-700 leading-relaxed">
                                                    {storeData.description || 'ยังไม่มีคำอธิบายร้าน'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        ที่อยู่
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.address || ''}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="ที่อยู่ร้านของคุณ"
                                            maxLength="50"
                                        />
                                    ) : (
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={20} className="text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="text-blue-600 leading-relaxed">
                                                        {storeData.address || 'ยังไม่ระบุที่อยู่'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        เบอร์โทรศัพท์
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone_number || ''}
                                            onChange={(e) => handleInputChange('phone_number', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            placeholder="เบอร์โทรศัพท์"
                                            maxLength="10"
                                        />
                                    ) : (
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                            <div className="flex items-center gap-3">
                                                <Phone size={20} className="text-green-600" />
                                                <div>
                                                    <p className="text-green-600 font-semibold">
                                                        {storeData.phone_number || 'ยังไม่ระบุเบอร์โทร'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Operating Hours */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    เวลาเปิด-ปิดร้าน
                                </label>
                                {isEditing ? (
                                    <div className="bg-gray-50 p-6 rounded-xl border">
                                        <div className="space-y-4">
                                            {Object.entries(dayNames).map(([day, dayName]) => (
                                                <div key={day} className="flex items-center gap-4">
                                                    <div className="w-16 text-sm font-medium text-gray-700">
                                                        {dayName}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.operating_hours?.[day]?.is_open || false}
                                                            onChange={(e) => handleOperatingHoursChange(day, 'is_open', e.target.checked)}
                                                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                                        />
                                                        <span className="text-sm text-gray-600">เปิด</span>
                                                    </div>
                                                    {formData.operating_hours?.[day]?.is_open && (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                value={formData.operating_hours[day].open_time || ''}
                                                                onChange={(e) => handleOperatingHoursChange(day, 'open_time', e.target.value)}
                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                            />
                                                            <span className="text-gray-500">-</span>
                                                            <input
                                                                type="time"
                                                                value={formData.operating_hours[day].close_time || ''}
                                                                onChange={(e) => handleOperatingHoursChange(day, 'close_time', e.target.value)}
                                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                                        <div className="flex items-start gap-3">
                                            <Clock size={20} className="text-purple-600 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                    {Object.entries(dayNames).map(([day, dayName]) => {
                                                        const hours = storeData.operating_hours?.[day];
                                                        return (
                                                            <div key={day} className="flex justify-between items-center">
                                                                <span className="font-medium text-purple-700">{dayName}:</span>
                                                                <span className="text-purple-600">
                                                                    {hours?.is_open 
                                                                        ? `${hours.open_time} - ${hours.close_time}`
                                                                        : 'ปิด'
                                                                    }
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps */}
                            <div className="pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div>
                                        <p className="font-semibold">วันที่สร้าง:</p>
                                        <p>{new Date(storeData.created_at).toLocaleString('th-TH')}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">อัปเดตล่าสุด:</p>
                                        <p>{new Date(storeData.updated_at).toLocaleString('th-TH')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600">สถานะปัจจุบัน</p>
                                <p className={`text-lg font-bold ${getCurrentStatus() === 'เปิดร้าน' ? 'text-green-600' : 'text-red-600'}`}>
                                    {getCurrentStatus()}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${getCurrentStatus() === 'เปิดร้าน' ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Clock size={24} className={getCurrentStatus() === 'เปิดร้าน' ? 'text-green-600' : 'text-red-600'} />
                            </div>
                        </div>
                    </div>
                    {/* <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-600">มีรูปภาพร้าน</p>
                                <p className="text-lg font-bold text-blue-600">
                                    {storeData.image_res ? 'มี' : 'ไม่มี'}
                                </p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-xl">
                                <Image size={24} className="text-blue-600" />
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default StoreManagement;