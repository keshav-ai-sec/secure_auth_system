const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Constants ──────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// ── Schema ─────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false, // Don't return password by default in queries
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0,
    },
    lockUntil: {
        type: Number,
        default: null,
    },
}, { timestamps: true });

// ── Virtual: Check if the account is currently locked ──────────────
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Instance Method: Compare entered password against stored hash ──
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ── Instance Method: Increment login failures and lock if needed ───
UserSchema.methods.incrementLoginAttempts = async function () {
    // If a previous lock has expired, reset attempts and remove the lock
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 },
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock the account if we've reached the max attempts
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
        updates.$set = { lockUntil: Date.now() + LOCK_DURATION_MS };
    }

    return this.updateOne(updates);
};

// ── Instance Method: Reset login attempts on successful login ──────
UserSchema.methods.resetLoginAttempts = async function () {
    return this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
    });
};

// ── Export constants alongside the model for reuse ─────────────────
const User = mongoose.model('User', UserSchema);

module.exports = User;
module.exports.MAX_LOGIN_ATTEMPTS = MAX_LOGIN_ATTEMPTS;
module.exports.LOCK_DURATION_MS = LOCK_DURATION_MS;
