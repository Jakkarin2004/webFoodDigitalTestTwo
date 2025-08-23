const express = require('express');
const cors = require('cors');
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const db = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ผูก io เข้า express เพื่อใช้ใน req.app.get("io")
app.set("io", io);

// เชื่อมต่อ Socket.IO
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // ส่งจำนวนออเดอร์วันนี้เมื่อเชื่อมต่อ
  const { getTodayCount } = require('./routes/owner/getTodayCount');
  getTodayCount()
    .then(count => {
      socket.emit("orderCountUpdated", { count });
    })
    .catch(err => {
      console.error("❌ ดึงจำนวนออเดอร์วันนี้ล้มเหลว:", err);
    });

  // จัดการ Socket.IO room สำหรับ order_code
  socket.on("joinOrder", (order_code) => {
    socket.join(order_code);
    console.log(`Client ${socket.id} joined room ${order_code}`);
  });

  socket.on("leaveOrder", (order_code) => {
    socket.leave(order_code);
    console.log(`Client ${socket.id} left room ${order_code}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Middleware พื้นฐาน
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Routes
const login = require('./routes/auth/auth');
app.use("/api", login);

// Owner
const manageCategory = require('./routes/owner/manageCategory');
app.use('/api/owner/menu-types', manageCategory);

const manageMenu = require('./routes/owner/manageMenu');
app.use('/api/owner/menu', manageMenu);

const manageTables = require('./routes/owner/manageTables');
app.use('/api/owner/tables', manageTables);

const manageStaff = require('./routes/owner/manageStaff');
app.use("/api/owner/staff", manageStaff);

const manageOrders = require('./routes/owner/manageOrder');
app.use("/api/owner/orders", manageOrders);

const orderHistory = require('./routes/owner/orderHistory');
app.use("/api/owner/order-history", orderHistory);

const manageSale = require('./routes/owner/manageSale');
app.use("/api/owner/order-sale", manageSale);

const store = require('./routes/owner/store');
app.use("/api/owner/store", store);

// Staff
const manageProfileStaff = require('./routes/staff/manageProfileStaff');
app.use("/api/staff", manageProfileStaff);

const staffManageOrder = require('./routes/staff/staffManageOrder');
app.use('/api/staff/orders', staffManageOrder);

// User
const userHome = require('./routes/user/userHome');
app.use('/api/user/home', userHome);

const userOrder = require('./routes/user/userOrder');
app.use('/api/user/order', userOrder);

const checkTableRoute = require('./routes/user/checkTable');
app.use('/api/user/check-table', checkTableRoute);

const UserOrderList = require('./routes/user/userOrderList');
app.use('/api/user/order-list', UserOrderList);

const ViewBill = require('./routes/user/viewBill');
app.use('/api/user/viewOrder-list', ViewBill);

const ViewRes = require('./routes/user/viewRes');
app.use('/api/user/viewres', ViewRes);

// เริ่ม Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server with WebSocket running at http://localhost:${PORT}`);
});