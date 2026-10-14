
const bcrypt = require('bcryptjs');

const employeeRepo = require('../data/employeeRepo');
const userRepo = require('../data/userRepo');
const { predictAttrition } = require('../services/mlService');

// GET /api/employees
async function getEmployees(req, res) {
  try {
    const { q, department, riskLevel, jobRole } = req.query;

    const employees = await employeeRepo.getAll({
      q,
      department,
      riskLevel,
      jobRole
    });

    return res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('getEmployees error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error retrieving employees'
    });
  }
}

// GET /api/employees/:id
async function getEmployeeById(req, res) {
  try {
    const employee = await employeeRepo.getById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    return res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('getEmployeeById error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error retrieving employee details'
    });
  }
}

// GET /api/employees/me
async function getMyEmployee(req, res) {
  try {
    const employeeId = req.user?.employeeId;

    if (!employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Employee account is not linked to an employee record'
      });
    }

    const employee = await employeeRepo.getByEmployeeId(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found'
      });
    }

    return res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('getMyEmployee error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error retrieving your employee profile'
    });
  }
}

// POST /api/employees
// Creates both the employee record and employee login account.
async function createEmployee(req, res) {
  let createdEmployee = null;

  try {
    const body = req.body || {};

    const name = String(body.name || '').trim();
    const department = String(body.department || '').trim();
    const jobRole = String(body.jobRole || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = body.password;

    if (!name || !department || !jobRole) {
      return res.status(400).json({
        success: false,
        message: 'Name, department, and job role are required'
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid employee email is required'
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters'
      });
    }

    // Check duplicate email before creating the employee record.
    const existingUser = await userRepo.findByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Generate an ID if the HR form did not supply one.
    const employeeId =
      String(body.employeeId || '').trim() ||
      `EMP-${Date.now()}`;

    // Predict attrition risk.
    const prediction = await predictAttrition({
      age: body.age ?? 30,
      experience: body.experience ?? 3,
      yearsAtCompany: body.yearsAtCompany ?? 1,
      monthlyIncome: body.monthlyIncome ?? 5000,
      jobSatisfaction: body.jobSatisfaction ?? 3,
      workLifeBalance: body.workLifeBalance ?? 3,
      performanceRating: body.performanceRating ?? 3,
      trainingHours: body.trainingHours ?? 20,
      overtime: body.overtime || 'No'
    });

    const skills = Array.isArray(body.skills)
      ? body.skills
      : typeof body.skills === 'string'
        ? body.skills.split(',').map(skill => skill.trim()).filter(Boolean)
        : [];

    // Never save the plain-text password in the employee record.
    const {
      password: ignoredPassword,
      email: ignoredEmail,
      ...employeeFields
    } = body;

    const newEmployeeData = {
      ...employeeFields,
      employeeId,
      name,
      department,
      jobRole,
      skills,
      riskLevel: prediction.risk || 'LOW',
      riskScore: prediction.probability ?? 0.25,
      riskFactors: prediction.factors || []
    };

    // Step 1: Create the employee record.
    createdEmployee = await employeeRepo.create(newEmployeeData);

    // Step 2: Hash the password and create the login account.
    const passwordHash = await bcrypt.hash(password, 10);

    await userRepo.create({
      name,
      email,
      passwordHash,
      role: 'EMPLOYEE',
      employeeId: createdEmployee.employeeId,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Employee and login account created successfully',
      data: createdEmployee,
      predictionMeta: prediction
    });
  } catch (error) {
    console.error('createEmployee error:', error);

    // If account creation fails, attempt to remove the employee record.
    if (createdEmployee) {
      try {
        await employeeRepo.delete(createdEmployee._id);
      } catch (rollbackError) {
        console.error(
          'Employee rollback failed:',
          rollbackError
        );
      }
    }

    if (
      error.code === 11000 ||
      error.code === 'DUPLICATE_EMAIL' ||
      /already exists/i.test(error.message || '')
    ) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email or employee ID already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to create employee and login account'
    });
  }
}

// PUT /api/employees/:id
async function updateEmployee(req, res) {
  try {
    const id = req.params.id;
    const existing = await employeeRepo.getById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const body = req.body || {};

    const updatedSkills = Array.isArray(body.skills)
      ? body.skills
      : typeof body.skills === 'string'
        ? body.skills.split(',').map(s => s.trim()).filter(Boolean)
        : existing.skills;

    const prediction = await predictAttrition({
      age: body.age ?? existing.age,
      experience: body.experience ?? existing.experience,
      yearsAtCompany: body.yearsAtCompany ?? existing.yearsAtCompany,
      monthlyIncome: body.monthlyIncome ?? existing.monthlyIncome,
      jobSatisfaction: body.jobSatisfaction ?? existing.jobSatisfaction,
      workLifeBalance: body.workLifeBalance ?? existing.workLifeBalance,
      performanceRating: body.performanceRating ?? existing.performanceRating,
      trainingHours: body.trainingHours ?? existing.trainingHours,
      overtime: body.overtime ?? existing.overtime
    });

    // Ignore login credentials if accidentally sent in an edit request.
    const {
      password,
      email,
      ...employeeFields
    } = body;

    const payload = {
      ...employeeFields,
      skills: updatedSkills,
      riskLevel: prediction.risk || existing.riskLevel,
      riskScore: prediction.probability ?? existing.riskScore,
      riskFactors: prediction.factors || existing.riskFactors
    };

    const updated = await employeeRepo.update(id, payload);

    return res.json({
      success: true,
      data: updated,
      predictionMeta: prediction
    });
  } catch (error) {
    console.error('updateEmployee error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error updating employee'
    });
  }
}

// DELETE /api/employees/:id
async function deleteEmployee(req, res) {
  try {
    const id = req.params.id;

    const employee = await employeeRepo.getById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const deleted = await employeeRepo.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Disable the associated account so it cannot log in.
    // This preserves the user record rather than deleting its audit history.
    const linkedUser = await userRepo.findByEmailForEmployee?.(
      employee.employeeId
    );

    if (linkedUser) {
      // Optional helper: only runs if your repository implements it.
      await userRepo.setActive?.(linkedUser._id, false);
    }

    return res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('deleteEmployee error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error deleting employee'
    });
  }
}

module.exports = {
  getEmployees,
  getEmployeeById,
  getMyEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
