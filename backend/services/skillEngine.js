const rolesCatalog = require('../data/rolesCatalog');

/**
 * Computes skill gaps and learning path between current skills and target role
 */
function mapSkills(currentSkills = [], targetRoleName = '') {
  const currentNormalized = (currentSkills || []).map((s) => s.trim().toLowerCase());
  
  // Find role in catalog or fallback
  const roleData = rolesCatalog[targetRoleName] || {
    department: 'General',
    requiredSkills: ['Problem Solving', 'Communication', 'Project Management'],
    description: `Specialized position in ${targetRoleName || 'the enterprise'}`
  };

  const required = roleData.requiredSkills || [];
  
  const matchedSkills = [];
  const missingSkills = [];

  required.forEach((reqSkill) => {
    const isMatched = currentNormalized.includes(reqSkill.toLowerCase());
    if (isMatched) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequired = required.length || 1;
  const matchPercentage = Math.round((matchedSkills.length / totalRequired) * 100);

  // Generate structured learning path for missing skills
  const recommendedLearning = missingSkills.map((skill) => {
    return {
      skill,
      priority: getSkillPriority(skill, targetRoleName),
      estimatedWeeks: getEstimatedWeeks(skill),
      recommendedCourses: [
        `${skill} Fundamentals & Industry Application`,
        `Advanced ${skill} Hands-on Masterclass`
      ],
      recommendedCertifications: [
        `Certified Professional in ${skill}`,
        `Associate ${skill} Practitioner`
      ]
    };
  });

  return {
    targetRole: targetRoleName,
    department: roleData.department,
    description: roleData.description,
    currentSkills,
    requiredSkills: required,
    matchedSkills,
    missingSkills,
    matchPercentage,
    recommendedLearning
  };
}

function getSkillPriority(skill, targetRole) {
  const highPriorityKeywords = ['python', 'react', 'machine learning', 'sql', 'aws', 'docker', 'statistics'];
  if (highPriorityKeywords.some((kw) => skill.toLowerCase().includes(kw))) {
    return 'HIGH';
  }
  return 'MEDIUM';
}

function getEstimatedWeeks(skill) {
  const complex = ['Machine Learning', 'Deep Learning', 'System Architecture', 'Kubernetes', 'Statistics'];
  return complex.includes(skill) ? 6 : 3;
}

module.exports = {
  mapSkills,
  getAvailableRoles: () => Object.keys(rolesCatalog)
};
