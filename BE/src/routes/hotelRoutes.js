const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");
const { authenticate, checkRole } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/hotels/getAllHotel:
 *   get:
 *     tags:
 *       - Hotels
 *     summary: Lấy danh sách khách sạn
 *     description: Trả về mảng chứa toàn bộ khách sạn
 *     responses:
 *       200:
 *         description: Trả về danh sách thành công
 */
router.get("/getAllHotel", hotelController.getAllHotel);

/**
 * @swagger
 * /api/hotels/getHotelById/{id}:
 *   get:
 *     tags:
 *       - Hotels
 *     summary: Lấy thông tin khách sạn theo ID
 *     description: Trả về chi tiết khách sạn theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khách sạn
 *     responses:
 *       200:
 *         description: Trả về khách sạn thành công
 *       404:
 *         description: Không tìm thấy khách sạn
 */
router.get("/getHotelById/:id", hotelController.getHotelById);

/**
 * @swagger
 * /api/hotels/createHotel:
 *   post:
 *     tags:
 *       - Hotels
 *     summary: Tạo mới khách sạn
 *     description: Tạo một khách sạn mới trong hệ thống
 */
router.post("/createHotel", authenticate, checkRole(['vendor', 'hotel own', 'admin']), hotelController.createHotel);

/**
 * @swagger
 * /api/hotels/deleteHotel/{id}:
 *   delete:
 *     tags:
 *       - Hotels
 *     summary: Xóa khách sạn theo ID
 */
router.delete("/deleteHotel/:id", authenticate, checkRole(['vendor', 'hotel own', 'admin']), hotelController.deleteHotel);

/**
 * @swagger
 * /api/hotels/updateHotel/{id}:
 *   put:
 *     tags:
 *       - Hotels
 *     summary: Cập nhật thông tin khách sạn
 */
router.put("/updateHotel/:id", authenticate, checkRole(['vendor', 'hotel own', 'admin']), hotelController.updateHotel);

/**
 * @swagger
 * /api/hotels/{id}/status:
 *   patch:
 *     tags:
 *       - Hotels
 *     summary: Cập nhật trạng thái khách sạn
 */
router.patch("/:id/status", authenticate, checkRole(['vendor', 'hotel own', 'admin']), hotelController.updateStatusHotel);
module.exports = router;