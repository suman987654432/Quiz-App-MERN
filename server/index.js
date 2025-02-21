const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());

// Connect to MongoDB
connectDB();

// Root route for server check
app.get('/', (req, res) => {
  res.json({
    message: 'Quiz App Server is Running',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', authRoutes);
app.use('/api', quizRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Use absolute path
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server health check available at http://localhost:${PORT}`);
}); 