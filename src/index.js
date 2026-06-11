import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Config & Middleware
import connectDB from './config/db.js';
import env from './config/env.js';
import errorHandler from './middleware/error.js';
import { defaultLimiter } from './middleware/rateLimit.js';
import { requestLogger } from './config/logger.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import campaignRoutes from './modules/campaigns/campaigns.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import voteRoutes from './routes/votes.js';
import walletRoutes from './routes/wallet.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Database connection
connectDB();

// 2. Middleware
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(defaultLimiter);

// 3. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 4. Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/wallet', walletRoutes);

// 5. 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// 6. Error handling (Must be last)
app.use(errorHandler);

// 7. Start Server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Auth API: http://localhost:${PORT}/api/auth`);
  console.log(` Campaigns: http://localhost:${PORT}/api/campaigns`);
  console.log(` Admin: http://localhost:${PORT}/api/admin`);
  console.log(` Votes: http://localhost:${PORT}/api/votes`);
  console.log(` Wallet: http://localhost:${PORT}/api/wallet`);
});