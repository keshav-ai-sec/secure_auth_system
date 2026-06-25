const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// ── Constants ──────────────────────────────────────────────────────
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '1h';

// ── Helper: Generate a signed JWT ──────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
    });
};

// ── Helper: Format user data for API responses (no password leak) ──
const sanitizeUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
});

// ================= REGISTER =================
const register = async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // SECURITY: The 'role' field is intentionally NOT accepted from the
    // request body. Allowing users to self-assign roles (e.g., "admin")
    // is a privilege-escalation vulnerability. Admin accounts should be
    // created through a separate, protected admin workflow or a seed script.

    try {
        // Check if a user with this email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash the password before storing it
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the user — role defaults to 'user' via the schema
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: sanitizeUser(user),
        });

    } catch (error) {
        console.error('REGISTER ERROR:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ================= LOGIN =================
const login = async (req, res) => {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Explicitly select password because it has select:false in the schema
        const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if the account is currently locked
        if (user.isLocked) {
            const remainingMs = user.lockUntil - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            return res.status(423).json({
                error: `Account is locked. Try again in ${remainingMin} minute(s).`,
            });
        }

        // Compare the entered password against the stored hash
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            // Increment failed login attempts (may trigger account lock)
            await user.incrementLoginAttempts();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Successful login — reset any accumulated failed attempts
        await user.resetLoginAttempts();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: sanitizeUser(user),
        });

    } catch (error) {
        console.error('LOGIN ERROR:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

// ================= LOGOUT =================
// NOTE: With stateless JWTs, true server-side invalidation requires a
// token blacklist (e.g., stored in Redis). For this implementation,
// logout is handled client-side by deleting the token from storage.
// This endpoint exists as a semantic signal and logging hook.
const logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Logged out successfully. Remove token from client storage.',
    });
};

module.exports = {
    register,
    login,
    logout,
};