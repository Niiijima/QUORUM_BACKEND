const fs = require('fs');
const path = require('path');

require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);  

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const url = process.env.MONGO_URL;

// Connect MongoDB Atlas
mongoose
    .connect(url)
    .then(() => console.log(" Mongodb Connected Successfully"))
    .catch((err) => console.log(" Connection error: ", err));

// Connect Cloudinary
require('./config/cloudinary');

const app = express();
app.use(cors());
app.use(express.json());


// Multer middleware & temporary test route
const upload = require('./config/multer');
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