const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security enhancements
app.use(helmet()); // Set security HTTP headers

// Logging
app.use(morgan('dev'));

// Body parser
app.use(express.json()); // Parses JSON payloads

// Mount routes (to be created)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/protectedRoutes'));

// Basic health check route
app.get('/', (req, res) => {
    res.send('Secure Auth API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server Error', message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
