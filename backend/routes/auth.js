const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { login, register, updateProfile } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.put('/profile', protect, updateProfile);

module.exports = router; 