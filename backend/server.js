const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const agreementRoutes = require('./routes/agreement');
const connectionRoutes = require('./routes/connections');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

// App initialization
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3003'],
    credentials: true
  }
});

// Make io available to routes
app.set('io', io);

// General rate limiting for all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for development - Limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter); // Apply to all requests

// Middleware
app.use(helmet()); // Security headers
// Configure CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3003'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room with user ID
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Assured Contract Farming API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for user directory
const { getAllUsers, getUserById } = require('./controllers/profileController');
app.get('/api/users/directory', getAllUsers);
app.get('/api/users/directory/:userId', getUserById);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assuredcontractfarming')
.then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('Database connection error:', err);
  // Start server even without database connection for development
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (without database)`);
  });
});