require('dotenv').config();
const fs = require('fs');
const path = require('path');


const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);  
const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const voteRoutes = require('./routes/voteRoutes');  

const url = process.env.MONGO_URL;

// Multer middleware & temporary test route
const upload = require('./config/multer');

// Connect MongoDB Atlas
mongoose
    .connect(url)
    .then(() => console.log(" MongoDB Connected Successfully"))
    .catch((err) => console.log(" Connection error: ", err));

// Connect Cloudinary
require('./config/cloudinary');

const app = express();
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
            message: " Upload successful!",
            imageUrl: req.file.path 
        });
    });
});

app.get("/", (req, res) => {
    res.send("Hello world");
});

const port = process.env.PORT || 2000;
app.listen(port, () => {
    console.log(`quorum server is running on port ${port}`);
});