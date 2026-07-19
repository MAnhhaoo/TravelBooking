const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { authenticate, checkRole } = require("../middlewares/authMiddleware");
const jwt = require("jsonwebtoken");

/**
 * Optional Authentication Middleware
 * Nếu có token hợp lệ -> gán req.user. Nếu không có hoặc hết hạn -> để req.user = null và tiếp tục
 */
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7);
  } else if (req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  const secretKey = process.env.SECRET_KEY || "abc123";
  jwt.verify(token, secretKey, (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  });
};

/**
 * @swagger
 * /api/vouchers:
 *   get:
 *     tags:
 *       - Vouchers
 *     summary: Lấy danh sách voucher
 */
router.get("/", optionalAuthenticate, voucherController.getAllVouchers);

/**
 * @swagger
 * /api/vouchers:
 *   post:
 *     tags:
 *       - Vouchers
 *     summary: Tạo mới voucher (Admin & Owner)
 */
router.post("/", authenticate, checkRole(["admin", "vendor", "hotel own", "owner"]), voucherController.createVoucher);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   put:
 *     tags:
 *       - Vouchers
 *     summary: Cập nhật voucher (Admin & Owner)
 */
router.put("/:id", authenticate, checkRole(["admin", "vendor", "hotel own", "owner"]), voucherController.updateVoucher);

/**
 * @swagger
 * /api/vouchers/{id}:
 *   delete:
 *     tags:
 *       - Vouchers
 *     summary: Xóa voucher (Admin & Owner)
 */
router.delete("/:id", authenticate, checkRole(["admin", "vendor", "hotel own", "owner"]), voucherController.deleteVoucher);

/**
 * @swagger
 * /api/vouchers/apply:
 *   post:
 *     tags:
 *       - Vouchers
 *     summary: Kiểm tra và tính giảm giá từ voucher cho Checkout
 */
router.post("/apply", voucherController.applyVoucher);

module.exports = router;
