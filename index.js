const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 1000;

// 2. MIDDLEWARE
app.use(cors());
app.use(express.json());

// 3. MOUNT ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // Mounting user routes

// Test Upload Route 
const upload = require('./config/multer');
app.post("/api/test-upload", (req, res) => {
    upload.single("image")(req, res, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (!req.file) return res.status(400).json({ message: "No file" });
        res.status(200).json({ imageUrl: req.file.path });
    });
});

// Health Check Route
app.get("/", (req, res) => {
    res.json({ 
        message: "Quorum Backend is running 🚀",
        status: "OK"
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Quorum server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;