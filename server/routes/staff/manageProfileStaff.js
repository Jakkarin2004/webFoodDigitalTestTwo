const express = require("express");
const router = express.Router();
const db = require("../../config/db");
// const bcrypt = require("bcrypt");
const { verifyToken } = require("../../middleware/auth");

router.use(verifyToken); // ต้องเข้าสู่ระบบก่อนทุกเส้นทาง

// ✅ ดึงข้อมูลของตัวเอง (owner หรือ staff)
router.get("/", (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id, first_name, last_name, username, phone_number, role, created_at, updated_at FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
      }
      res.json(results[0]);
    }
  );
});

router.put("/", (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, phone_number } = req.body;

  if (!first_name || !last_name || !phone_number)
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });

  db.query(
    "UPDATE users SET first_name = ?, last_name = ?, phone_number = ?, updated_at = NOW() WHERE id = ?",
    [first_name, last_name, phone_number, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "อัปเดตไม่สำเร็จ", error: err });
      res.json({ message: "อัปเดตเรียบร้อยแล้ว" });
    }
  );
});


module.exports = router;
