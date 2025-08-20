const express = require("express");
const router = express.Router();
const db = require("../../config/db"); // แบบ callback ไม่ใช่ promise
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
  }

  db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }

    const user = results[0];
    if (!user) {
      console.log(`Login fail: username ${username} not found`);
      return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
      }
      if (!match) {
        console.log(`Login fail: wrong password for username ${username}`);
        return res.status(401).json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                phone_number: user.phone_number,
                role: user.role,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
      });
    });
  });
});

module.exports = router;
