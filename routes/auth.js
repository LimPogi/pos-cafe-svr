const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller'); // Path to your controller

// This matches the frontend call: api.post('/auth/register')
router.post('/register', authController.register);

// This matches the login call: api.post('/auth/login')
router.post('/login', authController.login);

module.exports = router;