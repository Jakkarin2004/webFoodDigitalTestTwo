const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const db = require('../../config/db');
const { uploadQrcodeImage, ensureDir } = require('../../middleware/uploadMiddleware');

// ========== MODEL + CONTROLLER ==========

router.post('/', uploadQrcodeImage.single('qrcode_image'), async (req, res) => {
  const { table_number, table_name } = req.body;
  const fileName = `table_${table_number}.png`;
  const qrDir = path.join(__dirname, '../../public/uploads/qrcode');
  const qrPath = path.join(qrDir, fileName);
  const tableUrl = `http://localhost:5173/user-home/table/${table_number}/order`;


  try {
    await ensureDir(qrDir);

    // เช็คซ้ำด้วย callback
    db.query('SELECT * FROM tables WHERE table_number = ?', [table_number], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: '❌ เกิดข้อผิดพลาดในการตรวจสอบโต๊ะ' });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: '❌ โต๊ะนี้มีอยู่แล้วในระบบ' });
      }

      // สร้างไฟล์ QR code (ยังใช้ await ได้เพราะเป็น promise)
      await QRCode.toFile(qrPath, tableUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
      });

      // บันทึกข้อมูลโต๊ะลง DB ด้วย callback
      const sql = 'INSERT INTO tables (table_number, table_name, qrcode_image) VALUES (?, ?, ?)';
      db.query(sql, [table_number, table_name, fileName], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: '❌ เกิดข้อผิดพลาดในการเพิ่มโต๊ะ' });
        }

        res.status(201).json({
        table_id: result.insertId, // เอา id ที่ MySQL สร้าง
        table_number,
        table_name,
        qrcode_image: fileName,
        created_at: new Date(), // หรือใช้ CURRENT_TIMESTAMP ใน DB แล้วดึงกลับก็ได้
        });

      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '❌ เกิดข้อผิดพลาดทั่วไป' });
  }
});

router.get('/', (req, res) => {
  db.query('SELECT * FROM tables ORDER BY table_id DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: '❌ เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ' });
    }
    res.json(results);
  });
});

// ลบโต๊ะและไฟล์ QR code

router.delete('/:id', (req, res) => {
  const tableId = req.params.id;

  // 1. ดึงชื่อไฟล์ QR ก่อน
  const selectSql = 'SELECT qrcode_image FROM tables WHERE table_id = ?';
  db.query(selectSql, [tableId], async (err, results) => {
    if (err) {
      console.error('❌ ดึงข้อมูล QR ล้มเหลว:', err);
      return res.status(500).json({ message: '❌ ดึงข้อมูล QR ล้มเหลว' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '❌ ไม่พบโต๊ะ' });
    }

    const qrImage = results[0].qrcode_image;
    const imagePath = path.join(__dirname, '../../public/uploads/qrcode', qrImage);

    // 2. ลบไฟล์ภาพ
    try {
      await fs.unlink(imagePath);
    } catch (unlinkErr) {
      console.warn('⚠️ ลบไฟล์ QR ไม่สำเร็จหรือไม่พบไฟล์:', unlinkErr.message);
    }

    // 3. ลบโต๊ะจาก DB
    const deleteSql = 'DELETE FROM tables WHERE table_id = ?';
    db.query(deleteSql, [tableId], (delErr, result) => {
      if (delErr) {
        console.error('❌ ลบโต๊ะล้มเหลว:', delErr);
        return res.status(500).json({ message: '❌ ลบโต๊ะไม่สำเร็จ' });
      }

      res.json({ message: '✅ ลบโต๊ะเรียบร้อยแล้ว' });
    });
  });
});

// เช็คว่าโต๊ะมีอยู่หรือไม่: /api/tables/check/:table_number
router.get('/check/:table_number', (req, res) => {
  const { table_number } = req.params;

  // ตรวจสอบว่าเป็นตัวเลข
  if (isNaN(table_number)) {
    return res.status(400).json({ message: 'เลขโต๊ะไม่ถูกต้อง' });
  }

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
        message: '✅ พบโต๊ะในระบบ',
        table: results[0],
      });
    }
  );
});

module.exports = router;
