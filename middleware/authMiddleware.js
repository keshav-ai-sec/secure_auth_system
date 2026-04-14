const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token provided' });
    }

    try {
        // Verify token (synchronous function, throws on error/expiry)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Append the user info to the request object (excluding password)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Not authorized, token failed' });
    }
};

module.exports = { protect };
