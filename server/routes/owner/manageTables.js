const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');
const db = require('../../config/db');
const { uploadQrcodeImage, ensureDir } = require('../../middleware/uploadMiddleware');

// POST /tables - เพิ่มโต๊ะใหม่และสร้าง QR Code
router.post('/', uploadQrcodeImage.single('qrcode_image'), async (req, res) => {
  const { table_number, table_name } = req.body;
  const fileName = `table_${table_number}.png`;
  const qrDir = path.join(__dirname, '../../public/uploads/qrcode');
  const qrPath = path.join(qrDir, fileName);
  const tableUrl = `http://localhost:5173/user-home/table/${table_number}/order`;

  try {
    await ensureDir(qrDir);

    // ตรวจสอบว่า table_number หรือ table_name ซ้ำหรือไม่
    db.query(
      'SELECT * FROM tables WHERE table_number = ? OR table_name = ?',
      [table_number, table_name || ''],
      async (err, results) => {
        if (err) {
          console.error('ตรวจสอบโต๊ะล้มเหลว:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบโต๊ะ' });
        }

        if (results.length > 0) {
          // ตรวจสอบว่าเป็นการซ้ำของ table_number หรือ table_name
          const duplicate = results.find(result => 
            result.table_number === table_number || result.table_name === (table_name || '')
          );
          if (duplicate.table_number === table_number) {
            return res.status(400).json({ message: 'หมายเลขโต๊ะนี้มีอยู่แล้วในระบบ' });
          }
          if (duplicate.table_name === (table_name || '')) {
            return res.status(400).json({ message: 'ชื่อโต๊ะนี้มีอยู่แล้วในระบบ' });
          }
        }

        // สร้าง QR Code
        await QRCode.toFile(qrPath, tableUrl, {
          errorCorrectionLevel: 'H',
          type: 'png',
          width: 300,
        });

        // บันทึกข้อมูลโต๊ะลง DB
        const sql = 'INSERT INTO tables (table_number, table_name, qrcode_image) VALUES (?, ?, ?)';
        db.query(sql, [table_number, table_name || '', fileName], (err, result) => {
          if (err) {
            console.error('เพิ่มโต๊ะล้มเหลว:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเพิ่มโต๊ะ' });
          }

          res.status(201).json({
            table_id: result.insertId,
            table_number,
            table_name: table_name || '',
            qrcode_image: fileName,
            created_at: new Date(),
          });
        });
      }
    );
  } catch (error) {
    console.error('เกิดข้อผิดพลาดทั่วไป:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดทั่วไป' });
  }
});
// GET /tables - ดึงข้อมูลโต๊ะทั้งหมด
router.get('/', (req, res) => {
  db.query('SELECT * FROM tables ORDER BY table_id DESC', (err, results) => {
    if (err) {
      console.error('ดึงข้อมูลโต๊ะล้มเหลว:', err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโต๊ะ' });
    }
    res.json(results);
  });
});

// PUT /tables/:id - อัปเดตข้อมูลโต๊ะ
router.put('/:id', (req, res) => {
  const tableId = parseInt(req.params.id, 10);
  const { table_number, table_name } = req.body;

  if (isNaN(tableId)) {
    return res.status(400).json({ message: 'ID โต๊ะไม่ถูกต้อง' });
  }
  if (!table_number) {
    return res.status(400).json({ message: 'กรุณากรอกหมายเลขโต๊ะ' });
  }

  // ตรวจสอบว่า table_number หรือ table_name ซ้ำกับข้อมูลอื่น (ยกเว้นตัวเอง)
  db.query(
    'SELECT * FROM tables WHERE (table_number = ? OR table_name = ?) AND table_id != ?',
    [table_number, table_name || '', tableId],
    (err, results) => {
      if (err) {
        console.error('ตรวจสอบโต๊ะล้มเหลว:', err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบโต๊ะ' });
      }

      if (results.length > 0) {
        const duplicate = results.find(result => 
          result.table_number === table_number || result.table_name === (table_name || '')
        );
        if (duplicate.table_number === table_number) {
          return res.status(400).json({ message: 'หมายเลขโต๊ะนี้มีอยู่แล้วในระบบ' });
        }
        if (duplicate.table_name === (table_name || '')) {
          return res.status(400).json({ message: 'ชื่อโต๊ะนี้มีอยู่แล้วในระบบ' });
        }
      }

      // อัปเดตข้อมูลโต๊ะ
      const sql = 'UPDATE tables SET table_number = ?, table_name = ? WHERE table_id = ?';
      db.query(sql, [table_number, table_name || '', tableId], (err, result) => {
        if (err) {
          console.error('อัปเดตโต๊ะล้มเหลว:', err);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตโต๊ะ' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'ไม่พบโต๊ะ' });
        }
        res.json({ message: 'อัปเดตโต๊ะสำเร็จ' });
      });
    }
  );
});

// DELETE /tables/:id - ลบโต๊ะและไฟล์ QR Code
router.delete('/:id', async (req, res) => {
  const tableId = parseInt(req.params.id, 10);

  if (isNaN(tableId)) {
    return res.status(400).json({ message: 'ID โต๊ะไม่ถูกต้อง' });
  }

  const selectSql = 'SELECT qrcode_image FROM tables WHERE table_id = ?';
  db.query(selectSql, [tableId], async (err, results) => {
    if (err) {
      console.error('ดึงข้อมูล QR ล้มเหลว:', err);
      return res.status(500).json({ message: 'ดึงข้อมูล QR ล้มเหลว' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'ไม่พบโต๊ะ' });
    }

    const qrImage = results[0].qrcode_image;
    const imagePath = path.join(__dirname, '../../public/uploads/qrcode', qrImage);

    try {
      await fs.access(imagePath);
      await fs.unlink(imagePath);
      console.log(`ลบไฟล์ QR: ${qrImage}`);
    } catch (unlinkErr) {
      console.warn('ลบไฟล์ QR ไม่สำเร็จหรือไม่พบไฟล์:', unlinkErr.message);
    }

    const deleteSql = 'DELETE FROM tables WHERE table_id = ?';
    db.query(deleteSql, [tableId], (delErr, result) => {
      if (delErr) {
        console.error('ลบโต๊ะล้มเหลว:', delErr);
        return res.status(500).json({ message: 'ลบโต๊ะไม่สำเร็จ' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'ไม่พบโต๊ะ' });
      }
      res.json({ message: 'ลบโต๊ะสำเร็จ' });
    });
  });
});

// GET /tables/check/:table_number - ตรวจสอบว่าโต๊ะมีอยู่หรือไม่
router.get('/check/:table_number', (req, res) => {
  const { table_number } = req.params;

  db.query('SELECT * FROM tables WHERE table_number = ?', [table_number], (err, results) => {
    if (err) {
      console.error('ดึงข้อมูลโต๊ะล้มเหลว:', err);
      return res.status(500).json({ message: 'ดึงข้อมูลโต๊ะล้มเหลว' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'ไม่พบโต๊ะในระบบ' });
    }

    res.json({
      message: 'พบโต๊ะในระบบ',
      table: results[0],
    });
  });
});

module.exports = router;