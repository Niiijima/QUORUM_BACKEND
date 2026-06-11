import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Imports
import connectDB from './config/db.js';
import env from './config/env.js';
import errorHandler from './middleware/error.js';
import { defaultLimiter } from './middleware/rateLimit.js';
import { requestLogger } from './config/logger.js';

// Routes

import authRoutes from './modules/auth/auth.routes.js'; 
import campaignRoutes from './modules/campaigns/campaigns.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Database connection
connectDB();

// Middleware
app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(defaultLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route mounting
app.use('/api/auth', authRoutes);           
app.use('/api/campaigns', campaignRoutes);  
app.use('/api/admin', adminRoutes);     

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling
app.use(errorHandler);

export default app;