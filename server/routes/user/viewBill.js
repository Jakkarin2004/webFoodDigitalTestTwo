const express = require("express");
const router = express.Router();
const db = require("../../config/db");

// ดึงบิลจาก temp_receipts
router.get("/:order_code", async (req, res) => {
  const { order_code } = req.params;

  try {
    //ดึง header จาก temp_receipts
    const [tempBills] = await db
      .promise()
      .query(`SELECT * FROM temp_receipts WHERE temp_receipt_code = ?`, [
        order_code,
      ]);

    if (!tempBills.length) {
      return res.status(404).json({ message: "ไม่พบบิลนี้" });
    }

    const tempBill = tempBills[0];

    //ดึง orders ทั้งหมดที่ order_code = temp_receipt_code
    const [orders] = await db
      .promise()
      .query(`SELECT * FROM orders WHERE order_code = ?`, [order_code]);

    if (!orders.length) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อที่เกี่ยวข้อง" });
    }

    //ดึงรายการอาหารของแต่ละ order
    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const [items] = await db.promise().query(
          `SELECT 
             oi.item_id,
             oi.menu_id,
             m.menu_name,
             oi.quantity,
             oi.price,
             oi.note,
             oi.specialRequest,
             (oi.quantity * oi.price) AS subtotal
           FROM order_items oi
           JOIN menu m ON oi.menu_id = m.menu_id
           WHERE oi.order_id = ?
           ORDER BY oi.item_id`,
          [order.order_id]
        );

        return {
          order_id: order.order_id,
          status: order.status,
          table_number: order.table_number,
          total_price: order.total_price,
          order_time: order.order_time,
          items,
        };
      })
    );

    res.json({
      success: true,
      temp_receipt: tempBill,
      orders: orderDetails,
    });
  } catch (err) {
    console.error("❌ ดึงข้อมูลบิลล้มเหลว:", err);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงบิล",
    });
  }
});

//อัปเดตสถานะยกเลิก (เหมือนเดิม)
router.put("/cancel-order/:order_code", async (req, res) => {
  const { order_code } = req.params;
  const { status } = req.body;

  try {
    const [result] = await db
      .promise()
      .query(`UPDATE orders SET status = ? WHERE order_code = ?`, [
        status,
        order_code,
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อนี้" });
    }

    //ดึง order_id ทั้งหมดที่เกี่ยวข้อง
    const [rows] = await db
      .promise()
      .query(`SELECT order_id FROM orders WHERE order_code = ?`, [
        order_code,
      ]);

    const orderIds = rows.map((r) => r.order_id);

    const io = req.app.get("io");
    if (io) {
      const { getTodayCount } = require("../owner/getTodayCount");
      const count = await getTodayCount();

      //emit สำหรับทุก order_id
      orderIds.forEach((orderId) => {
        io.emit("order_status_updated", { orderId, status });
      });

      io.emit("orderCountUpdated", { count });
    }

    res.json({ message: "ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถยกเลิกคำสั่งซื้อได้" });
  }
});

module.exports = router;
