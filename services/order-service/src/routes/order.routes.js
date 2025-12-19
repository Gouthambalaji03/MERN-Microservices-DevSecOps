const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.get('/', orderController.getAllOrders);
router.post('/', orderController.createOrder);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);
router.put('/:id/payment', orderController.updatePaymentStatus);
router.put('/:id/tracking', orderController.updateTracking);
router.get('/:id/tracking', orderController.getTracking);

module.exports = router;

