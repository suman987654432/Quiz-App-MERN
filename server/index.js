const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

const app = express();

// CORS configuration
app.use(cors());

// Body parser
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api', quizRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Check if dist directory exists
  const distPath = path.join(__dirname, '../client/dist');

  try {
    // Only serve static files if the directory exists
    if (require('fs').existsSync(distPath)) {
      app.use(express.static(distPath));

      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } catch (err) {
    console.error('Error checking dist directory:', err);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404s
app.use((req, res) => {
  console.log('404 for:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 