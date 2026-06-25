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
router.put("/updateStatusBooking/:id", authenticate, checkRole(['hotel own', 'admin']), bookingController.updateStatusBooking);
module.exports = router;