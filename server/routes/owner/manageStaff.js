const express = require("express");
const router = express.Router();
const db = require("../../config/db"); // แบบ callback ธรรมดา
const bcrypt = require("bcrypt");
const { verifyToken, isOwner } = require("../../middleware/auth");

router.use(verifyToken, isOwner);

// ดึง staff ทั้งหมด
// router.get("/", (req, res) => {
//   db.query(
//     "SELECT id, first_name, last_name, username, phone_number FROM users WHERE role = 'staff'",
//     (err, results) => {
//       if (err) {
//         return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
//       }
//       res.json(results);
//     }
//   );
// });
// ดึง staff ทั้งหมด พร้อม created_at และ updated_at
router.get("/", (req, res) => {
  db.query(
    `SELECT id, first_name, last_name, username, phone_number, created_at, updated_at 
     FROM users 
     WHERE role = 'staff'`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
      }
      res.json(results);
    }
  );
});


// เพิ่ม staff พร้อมสุ่มรหัสผ่าน
router.post("/", (req, res) => {
  const { first_name, last_name, username, phone_number, password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "กรุณาใส่รหัสผ่านด้วย" });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }

    db.query(
      "INSERT INTO users (first_name, last_name, username, password, phone_number, role) VALUES (?, ?, ?, ?, ?, 'staff')",
      [first_name, last_name, username, hashedPassword, phone_number],
      (err2) => {
        if (err2) {
          return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err2 });
        }
        res.json({ message: "เพิ่ม staff สำเร็จ" });
      }
    );
  });
});


// แก้ไข staff
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, phone_number, password } = req.body;

  const updateUser = (hashedPassword = null) => {
    let sql = "UPDATE users SET first_name=?, last_name=?, username=?, phone_number=?";
    const values = [first_name, last_name, username, phone_number];

    if (hashedPassword) {
      sql += ", password=?";
      values.push(hashedPassword);
    }
    sql += " WHERE id=? AND role='staff'";
    values.push(id);

    db.query(sql, values, (err, results) => {
      if (err) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
      }
      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    });
  };

  if (password) {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
      }
      updateUser(hashedPassword);
    });
  } else {
    updateUser();
  }
});


// ลบ staff
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM users WHERE id=? AND role='staff'", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }
    res.json({ message: "ลบ staff สำเร็จ" });
  });
});

module.exports = router;
