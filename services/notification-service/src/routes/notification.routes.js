const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.post('/', notificationController.sendNotification);
router.get('/:id', notificationController.getNotification);
router.get('/user/:userId', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);

router.get('/templates', notificationController.getTemplates);
router.post('/templates', notificationController.createTemplate);
router.put('/templates/:id', notificationController.updateTemplate);
router.delete('/templates/:id', notificationController.deleteTemplate);

module.exports = router;

