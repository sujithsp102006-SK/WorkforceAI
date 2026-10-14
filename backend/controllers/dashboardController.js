const employeeRepo = require('../data/employeeRepo');

// GET /api/dashboard/stats
async function getDashboardStats(req, res) {
  try {
    const stats = await employeeRepo.getDashboardStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving dashboard analytics' });
  }
}

module.exports = {
  getDashboardStats
};
