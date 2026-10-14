const express = require('express');
const router = express.Router();

const {
  getSkillsForEmployee,
  recommendSkills,
  getRolesCatalogHandler
} = require('../controllers/skillController');

const {
  authenticateToken
} = require('../middleware/authMiddleware');

// Authenticated users only - Roles catalog
router.get(
  '/roles/catalog',
  authenticateToken,
  getRolesCatalogHandler
);

// Authenticated users only - Employee skills
router.get(
  '/:employeeId',
  authenticateToken,
  getSkillsForEmployee
);

// Authenticated users only - Skill recommendations
router.post(
  '/recommend',
  authenticateToken,
  recommendSkills
);

module.exports = router;