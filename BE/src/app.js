const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const userController = require('./controllers/userController'); 
const useruserRoute = require('./routes/userRoutes'); 
const hotelRoute = require("./routes/hotelRoutes");
const roomRoute = require("./routes/roomRoutes");
const paymentRoute = require("./routes/paymentRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const bookingRoute = require("./routes/bookingRoutes");
const voucherRoute = require("./routes/voucherRoutes");
const statsController = require("./controllers/statsController");
const { authenticate, checkRole } = require("./middlewares/authMiddleware");
const app = express();

// 1. Các Middleware cơ bản phải chạy trước
app.use(cors());
app.use(express.json());

// 2. Cấu hình Swagger (Đặt ngay tại đây để Express nhận diện đầu tiên)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dự án E-Commerce API',
      version: '1.0.0',
      description: 'Tài liệu hướng dẫn và test API hệ thống',
    },
    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
    tags: [
      { name: 'Users', description: 'Quản lý người dùng' },
      { name: 'Hotels', description: 'Quản lý khách sạn' },
      { name: 'Rooms', description: 'Quản lý phòng' },
      { name: 'Payments', description: 'Quản lý thanh toán' },
      { name: 'Reviews', description: 'Quản lý đánh giá' },
      { name: 'Bookings', description: 'Quản lý đặt khách sạn' },
      { name: 'Vouchers', description: 'Quản lý mã giảm giá' },
    ],
    paths: {}, // XÓA SẠCH ĐỂ TRỐNG Ở ĐÂY, KHÔNG GÕ TAY NỮA
  },
  // BẢO SWAGGER TỰ ĐỘNG QUÉT TẤT CẢ FILE .JS TRONG THƯ MỤC ROUTES
  apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// ĐĂNG KÝ ĐƯỜNG DẪN SWAGGER TRỰC TIẾP VÀO APP
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 3. Các tuyến đường API chính thức của bạn (Đặt ở phía dưới Swagger)
app.get('/api/owner/stats', authenticate, checkRole(['vendor', 'hotel own', 'admin']), statsController.getOwnerStats);
app.get('/api/admin/stats', authenticate, checkRole('admin'), statsController.getAdminStats);
app.get('/admin/users', authenticate, checkRole('admin'), userController.getAllUsers);
app.get('/api/admin/users', authenticate, checkRole('admin'), userController.getAllUsers);
app.use('/api/users', useruserRoute);

app.use('/api/hotels', hotelRoute);

app.use('/api/rooms', roomRoute);

app.use('/api/payments', paymentRoute);

app.use('/api/reviews', reviewRoute);

app.use('/api/bookings', bookingRoute);
app.use('/api/vouchers', voucherRoute);
// 4. Lắng nghe cổng
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🚀 SERVER BE ĐANG CHẠY TẠI CỔNG: ${PORT}`);
  console.log(`=============================================`);
});