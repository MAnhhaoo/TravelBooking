const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { authenticate } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /api/reviews/getAllReviewByHotel/{id}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: get reivew of hotel
 *     description: get all review of hotel which the user was review this
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of hotel need get
 *     responses:
 *       200:
 *         description: Trả về ds nội dung đánh giá thành công
 */
router.get("/getAllReviewByHotel/:id", reviewController.getAllReviewByHotel);

/** 
 * @swagger
 * /api/reviews/createReview:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Tạo đánh giá mới
 *     description: Người dùng gửi đánh giá và số điểm rating cho khách sạn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               review_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *               hotel_id:
 *                 type: integer
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đánh giá đã được tạo thành công
 */
router.post("/createReview", authenticate, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/deleteReview/{id}:
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     description: User or admin can delete a review by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the review to delete
 *     responses:
 *       200:
 *         description: Delete review success
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete("/deleteReview/:id", authenticate, reviewController.deleteReview);
module.exports = router;
