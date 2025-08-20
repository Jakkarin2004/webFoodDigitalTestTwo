const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { verifyToken, isOwner } = require("../../middleware/auth");

// Middleware ตรวจสอบ token และสิทธิ์เจ้าของร้าน
router.use(verifyToken, isOwner);



// อออเดอร์ทั้งหมด
// router.get("/all", verifyToken, isOwner, async (req, res) => {
//   try {
//     const [rows] = await db.promise().query("SELECT * FROM orders"); // หรือคำสั่ง SQL ที่คุณใช้
//     res.json({ orders: rows });
//   } catch (error) {
//     console.error("🔥 เกิดข้อผิดพลาดใน backend:", error);
//     res.status(500).json({ message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์" });
//   }
// });


// // ออเดอร์เฉพาะของ "วันนี้"
// router.get("/all", verifyToken, isOwner, async (req, res) => {
//   try {
//     const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });

//     const [rows] = await db.promise().query(
//       `SELECT * FROM orders 
//        WHERE DATE(order_time) = ?`,
//       [today]
//     );

//     res.json({ orders: rows });
//   } catch (error) {
//     console.error("🔥 เกิดข้อผิดพลาดใน backend:", error);
//     res.status(500).json({ message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์" });
//   }
// });

router.get("/table/:tableNumber", verifyToken, async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });
    const tableNumber = req.params.tableNumber;

    const [rows] = await db.promise().query(
      `SELECT * FROM orders 
       WHERE DATE(order_time) = ? AND table_number = ?`,
      [today, tableNumber]
    );

    res.json({ orders: rows });
  } catch (error) {
    console.error("🔥 เกิดข้อผิดพลาดใน backend:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์" });
  }
});


// router.get("/by-table/:table_number", async (req, res) => {
//   const tableNumber = req.params.table_number;
//   try {
//     const [orders] = await db.promise().query(
//       `SELECT * FROM orders WHERE table_number = ? ORDER BY created_at DESC`,
//       [tableNumber]
//     );
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });


router.get('/count', verifyToken, isOwner, async (req, res) => {
  try {
    // วันที่ปัจจุบันในรูปแบบ YYYY-MM-DD (Asia/Bangkok)
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Bangkok' });

    // ดึงจำนวนออเดอร์ที่ยังไม่ completed หรือ cancelled
    const [rows] = await db.promise().query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE DATE(CONVERT_TZ(order_time, '+00:00', '+07:00')) = ?
        AND status NOT IN ('completed', 'cancelled')
    `, [today]);

    const count = rows?.[0]?.count ?? 0;

    // ส่ง event แจ้ง client ผ่าน socket.io (ถ้ามี)
    const io = req.app.get("io");
    if (io) {
      io.emit("orderCountUpdated", { count });
    }

    // ส่ง response กลับ client
    return res.json({ count });
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
    return res.status(500).json({ message: 'ไม่สามารถดึงจำนวนออเดอร์วันนี้ได้' });
  }
});


// คำนวนราคาในวันนี้
router.get("/today-revenue", verifyToken, isOwner, async (req, res) => {
  try {
    // เวลาแบบไทย Format YYYY-MM-DD
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




router.get("/:orderId", verifyToken, isOwner, async (req, res) => {
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



//2. เปลี่ยนสถานะคำสั่งซื้อ

router.put("/:orderId/status", verifyToken, isOwner, async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  try {
    const [result] = await db.promise().query(
      "UPDATE orders SET status = ? WHERE order_id = ?",
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบ order นี้" });
    }

    res.json({ message: "อัปเดตสถานะสำเร็จ" });
  } catch (err) {
    console.error("❌ อัปเดตสถานะล้มเหลว:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// แสดงยอดขายวันเดียว
// routes/owner/stats.js

module.exports = router;