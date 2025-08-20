// utils/getTodayRevenue.js
const db = require("../../config/db");

async function getTodayRevenue() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });

  const [result] = await db.promise().query(
    `SELECT 
      COALESCE(SUM(total_price), 0) AS totalRevenue,
      COUNT(*) AS totalOrders
    FROM orders
    WHERE DATE(order_time) = ?
      AND status = 'completed'`,
    [today]
  );

  return {
    totalRevenue: parseFloat(result[0].totalRevenue) || 0,
    totalOrders: result[0].totalOrders,
    date: new Date().toLocaleDateString("th-TH"),
  };
}

module.exports = { getTodayRevenue };
