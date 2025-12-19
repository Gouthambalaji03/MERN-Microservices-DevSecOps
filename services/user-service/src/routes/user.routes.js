const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.createProfile);
router.get('/:id', userController.getProfile);
router.put('/:id', userController.updateProfile);
router.delete('/:id', userController.deleteProfile);

router.get('/:id/preferences', userController.getPreferences);
router.put('/:id/preferences', userController.updatePreferences);

router.get('/:id/addresses', userController.getAddresses);
router.post('/:id/addresses', userController.addAddress);
router.put('/:id/addresses/:addressId', userController.updateAddress);
router.delete('/:id/addresses/:addressId', userController.deleteAddress);

module.exports = router;

