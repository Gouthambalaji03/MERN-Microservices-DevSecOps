const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const fs = require('fs');
const path = require('path');
const sharedPath = fs.existsSync('/app/shared') ? '/app/shared' : path.join(__dirname, '../../../../shared');
const { validate, schemas } = require(`${sharedPath}/validation`);

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify', authController.verify);

module.exports = router;

