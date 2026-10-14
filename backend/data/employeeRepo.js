const fs = require('fs');
const { getIsMongo, storeFilePath } = require('../config/db');
const Employee = require('../models/Employee');
const sampleEmployees = require('./seedData');
const rolesCatalog = require('./rolesCatalog');

function readJsonStore() {
  try {
    if (!fs.existsSync(storeFilePath)) {
      writeJsonStore(sampleEmployees);
      return [...sampleEmployees];
    }
    const raw = fs.readFileSync(storeFilePath, 'utf8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.length === 0) {
      writeJsonStore(sampleEmployees);
      return [...sampleEmployees];
    }
    return data;
  } catch (err) {
    console.error('Error reading JSON store:', err);
    return [...sampleEmployees];
  }
}

function writeJsonStore(items) {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON store:', err);
  }
}

class EmployeeRepository {
  async initSeed() {
    if (getIsMongo()) {
      const count = await Employee.countDocuments();
      if (count === 0) {
        console.log('[Seed] Seeding MongoDB with initial employee catalog...');
        await Employee.insertMany(sampleEmployees);
        console.log(`[Seed] Seeded ${sampleEmployees.length} employees into MongoDB.`);
      }
    } else {
      const current = readJsonStore();
      if (current.length === 0) {
        writeJsonStore(sampleEmployees);
      }
    }
  }

  async getAll({ q, department, riskLevel, jobRole } = {}) {
    if (getIsMongo()) {
      const filter = {};
      if (department && department !== 'All') {
        filter.department = department;
      }
      if (riskLevel && riskLevel !== 'All') {
        filter.riskLevel = riskLevel;
      }
      if (jobRole && jobRole !== 'All') {
        filter.jobRole = jobRole;
      }
      if (q && q.trim()) {
        const queryRegex = new RegExp(q.trim(), 'i');
        filter.$or = [
          { name: queryRegex },
          { employeeId: queryRegex },
          { jobRole: queryRegex },
          { department: queryRegex }
        ];
      }
      return await Employee.find(filter).sort({ createdAt: -1 });
    } else {
      let employees = readJsonStore();

      if (department && department !== 'All') {
        employees = employees.filter((e) => e.department.toLowerCase() === department.toLowerCase());
      }
      if (riskLevel && riskLevel !== 'All') {
        employees = employees.filter((e) => e.riskLevel === riskLevel);
      }
      if (jobRole && jobRole !== 'All') {
        employees = employees.filter((e) => e.jobRole.toLowerCase() === jobRole.toLowerCase());
      }
      if (q && q.trim()) {
        const term = q.trim().toLowerCase();
        employees = employees.filter((e) =>
          (e.name && e.name.toLowerCase().includes(term)) ||
          (e.employeeId && e.employeeId.toLowerCase().includes(term)) ||
          (e.jobRole && e.jobRole.toLowerCase().includes(term)) ||
          (e.department && e.department.toLowerCase().includes(term))
        );
      }
      return employees;
    }
  }

  async getById(id) {
    if (getIsMongo()) {
      let employee = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        employee = await Employee.findById(id);
      }
      if (!employee) {
        employee = await Employee.findOne({ employeeId: id });
      }
      return employee;
    } else {
      const employees = readJsonStore();
      return (
        employees.find((e) => e._id === id || e.employeeId === id) || null
      );
    }
  }
  async getById(id) {
  if (getIsMongo()) {
    let employee = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      employee = await Employee.findById(id);
    }

    if (!employee) {
      employee = await Employee.findOne({ employeeId: id });
    }

    return employee;
  } else {
    const employees = readJsonStore();

    return (
      employees.find(
        (e) => e._id === id || e.employeeId === id
      ) || null
    );
  }
}


async getByEmployeeId(employeeId) {
  if (getIsMongo()) {
    return await Employee.findOne({ employeeId });
  }

  const employees = readJsonStore();

  return (
    employees.find(
      (e) => e.employeeId === employeeId
    ) || null
  );
}

  async create(data) {
    if (getIsMongo()) {
      const newEmp = new Employee(data);
      return await newEmp.save();
    } else {
      const employees = readJsonStore();
      const newEmp = {
        _id: 'emp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        employeeId: data.employeeId || 'EMP-' + (1000 + employees.length + 1),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      employees.unshift(newEmp);
      writeJsonStore(employees);
      return newEmp;
    }
  }

  async update(id, data) {
    if (getIsMongo()) {
      let emp = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        emp = await Employee.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      }
      if (!emp) {
        emp = await Employee.findOneAndUpdate({ employeeId: id }, data, { new: true, runValidators: true });
      }
      return emp;
    } else {
      const employees = readJsonStore();
      const index = employees.findIndex((e) => e._id === id || e.employeeId === id);
      if (index === -1) return null;

      employees[index] = {
        ...employees[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      writeJsonStore(employees);
      return employees[index];
    }
  }

  async delete(id) {
    if (getIsMongo()) {
      let result = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        result = await Employee.findByIdAndDelete(id);
      }
      if (!result) {
        result = await Employee.findOneAndDelete({ employeeId: id });
      }
      return !!result;
    } else {
      const employees = readJsonStore();
      const initialLen = employees.length;
      const filtered = employees.filter((e) => e._id !== id && e.employeeId !== id);
      if (filtered.length !== initialLen) {
        writeJsonStore(filtered);
        return true;
      }
      return false;
    }
  }

  async getDashboardStats() {
    const employees = await this.getAll();
    const total = employees.length;

    let highRiskCount = 0;
    let medRiskCount = 0;
    let lowRiskCount = 0;
    let unassessedCount = 0;

    const deptCounts = {};
    let totalSkillGapsCount = 0;
    let totalSatisfaction = 0;
    let totalTenure = 0;

    employees.forEach((emp) => {
      // Risk counts
      if (emp.riskLevel === 'HIGH') highRiskCount++;
      else if (emp.riskLevel === 'MEDIUM') medRiskCount++;
      else if (emp.riskLevel === 'LOW') lowRiskCount++;
      else unassessedCount++;

      // Dept distribution
      const dept = emp.department || 'Other';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;

      // Stats
      totalSatisfaction += Number(emp.jobSatisfaction) || 3;
      totalTenure += Number(emp.yearsAtCompany) || 0;

      // Skill Gaps computation
      const target = emp.targetRole || emp.jobRole;
      if (target && rolesCatalog[target]) {
        const required = rolesCatalog[target].requiredSkills || [];
        const empSkills = (emp.skills || []).map((s) => s.toLowerCase());
        const missing = required.filter((r) => !empSkills.includes(r.toLowerCase()));
        totalSkillGapsCount += missing.length;
      }
    });

    const highRiskEmployees = employees
      .filter((e) => e.riskLevel === 'HIGH')
      .slice(0, 6);

    const departmentDistribution = Object.keys(deptCounts).map((dept) => ({
      name: dept,
      count: deptCounts[dept],
      percentage: total > 0 ? Math.round((deptCounts[dept] / total) * 100) : 0
    }));

    return {
      totalEmployees: total,
      highRiskCount,
      mediumRiskCount: medRiskCount,
      lowRiskCount,
      unassessedCount,
      totalSkillGapsCount,
      averageSatisfaction: total > 0 ? +(totalSatisfaction / total).toFixed(1) : 3.0,
      averageTenureYears: total > 0 ? +(totalTenure / total).toFixed(1) : 0.0,
      departmentDistribution,
      riskDistribution: [
        { label: 'High Risk', count: highRiskCount, color: '#ef4444' },
        { label: 'Medium Risk', count: medRiskCount, color: '#f59e0b' },
        { label: 'Low Risk', count: lowRiskCount, color: '#10b981' }
      ],
      recentHighRiskEmployees: highRiskEmployees
    };
  }
}

module.exports = new EmployeeRepository();
