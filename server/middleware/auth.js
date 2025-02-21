const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Clean the token
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      // Verify with the exact same secret used to sign
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Log successful verification
      console.log('Token verified for:', decoded.email);
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT Verification Error:', jwtError.message);
      return res.status(401).json({ 
        message: 'Invalid token',
        error: jwtError.message 
      });
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 