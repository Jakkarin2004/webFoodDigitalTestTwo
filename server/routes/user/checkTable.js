const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/user/check-table/:table_number
router.get('/:table_number', (req, res) => {
  const { table_number } = req.params;

  db.query(
    'SELECT * FROM tables WHERE table_number = ?',
    [table_number],
    (err, results) => {
      if (err) {
        console.error('❌ ดึงข้อมูลโต๊ะล้มเหลว:', err);
        return res.status(500).json({ message: '❌ ดึงข้อมูลโต๊ะล้มเหลว' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: '❌ ไม่พบโต๊ะในระบบ' });
      }

      res.json({
        message: '✅ โต๊ะมีอยู่ในระบบ',
        table: results[0],
      });
    }
  );
});

module.exports = router;
