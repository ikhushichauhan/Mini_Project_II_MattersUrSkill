const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

connectDB();

const app = express();
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
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? configuredOrigins
  : [...new Set([...configuredOrigins, ...devOrigins])];

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/tasks',     require('./routes/taskRoutes'));
app.use('/api/workers',   require('./routes/workerRoutes'));
app.use('/api/providers', require('./routes/providerRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));
app.use('/api/jobs',      require('./routes/jobRoutes'));
app.use('/api/chat',      require('./routes/chatRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'MattersUrSkill API is running...' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    ` MattersUrSkill server running in ${
      process.env.NODE_ENV
    } mode on port ${PORT}`
  );
});