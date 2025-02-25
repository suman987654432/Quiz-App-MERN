const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Received login attempt:', { email }); // Log the attempt

    // Simple admin check
    if (email === 'admin@example.com' && password === 'admin123') {
      console.log('Admin credentials matched'); // Log successful match

      const token = jwt.sign(
        {
          email,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Token generated successfully'); // Log token generation

      return res.json({
        token,
        user: {
          email,
          role: 'admin'
        }
      });
    }

    console.log('Invalid credentials provided'); // Log invalid attempt
    res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Simple User Login
router.post('/user/login', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already used' });
    }

    // Proceed with login/signup logic
    const newUser = new User({ name, email });
    await newUser.save();

    res.status(200).json({
      message: 'Login successful',
      user: { name, email }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 