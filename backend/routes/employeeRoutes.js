const express = require('express');
const router = express.Router();

const {
  getEmployees,
  getEmployeeById,
  getMyEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

const {
  authenticateToken,
  requireRole
} = require('../middleware/authMiddleware');

// Employee → own profile
router.get('/me', authenticateToken, requireRole('EMPLOYEE'), getMyEmployee);

// HR → all employees
router.get('/', authenticateToken, requireRole('HR'), getEmployees);

// HR → specific employee
router.get('/:id', authenticateToken, requireRole('HR'), getEmployeeById);

// HR → create
router.post('/', authenticateToken, requireRole('HR'), createEmployee);

// HR → update
router.put('/:id', authenticateToken, requireRole('HR'), updateEmployee);

// HR → delete
router.delete('/:id', authenticateToken, requireRole('HR'), deleteEmployee);

module.exports = router;