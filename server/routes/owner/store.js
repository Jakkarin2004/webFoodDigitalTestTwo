const express = require("express");
const router = express.Router();
const db = require("../../config/db");
// import middleware upload
const { uploadStoreImage, deleteOldStoreImage } = require("../../middleware/uploadMiddleware");
// ดึงข้อมูลร้านค้า (GET /api/store)
router.get("/", (req, res) => {
  db.query("SELECT * FROM store WHERE id = 1", (err, rows) => {
    if (err) {
      console.error("ดึงข้อมูลร้านผิดพลาด:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลร้านค้า" });
    }
    if (rows[0].operating_hours) {
      try {
        rows[0].operating_hours = JSON.parse(rows[0].operating_hours);
      } catch {
        rows[0].operating_hours = {};
      }
    }
    res.json(rows[0]);
  });
});


// แก้ไขข้อมูลร้านค้า (PUT /api/store/:id)
router.put(
  "/:id",
  uploadStoreImage.single("image_res"),
  deleteOldStoreImage,
  (req, res) => {
    const { store_name, address, phone_number, description, operating_hours } = req.body;
    const storeId = req.params.id;

    const image_res = req.file ? req.file.filename : req.body.image_res;

    const parsedOperatingHours = typeof operating_hours === 'string'
      ? operating_hours
      : JSON.stringify(operating_hours);

    db.query(
      `UPDATE store SET
        store_name = ?,
        image_res = ?,
        address = ?,
        phone_number = ?,
        description = ?,
        operating_hours = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        store_name,
        image_res,
        address,
        phone_number,
        description,
        parsedOperatingHours,
        storeId,
      ],
      (err, result) => {
        if (err) {
          console.error("อัปเดตร้านผิดพลาด:", err);
          return res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปเดต" });
        }
        res.json({ 
          message: "อัปเดตข้อมูลร้านเรียบร้อยแล้ว",
          image_res: image_res
        });
      }
    );
  }
);

  



module.exports = router;
