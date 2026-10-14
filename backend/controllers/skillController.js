const employeeRepo = require('../data/employeeRepo');
const { mapSkills, getAvailableRoles } = require('../services/skillEngine');
const rolesCatalog = require('../data/rolesCatalog');

// GET /api/skills/:employeeId
async function getSkillsForEmployee(req, res) {
  try {
    const employee = await employeeRepo.getById(req.params.employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const targetRole = employee.targetRole || employee.jobRole || 'Full Stack Developer';
    const mapping = mapSkills(employee.skills || [], targetRole);

    res.json({
      success: true,
      data: {
        employee: {
          employeeId: employee.employeeId,
          name: employee.name,
          currentRole: employee.jobRole,
          department: employee.department
        },
        ...mapping,
        allRoles: getAvailableRoles()
      }
    });
  } catch (error) {
    console.error('getSkillsForEmployee error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving employee skills analysis' });
  }
}

// POST /api/skills/recommend
async function recommendSkills(req, res) {
  try {
    const { currentSkills = [], targetRole = '' } = req.body;
    
    if (!targetRole) {
      return res.status(400).json({ success: false, message: 'targetRole is required' });
    }

    const mapping = mapSkills(currentSkills, targetRole);
    res.json({
      success: true,
      data: mapping
    });
  } catch (error) {
    console.error('recommendSkills error:', error);
    res.status(500).json({ success: false, message: 'Error recommending skills' });
  }
}

// GET /api/skills/roles/catalog
function getRolesCatalogHandler(req, res) {
  res.json({
    success: true,
    roles: Object.keys(rolesCatalog),
    catalog: rolesCatalog
  });
}

module.exports = {
  getSkillsForEmployee,
  recommendSkills,
  getRolesCatalogHandler
};
