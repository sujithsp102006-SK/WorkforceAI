
import React, { useState, useEffect } from 'react';

const DEPARTMENTS = [
  'Engineering',
  'Data & AI',
  'Sales & Marketing',
  'Human Resources',
  'Product & Design',
  'Finance'
];

const COMMON_ROLES = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager',
  'UX Designer',
  'Cloud Solutions Architect',
  'HR Specialist',
  'Sales Executive'
];

const INITIAL_FORM = {
  employeeId: '',
  name: '',
  email: '',
  password: '',
  age: 29,
  gender: 'Female',
  department: 'Engineering',
  jobRole: 'Software Engineer',
  targetRole: 'Full Stack Developer',
  yearsAtCompany: 2,
  monthlyIncome: 6200,
  jobSatisfaction: 3,
  workLifeBalance: 3,
  overtime: 'No',
  performanceRating: 3,
  skills: 'JavaScript, React, HTML, CSS',
  trainingHours: 20,
  experience: 4
};

export default function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  employee = null
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        ...INITIAL_FORM,
        employeeId: employee.employeeId || '',
        name: employee.name || '',
        age: employee.age ?? 28,
        gender: employee.gender || 'Female',
        department: employee.department || 'Engineering',
        jobRole: employee.jobRole || 'Software Engineer',
        targetRole: employee.targetRole || '',
        yearsAtCompany: employee.yearsAtCompany ?? 0,
        monthlyIncome: employee.monthlyIncome ?? 5000,
        jobSatisfaction: employee.jobSatisfaction ?? 3,
        workLifeBalance: employee.workLifeBalance ?? 3,
        overtime: employee.overtime || 'No',
        performanceRating: employee.performanceRating ?? 3,
        skills: Array.isArray(employee.skills)
          ? employee.skills.join(', ')
          : employee.skills || '',
        trainingHours: employee.trainingHours ?? 20,
        experience: employee.experience ?? 2,
        email: '',
        password: ''
      });
    } else {
      setFormData({
        ...INITIAL_FORM,
        employeeId: 'EMP-' + Math.floor(1000 + Math.random() * 9000)
      });
    }

    setError('');
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? ''
            : Number(value)
          : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide the employee name.');
      return;
    }

    if (!employee) {
      if (!formData.email.trim()) {
        setError('Please provide the employee login email.');
        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
      ) {
        setError('Please enter a valid email address.');
        return;
      }

      if (formData.password.length < 8) {
        setError('Password must contain at least 8 characters.');
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        name: formData.name.trim(),
        skills: formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      };

      if (!employee) {
        payload.email = formData.email.trim().toLowerCase();
      } else {
        delete payload.email;
        delete payload.password;
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to save employee profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none';

  const labelClass =
    'block text-xs font-semibold text-slate-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {employee ? 'Edit Employee Profile' : 'Add New Employee'}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {employee
                ? 'Update workforce variables and re-evaluate attrition risk'
                : 'Create an employee profile and login account'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md text-lg"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Employee details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className={labelClass}>Employee ID *</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                required
                className={inputClass}
              />
            </div>

            {/* Login credentials only for new employees */}
            {!employee && (
              <>
                <div>
                  <label className={labelClass}>
                    Employee Login Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="employee@company.com"
                    autoComplete="off"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Share securely with the employee.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className={labelClass}>Age</label>
              <input
                type="number"
                name="age"
                min="18"
                max="75"
                value={formData.age}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className={inputClass}
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Current Job Role *</label>
              <input
                type="text"
                name="jobRole"
                list="roles-list"
                value={formData.jobRole}
                onChange={handleChange}
                required
                className={inputClass}
              />
              <datalist id="roles-list">
                {COMMON_ROLES.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={labelClass}>
                Target Role (Career Mobility)
              </label>
              <input
                type="text"
                name="targetRole"
                list="roles-list"
                placeholder="e.g. Data Scientist"
                value={formData.targetRole}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Monthly Income ($ USD)
              </label>
              <input
                type="number"
                name="monthlyIncome"
                min="0"
                step="100"
                value={formData.monthlyIncome}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Total Experience (Years)
              </label>
              <input
                type="number"
                name="experience"
                min="0"
                max="50"
                value={formData.experience}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Tenure at Company (Years)
              </label>
              <input
                type="number"
                name="yearsAtCompany"
                min="0"
                max="40"
                value={formData.yearsAtCompany}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Job Satisfaction (1–4)
              </label>
              <select
                name="jobSatisfaction"
                value={formData.jobSatisfaction}
                onChange={handleChange}
                className={inputClass}
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Medium</option>
                <option value={3}>3 - High</option>
                <option value={4}>4 - Very High</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Work-Life Balance (1–4)
              </label>
              <select
                name="workLifeBalance"
                value={formData.workLifeBalance}
                onChange={handleChange}
                className={inputClass}
              >
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Excellent</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Regular Overtime?</label>
              <select
                name="overtime"
                value={formData.overtime}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="No">No - Standard Schedule</option>
                <option value="Yes">Yes - Frequent Overtime</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Performance Rating (1–5)
              </label>
              <select
                name="performanceRating"
                value={formData.performanceRating}
                onChange={handleChange}
                className={inputClass}
              >
                <option value={1}>1 - Below Expectations</option>
                <option value={2}>2 - Needs Improvement</option>
                <option value={3}>3 - Meets Expectations</option>
                <option value={4}>4 - Exceeds Expectations</option>
                <option value={5}>5 - Outstanding</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Annual Training Hours
              </label>
              <input
                type="number"
                name="trainingHours"
                min="0"
                max="200"
                value={formData.trainingHours}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className={labelClass}>
              Current Skills (Comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Python, SQL, Statistics, Tableau"
              className={`${inputClass} font-mono`}
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used by the Skill Gap Engine to benchmark against target role requirements.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                {employee
                  ? 'Save Changes & Update Risk'
                  : 'Create & Analyze Employee'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
