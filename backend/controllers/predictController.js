const { predictAttrition } = require('../services/mlService');
const employeeRepo = require('../data/employeeRepo');

async function predictAttritionHandler(req, res) {
  try {
    let payload;

    if (req.user.role === 'HR') {
      // HR can submit attributes for any employee.
      payload = req.body;

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return res.status(400).json({
          success: false,
          message: 'Employee attributes are required for prediction'
        });
      }
    } else if (req.user.role === 'EMPLOYEE') {
      // Employees can predict only from their own saved profile.
      if (!req.user.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Your account is not linked to an employee record'
        });
      }

      const employee = await employeeRepo.getByEmployeeId(
        req.user.employeeId
      );

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Your employee profile was not found'
        });
      }

      payload = {
        age: employee.age,
        experience: employee.experience,
        yearsAtCompany: employee.yearsAtCompany,
        monthlyIncome: employee.monthlyIncome,
        jobSatisfaction: employee.jobSatisfaction,
        workLifeBalance: employee.workLifeBalance,
        performanceRating: employee.performanceRating,
        trainingHours: employee.trainingHours,
        overtime: employee.overtime
      };
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to run predictions'
      });
    }

    const prediction = await predictAttrition(payload);

    return res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('predictAttritionHandler error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to evaluate attrition prediction'
    });
  }
}

module.exports = {
  predictAttritionHandler
};