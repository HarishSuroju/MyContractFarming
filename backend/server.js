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
const messageRoutes = require('./routes/messages');

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

  // Join room with user ID for targeted events (e.g., calls, notifications)
  socket.on('join', (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  /**
   * WebRTC signaling events for 1-to-1 calls
   * Payload shapes (all string IDs, plain objects):
   * - call-user:   { to, from, offer, hasVideo }
   * - answer-call: { to, from, answer }
   * - ice-candidate: { to, from, candidate }
   * - end-call:    { to, from, reason }
   * - reject-call: { to, from }
   */

  // Caller initiates a call to another user
  socket.on('call-user', (payload) => {
    try {
      const { to, from, offer, hasVideo } = payload || {};
      if (!to || !from || !offer) return;

      io.to(to).emit('incoming-call', {
        from,
        offer,
        hasVideo: !!hasVideo,
      });
    } catch (err) {
      console.error('Error handling call-user:', err);
    }
  });

  // Callee accepts the call and sends WebRTC answer
  socket.on('answer-call', (payload) => {
    try {
      const { to, from, answer } = payload || {};
      if (!to || !from || !answer) return;

      io.to(to).emit('call-answered', {
        from,
        answer,
      });
    } catch (err) {
      console.error('Error handling answer-call:', err);
    }
  });

  // Relay ICE candidates between peers
  socket.on('ice-candidate', (payload) => {
    try {
      const { to, from, candidate } = payload || {};
      if (!to || !from || !candidate) return;

      io.to(to).emit('ice-candidate', {
        from,
        candidate,
      });
    } catch (err) {
      console.error('Error handling ice-candidate:', err);
    }
  });

  // Either party ends an active call
  socket.on('end-call', (payload) => {
    try {
      const { to, from, reason } = payload || {};
      if (!to || !from) return;

      io.to(to).emit('call-ended', {
        from,
        reason: reason || 'Call ended',
      });
    } catch (err) {
      console.error('Error handling end-call:', err);
    }
  });

  // Callee rejects an incoming call before answering
  socket.on('reject-call', (payload) => {
    try {
      const { to, from } = payload || {};
      if (!to || !from) return;

      io.to(to).emit('call-rejected', {
        from,
      });
    } catch (err) {
      console.error('Error handling reject-call:', err);
    }
  });

  /**
   * Real-time messaging events
   * Payload shapes:
   * - send-message: { to, from, content }
   * - typing: { to, from, isTyping }
   * - message-delivered: { messageId, to, from }
   * - message-read: { messageId, to, from }
   */

  // Send real-time message
  socket.on('send-message', (payload) => {
    try {
      const { to, from, content, messageId } = payload || {};
      if (!to || !from || !content) return;

      // Emit to recipient
      io.to(to).emit('receive-message', {
        from,
        content,
        messageId,
        timestamp: new Date()
      });

      // Emit delivery confirmation to sender
      socket.emit('message-delivered', {
        messageId,
        to,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error handling send-message:', err);
    }
  });

  // Handle typing indicators
  socket.on('typing', (payload) => {
    try {
      const { to, from, isTyping } = payload || {};
      if (!to || !from) return;

      io.to(to).emit('user-typing', {
        from,
        isTyping,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error handling typing:', err);
    }
  });

  // Handle message read status
  socket.on('message-read', (payload) => {
    try {
      const { to, from, messageId } = payload || {};
      if (!to || !from || !messageId) return;

      io.to(to).emit('message-read-confirmation', {
        messageId,
        from,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error handling message-read:', err);
    }
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
app.use('/api/messages', messageRoutes);

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