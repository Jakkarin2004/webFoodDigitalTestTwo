const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { verifyToken } = require("../../middleware/auth");

// Middleware ตรวจสอบ token และสิทธิ์เจ้าของร้าน
router.use(verifyToken);
const { getTodayRevenue } = require("../owner/getTodayRevenue"); // สร้างไฟล์ช่วยดึงยอดขาย (ดูตัวอย่างด้านล่าง)
const { getTodayCount } = require("../owner/getTodayCount");


// ออเดอร์เฉพาะของ "วันนี้"
router.get("/all", verifyToken, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });

    const [rows] = await db.promise().query(
      `SELECT * FROM orders 
       WHERE DATE(order_time) = ?`,
      [today]
    );

    res.json({ orders: rows });
  } catch (error) {
    console.error("🔥 เกิดข้อผิดพลาดใน backend:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์" });
  }
});


router.get('/count', verifyToken, async (req, res) => {
  try {
    const count = await getTodayCount();

    const io = req.app.get("io");
    if (io) {
      io.emit("orderCountUpdated", { count });
    }

    return res.json({ count });
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    return res.status(500).json({ message: 'ไม่สามารถดึงจำนวนออเดอร์วันนี้ได้' });
  }
});




// คำนวณยอดขายวันนี้
router.get("/today-revenue", async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });

    const [result] = await db.promise().query(
      `SELECT 
        COALESCE(SUM(total_price), 0) AS totalRevenue,
        COUNT(*) AS totalOrders
      FROM orders
      WHERE DATE(order_time) = ?
        AND status = 'completed'`,
      [today]
    );

    res.json({
      totalRevenue: parseFloat(result[0].totalRevenue) || 0,
      totalOrders: result[0].totalOrders,
      date: new Date().toLocaleDateString("th-TH"),
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({
      message: "ดึงยอดขายวันนี้ล้มเหลว",
      error: err.message,
    });
  }
});


router.get("/:orderId", verifyToken, async (req, res) => {
  const orderId = req.params.orderId;
  
  // console.log("🔍 กำลังดึงข้อมูลออเดอร์:", orderId);
  
  if (!orderId || isNaN(orderId)) {
    return res.status(400).json({ 
      message: "รหัสออเดอร์ไม่ถูกต้อง",
      success: false 
    });
  }

  try {
    // ใช้ LEFT JOIN เพื่อให้แสดงข้อมูลแม้ว่าไม่มี menu
    const [results] = await db.promise().query(
      `SELECT 
         oi.item_id,
         oi.order_id,
         oi.menu_id,
         COALESCE(m.menu_name, 'ไม่พบชื่อเมนู') as menu_name,
         oi.quantity,
         oi.note,
         oi.specialRequest,
         oi.price,
         (oi.quantity * oi.price) as subtotal
       FROM order_items oi
       LEFT JOIN menu m ON oi.menu_id = m.menu_id
       WHERE oi.order_id = ?
       ORDER BY oi.item_id`,
      [orderId]
    );

    // console.log("✅ ผลลัพธ์การ query:", results);

    if (results.length === 0) {
      return res.status(404).json({ 
        message: "ไม่พบรายการสินค้าในออเดอร์นี้",
        success: false 
      });
    }

    res.json({ 
      success: true,
      items: results,
      orderId: parseInt(orderId),
      totalItems: results.length
    });

  } catch (error) {
    console.error("🔥 เกิดข้อผิดพลาดใน backend (orderId):", error);
    res.status(500).json({ 
      message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์",
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



// router.put("/:orderId/status", verifyToken,  async (req, res) => {
//   const orderId = req.params.orderId;
//   const { status } = req.body;

//   try {
//     const [result] = await db.promise().query(
//       "UPDATE orders SET status = ? WHERE order_id = ?",
//       [status, orderId]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "ไม่พบ order นี้" });
//     }

//     const io = req.app.get("io");
//     if (io) {
//       // ดึงยอดขายวันนี้ล่าสุด
//       const revenueData = await getTodayRevenue();
//       io.emit("today_revenue_updated", revenueData);

//       // ดึงจำนวนออเดอร์ที่ยังไม่เสร็จ
//       const count = await getTodayCount();
//       io.emit("orderCountUpdated", { count });
//     }

//     res.json({ message: "อัปเดตสถานะสำเร็จ" });
//   } catch (err) {
//     console.error("❌ อัปเดตสถานะล้มเหลว:", err);
//     res.status(500).json({ message: "เกิดข้อผิดพลาด" });
//   }
// });

router.put("/:orderId/status", verifyToken, async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "กรุณาระบุสถานะ" });
  }

  try {
    const [result] = await db.promise().query(
      "UPDATE orders SET status = ? WHERE order_id = ?",
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบ order นี้" });
    }

    const io = req.app.get("io");

    if (io) {
      try {
        // ✅ ส่ง event แบบ global (ทุก client ได้)
        io.emit("order_status_updated", { orderId, status });

        // ✅ ถ้าคุณใช้ room แยก staff / owner — ใช้แบบนี้แทน
        // io.to("staff-room").emit("order_status_updated", { orderId, status });
        // io.to("owner-room").emit("order_status_updated", { orderId, status });

        // 🔄 ยอดขายวันนี้ (optional)
        const revenueData = await getTodayRevenue();
        io.emit("today_revenue_updated", revenueData);

        // 🔢 จำนวน order ที่ยังไม่เสร็จ
        const count = await getTodayCount();
        io.emit("orderCountUpdated", { count });

      } catch (ioErr) {
        console.error("❌ ส่งข้อมูล realtime ล้มเหลว:", ioErr);
      }
    }

    // ✅ ส่งข้อมูลกลับ client
    res.json({
      message: "อัปเดตสถานะสำเร็จ",
      orderId,
      status,
      success: true
    });

  } catch (err) {
    console.error("❌ อัปเดตสถานะล้มเหลว:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์", success: false });
  }
});


module.exports = router;
