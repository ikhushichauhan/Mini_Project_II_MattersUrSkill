const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ['polling'],
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      if (origin.endsWith('.eu.cc')) return callback(null, true);
      const allowedOrigins = (process.env.CLIvENT_URL || 'http://localhost:3000')
        .split(',').map(o => o.trim());
      allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS blocked'));
    },
    credentials: true,
  },
});
const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const devOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];
const allowedOrigins = [...new Set([...configuredOrigins, ...devOrigins])];

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin.endsWith('.eu.cc')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight BEFORE all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/tasks',     require('./routes/taskRoutes'));
app.use('/api/workers',   require('./routes/workerRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/jobs',      require('./routes/jobRoutes'));
app.use('/api/chat',      require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.set('io', io);

app.get('/', (req, res) => {
  res.json({ message: 'MattersUrSkill API is running...' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register_user', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('join_chat', (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`Socket ${socket.id} joined task_${taskId}`);
  });

  socket.on('send_message', async (data) => {
    const { taskId, sender, receiver, message } = data;
    try {
      const Message = require('./models/Message');
      const newMessage = await Message.create({
        sender,
        receiver,
        task: taskId,
        message,
      });
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name profileImage')
        .populate('receiver', 'name profileImage');

      io.to(`task_${taskId}`).emit('receive_message', populatedMessage);

      const receiverSocketId = userSockets.get(receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_notification', {
          type: 'NEW_MESSAGE',
          message: `New message from ${populatedMessage.sender.name}`,
          link: `/job/${taskId}`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

app.set('userSockets', userSockets);

server.listen(PORT, () => {
  console.log(
    ` MattersUrSkill server running in ${
      process.env.NODE_ENV
    } mode on port ${PORT}`
  );
});