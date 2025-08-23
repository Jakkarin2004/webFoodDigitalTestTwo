const express = require("express");
const router = express.Router();
const db = require("../../config/db");

// ดึงบิลจาก temp_receipts
router.get("/:order_code", async (req, res) => {
  const { order_code } = req.params;

  try {
    const [tempBills] = await db
      .promise()
      .query(`SELECT * FROM temp_receipts WHERE temp_receipt_code = ?`, [order_code]);

    if (!tempBills.length) {
      return res.status(404).json({ message: "ไม่พบบิลนี้" });
    }

    const tempBill = tempBills[0];

    const [orders] = await db
      .promise()
      .query(`SELECT * FROM orders WHERE order_code = ?`, [order_code]);

    if (!orders.length) {
      return res.status(404).json({ message: "ไม่พบคำสั่งซื้อที่เกี่ยวข้อง" });
    }

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
      error: err.message,
    });
  }
});

// อัปเดตสถานะยกเลิกสำหรับ order_id เฉพาะ
router.put("/cancel-order/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  console.log(`Attempting to cancel order_id: ${order_id}`);

  if (!order_id || !status) {
    return res.status(400).json({ message: "กรุณาระบุ order_id และ status" });
  }

  try {
    // ตรวจสอบและอัปเดตสถานะ
    const [result] = await db
      .promise()
      .query(`UPDATE orders SET status = ? WHERE order_id = ? AND status = 'pending'`, [status, order_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `ไม่พบคำสั่งซื้อ #${order_id} หรือไม่สามารถยกเลิกได้ (ไม่ใช่ pending)` });
    }

    const [order] = await db
      .promise()
      .query(`SELECT order_code FROM orders WHERE order_id = ?`, [order_id]);
    const order_code = order[0].order_code;

    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", { orderId: order_id, status, order_code });
    }

    res.json({ message: `ยกเลิกคำสั่งซื้อ #${order_id} เรียบร้อยแล้ว` });
  } catch (err) {
    console.error("Error in cancel-order:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ", error: err.message });
  }
});

module.exports = router;