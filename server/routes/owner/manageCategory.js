const express = require('express');
const router = express.Router();
const db = require('../../config/db'); // ดึงการเชื่อมต่อที่แยกไว้แล้ว

// GET /menu-types
// router.get('/', (req, res) => {
//   db.query('SELECT * FROM menu_type', (err, results) => {
//     if (err) {
//       console.error('❌ Query Error:', err);
//       return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
//     }
//     res.json(results);
//   });
// });

// ดึงข้อมูลทั้งหมด
router.get('/', (req, res) => {
  db.query('SELECT * FROM menu_type', (err, results) => {
    if (err) {
      console.error('❌ Query Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    res.json(results);
  });
});

// ดึงข้อมูลตาม ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM menu_type WHERE menu_type_id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Query Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการ' });
    }
    res.json(results[0]);
  });
});

// เพิ่มข้อมูลใหม่
// POST /menu-types
router.post('/', (req, res) => {
  const { type_name } = req.body; // 👈 ใช้ชื่อนี้ให้ตรงกับ frontend

  const sql = 'INSERT INTO menu_type (type_name) VALUES (?)';
  db.query(sql, [type_name], (err, result) => {
    if (err) {
      console.error('❌ Insert Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
    }
    res.status(201).json({ message: 'เพิ่มข้อมูลสำเร็จ', id: result.insertId });
  });
});

// ลบข้อมูลตาม ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM menu_type WHERE menu_type_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Delete Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการลบ' });
    }
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  });
});

module.exports = router;
