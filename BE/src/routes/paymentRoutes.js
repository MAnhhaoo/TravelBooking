const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/payments/getPaymentByBooking/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: get payment depend on booking
 */
router.get("/getPaymentByBooking/:id", authenticate, paymentController.getPaymentByBooking);

/**
 * @swagger
 * /api/payments/createPayment:
 *   post:
 *     tags:
 *       - Payments
 *     summary: create new payment
 */
router.post("/createPayment", authenticate, paymentController.createPayment);
module.exports = router;