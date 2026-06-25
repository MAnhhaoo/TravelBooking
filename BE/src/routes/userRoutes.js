const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, checkRole } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/users/getAllUsers:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy danh sách tất cả người dùng
 */
router.get("/getAllUsers", authenticate, checkRole('admin'), userController.getAllUsers);

/**
 * @swagger
 * /api/users/createUser:
 *   post:
 *     tags:
 *       - Users
 *     summary: Tạo người dùng mới
 */
router.post("/createUser", userController.createUser);

/**
 * @swagger
 * /api/users/getUserById:
 *   get:
 *     tags:
 *       - Users
 *     summary: Lấy thông tin người dùng theo ID
 */
router.get("/getUserById/:id", authenticate, userController.getUserById);

/**
 * @swagger
 * /api/users/updateUserById/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Cập nhật thông tin người dùng theo ID
 */
router.put("/updateUserById/:id", authenticate, userController.updateUserById);

/**
 * @swagger
 * /api/users/deleteUserById/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Xóa người dùng theo ID
 */
router.delete("/deleteUserById/:id", authenticate, checkRole('admin'), userController.deleteUserById);


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Đăng ký tài khoản mới
 *     description: Người dùng tự đăng ký tài khoản với email, mật khẩu và thông tin cá nhân
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 example: newuser@gmail.com
 *               phone:
 *                 type: string
 *                 example: "0901234567"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 *       409:
 *         description: Email đã tồn tại
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */
router.post("/register", userController.register);

router.post("/login", userController.login);
module.exports = router;