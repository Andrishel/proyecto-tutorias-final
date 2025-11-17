const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/token', authController.postToken);

module.exports = router;
