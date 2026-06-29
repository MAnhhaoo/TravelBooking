const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate, checkRole } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/bookings/createBooking:
 *   post:
 *     tags:
 *       - Bookings
 *     summary: create booking depend on user and room
 *     description: create new a room being booked
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner_id:
 *                 type: integer
 *               hotel_name:
 *                 type: string
 *               address:
 *                 type: string
 *             required:
 *               - rooms
 *               - users
 *               - address
 *     responses:
 *       201:
 *         description: Khách sạn được tạo thành công
 */
router.post("/createBooking", authenticate, bookingController.createBooking);

/**
 * @swagger
 * /api/bookings/updateStatusBooking/{id}:
 *   put:
 *     tags:
 *       - Bookings
 *     summary: update status of booking 
 *     description: up date status of booking by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khách sạn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật thông tin khách sạn thành công
 */
router.put("/updateStatusBooking/:id", authenticate, checkRole(['vendor', 'hotel own', 'admin']), bookingController.updateStatusBooking);

/**
 * @swagger
 * /api/bookings/getDetailBooking/{id}:
 *   get:
 *     tags:
 *       - Bookings
 *     summary: Get detail bookings by booking ID
 *     description: lấy chi tiết lượt đặt phòng theo booking ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của lượt đặt phòng
 *     responses:
 *       200:
 *         description: chi tiết về lượt đặt phòng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Booking"
 *       404:
 *         description: Không tìm thấy thông tin chi tiết về lượt đặt phòng này
 *       401:
 *         description: Unauthorized – token không hợp lệ hoặc đã hết hạn
 *       500:
 *         description: Lỗi hệ thống
 */
router.get("/getDetailBooking/:id", authenticate, bookingController.getDetailBooking);

router.get("/getAllBooking", authenticate, bookingController.getAllBooking);

module.exports = router;