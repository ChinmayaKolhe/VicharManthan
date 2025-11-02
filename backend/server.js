const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));
app.use('/api/proposals', require('./routes/proposals'));
app.use('/api/users', require('./routes/users'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/chats', require('./routes/chats'));

// Socket.io connection
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins
  socket.on('user_connected', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit('user_status', { userId, online: true });
  });

  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    const { chatId, message } = data;
    io.to(chatId).emit('new_message', message);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { chatId, userId } = data;
    socket.to(chatId).emit('user_typing', { userId });
  });

  socket.on('stop_typing', (data) => {
    const { chatId, userId } = data;
    socket.to(chatId).emit('user_stop_typing', { userId });
  });

  // New notification
  socket.on('send_notification', (data) => {
    const { recipientId, notification } = data;
    const recipientSocketId = activeUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_notification', notification);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit('user_status', { userId: socket.userId, online: false });
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
