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
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const voteRoutes = require('./routes/voteRoutes');   
const authRoutes = require('./routes/authRoutes');

const url = process.env.MONGO_URL;


const upload = require('./config/multer');


mongoose
    .connect(url)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("Connection error: ", err));




const app = express();


app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many requests from this IP, please try again after 15 minutes."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));


app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/votes', voteRoutes); 
app.use('/api/auth', authRoutes);

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.post("/api/test-upload", (req, res) => {
    upload.single("image")(req, res, function (err) {
        if (err) {
            console.error("MULTER-CLOUDINARY PIPELINE CRASH:", err);
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
    res.send("Quorum Server is active.");
});

const port = process.env.PORT || 2000;
app.listen(port, () => {
    console.log(`Quorum server is running on port ${port}`);
    console.log(`Swagger Documentation: http://localhost:${port}/api-docs`);
    console.log(`Voting API: http://localhost:${port}/api/votes`);
});
