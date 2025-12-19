const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/user/:userId', reviewController.getUserReviews);
router.get('/pending', reviewController.getPendingReviews);
router.get('/:id', reviewController.getReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markHelpful);
router.put('/:id/moderate', reviewController.moderateReview);
router.post('/:id/reply', reviewController.addReply);

module.exports = router;

