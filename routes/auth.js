const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

// Point the routes to the functions in your controller
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;