const express = require('express');
const { getDashboard, getAdminPanel } = require('../controllers/protectedController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Route accessible to any logged-in user
router.get('/dashboard', protect, getDashboard);

// Route accessible ONLY to users with the 'admin' role
router.get('/admin', protect, authorize('admin'), getAdminPanel);

module.exports = router;
