const express = require('express');
const router = express.Router();

const {
  getRecommendationsForEmployee,
  searchLiveResources
} = require('../controllers/recommendationController');

const {
  authenticateToken
} = require('../middleware/authMiddleware');

// Authenticated users only - Employee recommendations
router.get(
  '/:employeeId',
  authenticateToken,
  getRecommendationsForEmployee
);

// Authenticated users only - Live job/course search
router.post(
  '/search',
  authenticateToken,
  searchLiveResources
);

module.exports = router;