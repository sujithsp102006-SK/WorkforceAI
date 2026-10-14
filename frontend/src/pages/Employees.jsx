import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

const DEPARTMENTS = ['All', 'Engineering', 'Data & AI', 'Sales & Marketing', 'Human Resources', 'Product & Design', 'Finance'];
const RISK_LEVELS = ['All', 'HIGH', 'MEDIUM', 'LOW'];

export default function Employees({
  onSelectEmployee,
  onNavigate,
  onOpenAddModal,
  onEditEmployee,
  refreshTrigger
}) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');

  // Deletion modal state
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEmployees({
        q: searchTerm,
        department: selectedDept,
        riskLevel: selectedRisk
      });
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError('Could not fetch employees. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedDept, selectedRisk, refreshTrigger]);

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    try {
      setIsDeleting(true);
      const id = deletingEmployee._id || deletingEmployee.employeeId;
      await api.deleteEmployee(id);
      setDeletingEmployee(null);
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header & Controls Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 card-shadow space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, role, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Employee</span>
          </button>
        </div>

        {/* Filter Badges & Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Filter By:</span>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Department:</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500 font-medium">Risk Level:</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {RISK_LEVELS.map((risk) => (
                <option key={risk} value={risk}>
                  {risk}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filter Clear */}
          {(selectedDept !== 'All' || selectedRisk !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedDept('All');
                setSelectedRisk('All');
                setSearchTerm('');
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium underline ml-auto"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-mono">
            Showing {employees.length} records
          </div>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium">Filtering workforce roster...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-xs font-semibold">
            {error}
          </div>
        ) : employees.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              🔍
            </div>
            <h4 className="text-sm font-bold text-slate-800">No matching employees found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search criteria or resetting filters to display all personnel records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Role & Dept</th>
                  <th className="px-6 py-3">Tenure & Exp</th>
                  <th className="px-6 py-3">Monthly Income</th>
                  <th className="px-6 py-3">Satisfaction</th>
                  <th className="px-6 py-3">Overtime</th>
                  <th className="px-6 py-3">Attrition Risk</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp._id || emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & ID */}
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.employeeId}</div>
                    </td>

                    {/* Role & Dept */}
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-800">{emp.jobRole}</div>
                      <div className="text-[11px] text-slate-500">{emp.department}</div>
                    </td>

                    {/* Tenure & Exp */}
                    <td className="px-6 py-3.5">
                      <div className="font-medium">{emp.yearsAtCompany} yrs co</div>
                      <div className="text-[11px] text-slate-400">{emp.experience} yrs exp</div>
                    </td>

                    {/* Salary */}
                    <td className="px-6 py-3.5 font-mono font-medium text-slate-800">
                      ${Number(emp.monthlyIncome || 0).toLocaleString()}/mo
                    </td>

                    {/* Satisfaction */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{emp.jobSatisfaction || 3}</span>
                        <span className="text-slate-400">/4</span>
                      </div>
                      <div className="text-[10px] text-slate-400">WLB: {emp.workLifeBalance || 3}/4</div>
                    </td>

                    {/* Overtime */}
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        emp.overtime === 'Yes'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {emp.overtime === 'Yes' ? 'Overtime' : 'Standard'}
                      </span>
                    </td>

                    {/* Attrition Risk */}
                    <td className="px-6 py-3.5">
                      <RiskBadge level={emp.riskLevel} score={emp.riskScore} />
                    </td>

                    {/* Action Buttons */}
                    <td className="px-6 py-3.5 text-right space-x-1 whitespace-nowrap">
                      {/* View Details */}
                      <button
                        title="View Full Profile & Dossier"
                        onClick={() => {
                          onSelectEmployee(emp._id || emp.employeeId);
                          onNavigate('details');
                        }}
                        className="px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        Profile
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit Employee"
                        onClick={() => onEditEmployee(emp)}
                        className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete Employee"
                        onClick={() => setDeletingEmployee(emp)}
                        className="px-2 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 max-w-sm w-full space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete employee record <strong className="text-slate-900">{deletingEmployee.name}</strong> ({deletingEmployee.employeeId})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingEmployee(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
