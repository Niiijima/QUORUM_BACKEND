import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './src/lib/prisma.js';

// Imports
import authRoutes from './src/modules/auth/auth.routes.js'; 
import voteRoutes from './src/routes/votes.js';
import userRoutes from './src/models/user.js'; 
import campaignRoutes from './src/models/campaign.js'; 
import upload from './src/config/multer.js';
import './src/config/cloudinary.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - Standardized to use /api prefix
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/auth', authRoutes); // Login now at /api/auth/login
app.use('/api/votes', voteRoutes);

// Test Route
app.post("/api/test-upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    res.status(200).json({ imageUrl: req.file.path });
});

app.get("/", (req, res) => res.send("Quorum Backend is running"));

// Global Error Handler
app.use((err, req, res, next) => {
    // This logs the full error to your Render dashboard
    console.error("--- SERVER ERROR ---");
    console.error(err); 
    
    res.status(500).json({ 
        message: "Internal Server Error",
        error: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong"
    });
});

// Start Server
const PORT = process.env.PORT || 2000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Auth API: http://localhost:${PORT}/api/auth/login`);
    });
}

export { app };