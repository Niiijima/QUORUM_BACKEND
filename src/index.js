import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import voteRoutes from './routes/votes.js';
import walletRoutes from './routes/wallet.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(helmet());

// Routes
app.use('/api/votes', voteRoutes);
app.use('/api/wallet', walletRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📌 Voting API: http://localhost:${PORT}/api/votes`);
  console.log(`📌 Wallet API: http://localhost:${PORT}/api/wallet`);
});
