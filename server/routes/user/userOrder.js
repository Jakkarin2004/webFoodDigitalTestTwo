const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { getTodayCount } = require("../owner/getTodayCount"); // ปรับ path ให้ถูกต้องตามโครงสร้างคุณ

// router.post("/", async (req, res) => {
//   const { table_number, items, order_code } = req.body;

//   if (!table_number || !Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
//   }

//   try {
//     const totalPrice = items.reduce((sum, item) => {
//       const price = parseFloat(item.price);
//       const quantity = parseInt(item.quantity) || 1;
//       return sum + (isNaN(price) ? 0 : price * quantity);
//     }, 0);

//     // insert order
//     const [result] = await db
//       .promise()
//       .query(
//         "INSERT INTO orders (order_code,table_number, status, total_price, order_time) VALUES (?, ?, ?, ?, NOW())",
//         [order_code, table_number, "pending", totalPrice]
//       );

//     const orderId = result.insertId;

//     // insert order_items ทีละรายการ
//     const insertItemsPromises = items.map((item) => {
//       const menuId = item.menu_id || item.id;
//       if (!menuId || !item.price) {
//         throw new Error(`ข้อมูลรายการอาหารไม่ครบ: ${JSON.stringify(item)}`);
//       }
//       return db
//         .promise()
//         .query(
//           "INSERT INTO order_items (order_id, menu_id, quantity, price, note, specialRequest) VALUES (?, ?, ?, ?, ?, ?)",
//           [
//             orderId,
//             menuId,
//             item.quantity,
//             item.price,
//             item.note || null,
//             item.specialRequest || null,
//           ]
//         );
//     });

//     await Promise.all(insertItemsPromises);

//     // ดึงจำนวนออเดอร์วันนี้ใหม่หลังเพิ่ม order
//     const io = req.app.get("io");
//     if (io) {
//       const count = await getTodayCount();

//       io.emit("new_order", {
//         order_id: orderId,
//         table_number,
//         status: "pending",
//         total_price: totalPrice,
//         items,
//         order_time: new Date().toISOString(),
//       });

//       io.emit("orderCountUpdated", { count });
//     }

//     return res.json({
//       message: "บันทึกคำสั่งซื้อเรียบร้อย",
//       orderId,
//       order_code,
//       total_price: totalPrice,
//     });
//   } catch (error) {
//     console.error("❌ เพิ่มคำสั่งซื้อไม่สำเร็จ:", error);
//     return res.status(500).json({
//       message: error.message || "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ",
//     });
//   }
// });
// router.post("/", async (req, res) => { 
//   const { table_number, items, order_code } = req.body;

//   if (!table_number || !Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
//   }

//   try {
//     const totalPrice = items.reduce((sum, item) => {
//       const price = parseFloat(item.price);
//       const quantity = parseInt(item.quantity) || 1;
//       return sum + (isNaN(price) ? 0 : price * quantity);
//     }, 0);

//     // -----------------------------
//     // 1️⃣ Insert เข้า temp_receipts
//     // -----------------------------
//     const [tempResult] = await db
//       .promise()
//       .query(
//         "INSERT INTO temp_receipts (temp_receipt_code, table_number, temp_receipt_time) VALUES (?, ?, NOW())",
//         [order_code, table_number]
//       );

//     const tempReceiptId = tempResult.insertId;

//     // -----------------------------
//     // 2️⃣ Insert เข้า orders
//     // -----------------------------
//     const [orderResult] = await db
//       .promise()
//       .query(
//         "INSERT INTO orders (order_code, table_number, status, total_price, order_time) VALUES (?, ?, ?, ?, NOW())",
//         [order_code, table_number, "pending", totalPrice]
//       );

//     const orderId = orderResult.insertId;

//     // -----------------------------
//     // 3️⃣ Insert order_items
//     // -----------------------------
//     const insertItemsPromises = items.map((item) => {
//       const menuId = item.menu_id || item.id;
//       if (!menuId || !item.price) {
//         throw new Error(`ข้อมูลรายการอาหารไม่ครบ: ${JSON.stringify(item)}`);
//       }
//       return db
//         .promise()
//         .query(
//           "INSERT INTO order_items (order_id, menu_id, quantity, price, note, specialRequest) VALUES (?, ?, ?, ?, ?, ?)",
//           [
//             orderId,
//             menuId,
//             item.quantity,
//             item.price,
//             item.note || null,
//             item.specialRequest || null,
//           ]
//         );
//     });

//     await Promise.all(insertItemsPromises);

//     // -----------------------------
//     // 4️⃣ Emit event ผ่าน Socket.IO
//     // -----------------------------
//     const io = req.app.get("io");
//     if (io) {
//       const count = await getTodayCount();

//       io.emit("new_order", {
//         order_id: orderId,
//         table_number,
//         status: "pending",
//         total_price: totalPrice,
//         items,
//         order_time: new Date().toISOString(),
//       });

//       io.emit("orderCountUpdated", { count });
//     }

//     // -----------------------------
//     // 5️⃣ ส่ง response กลับ
//     // -----------------------------
//     return res.json({
//       message: "บันทึกคำสั่งซื้อเรียบร้อย",
//       tempReceiptId,
//       orderId,
//       order_code,
//       total_price: totalPrice,
//     });
//   } catch (error) {
//     console.error("❌ เพิ่มคำสั่งซื้อไม่สำเร็จ:", error);
//     return res.status(500).json({
//       message: error.message || "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ",
//     });
//   }
// });
router.post("/", async (req, res) => { 
  const { table_number, items, order_code } = req.body;

  if (!table_number || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  }

  try {
    const totalPrice = items.reduce((sum, item) => {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity) || 1;
      return sum + (isNaN(price) ? 0 : price * quantity);
    }, 0);

    // -----------------------------
    // 1️⃣ ตรวจสอบ temp_receipts ก่อน
    // -----------------------------
    const [existingTemp] = await db
      .promise()
      .query(
        "SELECT temp_receipt_id FROM temp_receipts WHERE temp_receipt_code = ?",
        [order_code]
      );

    let tempReceiptId;

    if (existingTemp.length === 0) {
      // ถ้าไม่มี temp_receipt_code นี้ ให้ insert ใหม่
      const [tempResult] = await db
        .promise()
        .query(
          "INSERT INTO temp_receipts (temp_receipt_code, table_number, temp_receipt_time) VALUES (?, ?, NOW())",
          [order_code, table_number]
        );

      tempReceiptId = tempResult.insertId;
    } else {
      // ถ้ามีอยู่แล้ว ใช้ id เดิม
      tempReceiptId = existingTemp[0].temp_receipt_id;
    }

    // -----------------------------
    // 2️⃣ Insert เข้า orders
    // -----------------------------
    const [orderResult] = await db
      .promise()
      .query(
        "INSERT INTO orders (order_code, table_number, status, total_price, order_time) VALUES (?, ?, ?, ?, NOW())",
        [order_code, table_number, "pending", totalPrice]
      );

    const orderId = orderResult.insertId;

    // -----------------------------
    // 3️⃣ Insert order_items
    // -----------------------------
    const insertItemsPromises = items.map((item) => {
      const menuId = item.menu_id || item.id;
      if (!menuId || !item.price) {
        throw new Error(`ข้อมูลรายการอาหารไม่ครบ: ${JSON.stringify(item)}`);
      }
      return db
        .promise()
        .query(
          "INSERT INTO order_items (order_id, menu_id, quantity, price, note, specialRequest) VALUES (?, ?, ?, ?, ?, ?)",
          [
            orderId,
            menuId,
            item.quantity,
            item.price,
            item.note || null,
            item.specialRequest || null,
          ]
        );
    });

    await Promise.all(insertItemsPromises);

    // -----------------------------
    // 4️⃣ Emit event ผ่าน Socket.IO
    // -----------------------------
    const io = req.app.get("io");
    if (io) {
      const count = await getTodayCount();

      io.emit("new_order", {
        order_id: orderId,
        table_number,
        status: "pending",
        total_price: totalPrice,
        items,
        order_time: new Date().toISOString(),
      });

      io.emit("orderCountUpdated", { count });
    }

    // -----------------------------
    // 5️⃣ ส่ง response กลับ
    // -----------------------------
    return res.json({
      message: "บันทึกคำสั่งซื้อเรียบร้อย",
      tempReceiptId,
      orderId,
      order_code,
      total_price: totalPrice,
    });
  } catch (error) {
    console.error("❌ เพิ่มคำสั่งซื้อไม่สำเร็จ:", error);
    return res.status(500).json({
      message: error.message || "เกิดข้อผิดพลาดในการบันทึกคำสั่งซื้อ",
    });
  }
});

module.exports = router;
