const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Security Middleware ────────────────────────────────────────────
// Configure Helmet with a relaxed Content Security Policy so our
// frontend can load Google Fonts and use inline styles/scripts.
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
        },
    },
}));
app.use(cors());                   // Enable Cross-Origin Resource Sharing

// ── Logging ────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));        // HTTP request logger (disabled in tests)
}

// ── Body Parsing ───────────────────────────────────────────────────
app.use(express.json());          // Parse incoming JSON payloads

// ── Serve Frontend Static Files ────────────────────────────────────
// Everything in the public/ folder is served as static assets.
// This is how the GUI (HTML, CSS, JS) is delivered to the browser.
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/protectedRoutes'));

// ── Health Check (API) ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Secure Auth API is running',
    });
});

// ── Fallback: Serve login page for root URL ────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ── Global Error Handler ───────────────────────────────────────────
// Express identifies error-handling middleware by the 4-param signature.
app.use((err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const response = { error: 'Internal Server Error' };

    // Only expose error details in development to prevent information leakage
    if (process.env.NODE_ENV !== 'production') {
        response.message = err.message;
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
});

// ── Start Server ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GUI available at http://localhost:${PORT}`);
});

module.exports = app; // Export for testing
