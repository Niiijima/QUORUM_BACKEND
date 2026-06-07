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
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quorum Backend API Documentation',
      version: '1.0.0',
      description: 'API Documentation for the Quorum full-stack architecture application',
    },
    servers: [
      {
        url: 'http://localhost:2000',
        description: 'Local Development Server',
      },
    ],
  },
  
  apis: ['./index.js', './src/routes/*.js'], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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