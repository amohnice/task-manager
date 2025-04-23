const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUsers, updateUserProfile } = require('../controllers/userController');

router.route('/').get(protect, getUsers);
router.route('/profile').put(protect, updateUserProfile);

module.exports = router; 