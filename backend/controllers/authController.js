const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password'
    });
  }

  try {
    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '30d',
        }),
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  if (user) {
    // Verify current password if changing password
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error('Please provide current password');
      }

      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }

      // Set the new password - it will be hashed by the pre-save middleware
      user.password = req.body.newPassword;
    }

    // Update other fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Save the user - this will trigger the pre-save middleware to hash the password
    const updatedUser = await user.save();

    // Generate new token
    const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  login,
  register,
  updateProfile,
}; 