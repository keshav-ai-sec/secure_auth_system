const rateLimit = require('express-rate-limit');

// ── Constants ──────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_MAX_ATTEMPTS = 5;
const API_MAX_REQUESTS = 100;

// ── Login Limiter ──────────────────────────────────────────────────
// Strict limiter for the login endpoint to prevent brute-force attacks.
// Limits each IP address to a small number of attempts per window.
const loginLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: LOGIN_MAX_ATTEMPTS,
    message: {
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable deprecated `X-RateLimit-*` headers
});

// ── General API Limiter ────────────────────────────────────────────
// Broader limiter applied to all other API endpoints to prevent abuse.
const apiLimiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: API_MAX_REQUESTS,
    message: {
        error: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    apiLimiter,
};
