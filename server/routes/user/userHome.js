const express = require("express");
const router = express.Router();
const db = require("../../config/db"); // ปรับ path ให้ตรงกับของคุณ

router.get("/categories", (req, res) => {
  const sql = "SELECT * FROM menu_type ORDER BY type_name ASC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Query error in /categories:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลประเภทเมนู" });
    }
    res.json(results);
  });
});

// router.get("/products/:menuTypeId", (req, res) => {
//   const menuTypeId = parseInt(req.params.menuTypeId, 10);

//   let sql = `
//     SELECT menu.*, menu_type.type_name AS category_name
//     FROM menu 
//     INNER JOIN menu_type ON menu.menu_type_id = menu_type.menu_type_id
//   `;

//   const values = [];
//   if (menuTypeId !== 0) {
//     sql += " WHERE menu.menu_type_id = ?";
//     values.push(menuTypeId);
//   }

//   sql += " ORDER BY menu.menu_name ASC";

//   db.query(sql, values, (err, results) => {
//     if (err) {
//       console.error("Query error in /products/:menuTypeId:", err);
//       return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลเมนู" });
//     }
//     res.json(results);
//   });
// });

router.get("/products/:menuTypeId", (req, res) => {
  const menuTypeId = parseInt(req.params.menuTypeId, 10);

  let sql = `
    SELECT menu.*, menu_type.type_name AS category_name
    FROM menu 
    INNER JOIN menu_type ON menu.menu_type_id = menu_type.menu_type_id
  `;

  const values = [];
  if (menuTypeId !== 0) {
    sql += " WHERE menu.menu_type_id = ? AND menu.special = 1";
    values.push(menuTypeId);
  } else {
    sql += " WHERE menu.special = 1";
  }

  sql += " ORDER BY menu.menu_name ASC";

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Query error in /products/:menuTypeId:", err);
      return res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลเมนู" });
    }
    res.json(results);
  });
});



module.exports = router;