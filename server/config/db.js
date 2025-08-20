const mysql = require('mysql2');
require('dotenv').config(); // โหลดค่าจาก .env

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3000
});

db.connect((err) => {
  if (err) {
    console.error('❌ การเชื่อมต่อ MySQL ล้มเหลว:', err);
  } else {
    console.log('✅ เชื่อมต่อ MySQL สำเร็จ');
  }
});


module.exports = db;
