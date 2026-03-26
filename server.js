require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');
const cardRoutes = require('./routes/cards');
const profileRoutes = require('./routes/profile');

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:4321'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set('io', io);

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/auth/login', loginLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/profile', profileRoutes);

// Increase JSON body limit for base64 avatar uploads
app.use('/api/profile/avatar', express.json({ limit: '5mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./db/connection');
    const [rows] = await pool.execute('SELECT 1 AS ok');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.json({ status: 'ok', db: 'error', dbError: err.message, timestamp: new Date().toISOString() });
  }
});

// Socket.io
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('user:join', ({ userId, page }) => {
    socket.join(`user:${userId}`);
    onlineUsers.set(userId, { socketId: socket.id, page, joinedAt: new Date() });
    io.to('admin').emit('users:online', { count: onlineUsers.size, users: Array.from(onlineUsers.entries()) });
  });

  socket.on('admin:join', () => {
    socket.join('admin');
  });

  socket.on('user:navigate', ({ userId, from, to }) => {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).page = to;
    }
    io.to('admin').emit('quiz:live', {
      userId,
      action: `navigated from ${from} to ${to}`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('quiz:start', ({ userId, chapterId }) => {
    io.to('admin').emit('quiz:live', {
      userId,
      chapterId,
      action: 'started quiz',
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    for (const [userId, data] of onlineUsers.entries()) {
      if (data.socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.to('admin').emit('users:online', { count: onlineUsers.size, users: Array.from(onlineUsers.entries()) });
  });
});

const PORT = process.env.PORT || 3001;
if (process.env.VERCEL !== '1') {
  server.listen(PORT, () => {
    console.log(`Cyber Arena backend running on port ${PORT}`);
  });
}

module.exports = app;
