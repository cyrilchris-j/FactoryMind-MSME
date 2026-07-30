import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) or matched origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FactoryMind AI API', version: '1.0.0' });
});

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🏭 FactoryMind AI API running on http://localhost:${PORT}`);
});

export default app;
