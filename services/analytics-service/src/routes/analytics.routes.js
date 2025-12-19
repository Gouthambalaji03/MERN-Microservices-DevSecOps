const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.post('/event', analyticsController.trackEvent);
router.post('/events/batch', analyticsController.trackBatch);
router.get('/dashboard', analyticsController.getDashboard);
router.get('/users/:userId', analyticsController.getUserAnalytics);
router.get('/products/:productId', analyticsController.getProductAnalytics);
router.get('/reports', analyticsController.getReports);

module.exports = router;

