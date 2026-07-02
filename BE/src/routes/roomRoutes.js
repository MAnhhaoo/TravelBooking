const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { authenticate, checkRole } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/rooms/getAllRoom:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Lấy danh sách phòng
 */
router.get("/getAllRoom", roomController.getAllRoom);

/**
 * @swagger
 * /api/rooms/getRoomById/{id}:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Lấy chi tiết 1 phòng theo ID
 *     description: Trả về đầy đủ thông tin phòng gồm loại phòng, tiện nghi, ảnh và thông tin khách sạn
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID của phòng cần xem
 *     responses:
 *       200:
 *         description: Thành công
 *       404:
 *         description: Không tìm thấy phòng
 */
router.get("/getRoomById/:id", roomController.getRoomById);

/**
 * @swagger
 * /api/rooms/createRoom:
 *   post:
 *     tags:
 *       - Rooms
 *     summary: Tạo phòng mới
 */
router.post("/createRoom", authenticate, checkRole(['vendor', 'hotel own', 'admin']), roomController.createRoom);

/**
 * @swagger
 * /api/rooms/getRoomByHotel/{hotelId}:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Lấy phòng theo khách sạn
 */
router.get("/getRoomByHotel/:hotelId", roomController.getRoomByHotel);

/**
 * @swagger
 * /api/rooms/updateRoom/{id}:
 *   put:
 *     tags:
 *       - Rooms
 *     summary: Cập nhật phòng
 */
router.put("/updateRoom/:id", authenticate, checkRole(['vendor', 'hotel own', 'admin']), roomController.updateRoom);

/**
 * @swagger
 * /api/rooms/deleteRoom/{id}:
 *   delete:
 *     tags:
 *       - Rooms
 *     summary: Xóa phòng theo ID
 */
router.delete("/deleteRoom/:id", authenticate, checkRole(['vendor', 'hotel own', 'admin']), roomController.deleteRoom);

/**
 * @swagger
 * /api/rooms/updateStatusRoom/{id}:
 *   patch:
 *     tags:
 *       - Rooms
 *     summary: Cập nhật trạng thái phòng
 */
router.patch("/updateStatusRoom/:id", authenticate, checkRole(['vendor', 'hotel own', 'admin']), roomController.updateStatusRoom);
module.exports = router;