const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /menu-types - ดึงข้อมูลหมวดหมู่ทั้งหมด
router.get('/', (req, res) => {
  db.query('SELECT * FROM menu_type ORDER BY type_name ASC', (err, results) => {
    if (err) {
      console.error('Query Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    res.json(results);
  });
});

// GET /menu-types/:id - ดึงข้อมูลหมวดหมู่ตาม ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: 'ID ไม่ถูกต้อง' });
  }
  db.query('SELECT * FROM menu_type WHERE menu_type_id = ?', [parsedId], (err, results) => {
    if (err) {
      console.error('Query Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการ' });
    }
    res.json(results[0]);
  });
});

// POST /menu-types - เพิ่มหมวดหมู่ใหม่
router.post('/', (req, res) => {
  const { type_name } = req.body;
  if (!type_name?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อหมวดหมู่' });
  }
  const sql = 'INSERT INTO menu_type (type_name) VALUES (?)';
  db.query(sql, [type_name.trim()], (err, result) => {
    if (err) {
      console.error('Insert Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' });
    }
    res.status(201).json({ message: 'เพิ่มข้อมูลสำเร็จ', id: result.insertId });
  });
});

// PUT /menu-types/:id - แก้ไขหมวดหมู่
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { type_name } = req.body;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return res.status(400).json({ error: 'ID ไม่ถูกต้อง' });
  }
  if (!type_name?.trim()) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อหมวดหมู่' });
  }

  const sql = 'UPDATE menu_type SET type_name = ? WHERE menu_type_id = ?';
  db.query(sql, [type_name.trim(), parsedId], (err, result) => {
    if (err) {
      console.error('Update Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการแก้ไข' });
    }
    res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
  });
});

// DELETE /menu-types/:id - ลบหมวดหมู่
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: 'ID ไม่ถูกต้อง' });
  }
  const sql = 'DELETE FROM menu_type WHERE menu_type_id = ?';
  db.query(sql, [parsedId], (err, result) => {
    if (err) {
      console.error('Delete Error:', err);
      return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลที่ต้องการลบ' });
    }
    res.json({ message: 'ลบข้อมูลสำเร็จ' });
  });
});

module.exports = router;