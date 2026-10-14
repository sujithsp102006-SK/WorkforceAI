const express = require('express');
const router = express.Router();

const {
  login,
  getMe
} = require('../controllers/authController');

const {
  authenticateToken
} = require('../middleware/authMiddleware');

// Login
router.post('/login', login);

// Current logged-in user
router.get('/me', authenticateToken, getMe);

module.exports = router;