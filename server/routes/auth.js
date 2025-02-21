const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Admin Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Use the same secret from .env
    const token = jwt.sign(
      { 
        id: admin._id, 
        email: admin.email,
        role: 'admin' 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log token creation
    console.log('Token created for:', admin.email);

    res.json({ 
      token,
      user: {
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Login (simplified)
router.post('/user/login', async (req, res) => {
  try {
    const { name, email } = req.body;
    const token = jwt.sign({ name, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 