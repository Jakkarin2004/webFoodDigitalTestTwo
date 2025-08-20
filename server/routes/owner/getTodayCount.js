const db = require("../../config/db");

async function getTodayCount() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });

  const [rows] = await db.promise().query(
    `
    SELECT COUNT(*) AS count
    FROM orders
    WHERE DATE(order_time) = ?
      AND status IN ('pending', 'preparing', 'ready')
    `,
    [today]
  );

  return rows?.[0]?.count ?? 0;
}

module.exports = { getTodayCount };
