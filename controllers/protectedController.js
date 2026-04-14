const getDashboard = (req, res) => {
    // req.user is set by the authMiddleware
    res.status(200).json({
        success: true,
        message: 'Welcome to your dashboard',
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
        }
    });
};

const getAdminPanel = (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the admin panel. Only admins can see this message.',
        adminId: req.user._id
    });
};

module.exports = {
    getDashboard,
    getAdminPanel
};
