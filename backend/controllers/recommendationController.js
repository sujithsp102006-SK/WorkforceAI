require('dotenv').config();

const employeeRepo = require('../data/employeeRepo');
const { mapSkills } = require('../services/skillEngine');
const serpApiService = require('../services/serpApiService');

function checkSerpApiKeyConfigured() {
  return serpApiService.isApiKeyConfigured();
}

// GET /api/recommendations/:employeeId
async function getRecommendationsForEmployee(req, res) {
  try {
    const { employeeId } = req.params;
    let employee;

    // HR can request recommendations for any employee.
    if (req.user.role === 'HR') {
      employee = await employeeRepo.getById(employeeId);
    } else if (req.user.role === 'EMPLOYEE') {
      // Employees can access only their own recommendations.
      if (!req.user.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'Your account is not linked to an employee record'
        });
      }

      if (employeeId !== req.user.employeeId) {
        return res.status(403).json({
          success: false,
          message: 'You can access only your own recommendations'
        });
      }

      employee = await employeeRepo.getByEmployeeId(req.user.employeeId);
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const requestedTargetRole =
      typeof req.query.targetRole === 'string'
        ? req.query.targetRole.trim()
        : '';

    const targetRole =
      requestedTargetRole ||
      employee.targetRole ||
      employee.jobRole ||
      'Full Stack Developer';

    const skillMapping = mapSkills(employee.skills || [], targetRole);

    const [jobsData, coursesData, certificationsData] = await Promise.all([
      serpApiService.getJobRecommendations(targetRole),
      serpApiService.getCourseRecommendations(skillMapping.missingSkills),
      serpApiService.getCertificationRecommendations(
        skillMapping.missingSkills,
        targetRole
      )
    ]);

    return res.json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          employeeId: employee.employeeId,
          name: employee.name,
          currentRole: employee.jobRole,
          targetRole,
          department: employee.department
        },
        skillGaps: skillMapping.missingSkills,
        matchedSkills: skillMapping.matchedSkills,
        matchPercentage: skillMapping.matchPercentage,
        jobs: jobsData,
        courses: coursesData,
        certifications: certificationsData,
        metadata: {
          serpApiKeyConfigured: checkSerpApiKeyConfigured(),
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('getRecommendationsForEmployee error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error generating recommendations'
    });
  }
}

// POST /api/recommendations/search
// Custom job/course/certification search
async function searchLiveResources(req, res) {
  try {
    const {
      query,
      category = 'all',
      targetRole = '',
      skills = []
    } = req.body;

    if (
      (query !== undefined && typeof query !== 'string') ||
      (targetRole !== undefined && typeof targetRole !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Query and targetRole must be strings'
      });
    }

    if (!query?.trim() && !targetRole.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query or targetRole is required'
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
    }

    const searchTerm = query.trim() || targetRole.trim();
    const skillsList = [searchTerm];

    for (const skill of skills) {
      if (
        typeof skill === 'string' &&
        skill.trim() &&
        !skillsList.includes(skill.trim())
      ) {
        skillsList.push(skill.trim());
      }
    }

    // Fetch all resources; filter the response by requested category.
    const [jobsData, coursesData, certificationsData] = await Promise.all([
      serpApiService.getJobRecommendations(searchTerm),
      serpApiService.getCourseRecommendations(skillsList),
      serpApiService.getCertificationRecommendations(
        skillsList,
        searchTerm
      )
    ]);

    const normalizedCategory =
      typeof category === 'string' ? category.toLowerCase() : 'all';

    const validCategories = ['all', 'jobs', 'courses', 'certifications'];

    if (!validCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Category must be all, jobs, courses, or certifications'
      });
    }

    const data = {
      query: searchTerm,
      jobs: normalizedCategory === 'all' || normalizedCategory === 'jobs'
        ? jobsData
        : [],
      courses: normalizedCategory === 'all' || normalizedCategory === 'courses'
        ? coursesData
        : [],
      certifications:
        normalizedCategory === 'all' || normalizedCategory === 'certifications'
          ? certificationsData
          : [],
      metadata: {
        serpApiKeyConfigured: checkSerpApiKeyConfigured(),
        timestamp: new Date().toISOString()
      }
    };

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('searchLiveResources error:', error);

    return res.status(500).json({
      success: false,
      message: 'Error executing custom search'
    });
  }
}

module.exports = {
  getRecommendationsForEmployee,
  searchLiveResources
};