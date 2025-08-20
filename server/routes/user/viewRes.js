const express = require("express");
const router = express.Router();
const db = require("../../config/db");

// ดึงข้อมูลร้านทั้งหมด
router.get("/stores", (req, res) => {
  const sql = `
    SELECT 
      id, 
      store_name, 
      image_res, 
      address, 
      phone_number, 
      description, 
      operating_hours,
      created_at,
      updated_at
    FROM store
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching stores:", err);
      return res.status(500).json({ 
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า"
      });
    }

    // แปลง operating_hours จาก JSON string เป็น object
    const stores = results.map(store => {
      try {
        store.operating_hours = store.operating_hours 
          ? JSON.parse(store.operating_hours) 
          : {};
      } catch (e) {
        console.error("Error parsing operating hours:", e);
        store.operating_hours = {};
      }
      return store;
    });

    res.json({
      success: true,
      data: stores
    });
  });
});

// ดึงข้อมูลร้านเดียวโดย ID
router.get("/:id", (req, res) => {
  const storeId = req.params.id;
  const sql = `
    SELECT 
      id, 
      store_name, 
      image_res, 
      address, 
      phone_number, 
      description, 
      operating_hours,
      created_at,
      updated_at
    FROM store
    WHERE id = ?
  `;
  
  db.query(sql, [storeId], (err, results) => {
    if (err) {
      console.error("Error fetching store:", err);
      return res.status(500).json({ 
        success: false,
        message: "เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบร้านค้า"
      });
    }

    const store = results[0];
    try {
      store.operating_hours = store.operating_hours 
        ? JSON.parse(store.operating_hours) 
        : {};
    } catch (e) {
      console.error("Error parsing operating hours:", e);
      store.operating_hours = {};
    }

    res.json({
      success: true,
      data: store
    });
  });
});

module.exports = router;