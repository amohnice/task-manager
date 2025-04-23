const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateProfile } = require('../controllers/authController');

router.route('/profile').put(protect, updateProfile);

module.exports = router; 