import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import voteRoutes from './src/routes/votes.js';
import upload from './config/multer.js';
import './config/cloudinary.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/votes', voteRoutes);



// Test Route
app.post("/api/test-upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    res.status(200).json({ imageUrl: req.file.path });
});

app.get("/", (req, res) => res.send("Quorum Backend is running"));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 2000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export { app };