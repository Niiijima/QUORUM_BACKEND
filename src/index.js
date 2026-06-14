import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dns from 'node:dns'; 
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Config
import connectDB from './config/db.js';
import env from './config/env.js';
import errorHandler from './middleware/error.js';
import { requestLogger } from './config/logger.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import campaignRoutes from './modules/campaigns/campaigns.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import voteRoutes from './routes/votes.js';
import walletRoutes from './routes/wallet.js';


const app = express();
const PORT = process.env.PORT || 2000;

// Database
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(cookieParser());

// Health checks
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Quorum Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/wallet', walletRoutes);


// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path 
  });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});

export default app;