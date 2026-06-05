import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import dns from 'node:dns';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Configure DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Import voting routes (ES module)
import voteRoutes from './src/routes/votes.js';

const url = process.env.MONGO_URL;

// Connect MongoDB Atlas
mongoose
    .connect(url)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ Connection error: ", err));

// Connect Cloudinary
import './config/cloudinary.js';

const app = express();
app.use(cors());
app.use(express.json());

// Use voting routes
app.use('/api/votes', voteRoutes);

// Multer middleware & temporary test route
import upload from './config/multer.js';
app.post("/api/test-upload", (req, res) => {
    upload.single("image")(req, res, function (err) {
        if (err) {
            console.error("❌ MULTER-CLOUDINARY PIPELINE CRASH:", err);
            return res.status(500).json({ 
                message: "Pipeline Error encountered", 
                errorDetails: err.message || err.toString() 
            });
        }
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded!" });
        }
        res.status(200).json({
            message: "Upload successful!",
            imageUrl: req.file.path 
        });
    });
});

app.get("/", (req, res) => {
    res.send("Hello world");
});

const port = process.env.PORT || 2000;
app.listen(port, () => {
    console.log(`Quorum server is running on port ${port}`);
    console.log(`Voting API: http://localhost:${port}/api/votes`);
});
