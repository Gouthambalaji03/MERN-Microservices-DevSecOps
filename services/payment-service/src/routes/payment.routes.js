const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPayment);
router.get('/user/:userId', paymentController.getUserPayments);
router.post('/:id/refund', paymentController.refund);
router.post('/confirm', paymentController.confirmPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;

