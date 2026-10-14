const express = require('express');
const router = express.Router();

const {
  predictAttritionHandler
} = require('../controllers/predictController');

const {
  authenticateToken
} = require('../middleware/authMiddleware');

// Authenticated users only - Attrition Prediction
router.post(
  '/',
  authenticateToken,
  predictAttritionHandler
);

module.exports = router;