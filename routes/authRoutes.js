const express = require('express');
const { check } = require('express-validator');
const { register, login, logout } = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('password', 'Password must be strong (contain letters, numbers, and special chars)')
            .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/) // Bonus: password strength
    ],
    register
);

router.post(
    '/login',
    loginLimiter, // Apply rate limiter to prevent brute force
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    login
);

// We protect the logout route to ensure only logged in users can "log out"
router.post('/logout', protect, logout);

module.exports = router;
