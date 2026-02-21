const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(cors()); // To allow cross-origin requests from your frontend

// Basic Route for testing the server
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'UrbanNest API is running!' });
});

// Route Config
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const aiRoutes = require('./routes/ai-features');

// Use Routes
app.use('/api/users', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/ai', aiRoutes);

// ============================================
// Database Connection and Server Start
// ============================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/urbannest'; // Local MongoDB fallback

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');

        // Start the server only after successfully connecting to the database
        app.listen(PORT, () => {
            console.log(`🚀 Server is listening on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error connecting to MongoDB:', error.message);
        console.error('Make sure your MongoDB server is running or your connection string is correct.');
    });
