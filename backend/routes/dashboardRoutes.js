const express = require('express');
const router = express.Router();

const { getDashboardStats } = require('../controllers/dashboardController');

const {
  authenticateToken,
  requireRole
} = require('../middleware/authMiddleware');

// HR only - Dashboard statistics
router.get(
  '/stats',
  authenticateToken,
  requireRole('HR'),
  getDashboardStats
);

module.exports = router;