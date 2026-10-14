import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function EmployeeDetails({
  employeeId,
  onNavigate,
  onEditEmployee,
  onSimulateEmployee,
  onOpenRecommendations
}) {
  const [employee, setEmployee] = useState(null);
  const [skillAnalysis, setSkillAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [empRes, skillRes] = await Promise.all([
          api.getEmployeeById(employeeId),
          api.getSkillsForEmployee(employeeId).catch(() => null)
        ]);

        if (empRes.success) {
          setEmployee(empRes.data);
        } else {
          setError('Employee record not found.');
        }

        if (skillRes && skillRes.success) {
          setSkillAnalysis(skillRes.data);
        }
      } catch (err) {
        console.error('Error fetching employee dossier:', err);
        setError(err.message || 'Failed to retrieve employee data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Compiling employee intelligence dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex-1 p-6">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-6 text-center space-y-3">
          <p className="text-sm font-semibold">{error || 'Employee record could not be loaded'}</p>
          <button
            onClick={() => onNavigate('employees')}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
          >
            Return to Employees Roster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => onNavigate('employees')}
            className="hover:text-blue-600 font-semibold"
          >
            Employees
          </button>
          <span>/</span>
          <span className="text-slate-800 font-bold">{employee.name}</span>
          <span className="font-mono text-slate-400">({employee.employeeId})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSimulateEmployee(employee)}
            className="px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Simulate in ML Engine</span>
          </button>

          <button
            onClick={() => onOpenRecommendations(employee._id || employee.employeeId, employee.targetRole || employee.jobRole)}
            className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>SerpApi Resources</span>
          </button>

          <button
            onClick={() => onEditEmployee(employee)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Overview Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 card-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              {employee.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
                <RiskBadge level={employee.riskLevel} score={employee.riskScore} size="lg" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {employee.jobRole} • <span className="text-blue-600 font-semibold">{employee.department}</span>
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                <span>Employee ID: <strong className="font-mono">{employee.employeeId}</strong></span>
                <span>Age: <strong>{employee.age}</strong></span>
                <span>Gender: <strong>{employee.gender}</strong></span>
                <span>Tenure: <strong>{employee.yearsAtCompany} yrs</strong></span>
                <span>Total Experience: <strong>{employee.experience} yrs</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Pay</span>
              <span className="text-base font-bold font-mono text-slate-900">
                ${Number(employee.monthlyIncome).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Satisfaction</span>
              <span className="text-base font-bold text-slate-900">
                {employee.jobSatisfaction} <span className="text-xs font-normal text-slate-400">/ 4</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overtime</span>
              <span className={`text-base font-bold ${employee.overtime === 'Yes' ? 'text-rose-600' : 'text-slate-700'}`}>
                {employee.overtime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Grid: ML Attrition Assessment & Skill Gap Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ML Attrition Prediction Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>AI Attrition Risk Assessment</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                    ML Model
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Predicted retention probability and contributing indicators</p>
              </div>
              <RiskBadge level={employee.riskLevel} score={employee.riskScore} />
            </div>

            {/* Probability Gauge Bar */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Model Attrition Probability Score</span>
                <span className="font-mono text-slate-900 font-bold">
                  {Math.round((employee.riskScore || 0) * 100)}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    employee.riskLevel === 'HIGH'
                      ? 'bg-rose-500'
                      : employee.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max((employee.riskScore || 0) * 100, 5)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.00 (Low)</span>
                <span>0.40 (Medium)</span>
                <span>0.70 (High)</span>
                <span>1.00</span>
              </div>
            </div>

            {/* Contributing Risk Factors */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Model-Identified Contributing Factors:
              </span>
              {employee.riskFactors?.length > 0 ? (
                <ul className="space-y-2">
                  {employee.riskFactors.map((factor, i) => (
                    <li
                      key={i}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2.5"
                    >
                      <span className="text-rose-500 mt-0.5 font-bold">•</span>
                      <span className="leading-relaxed">{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                  No critical attrition risk factors currently identified for this employee.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Work-Life Balance: <strong>{employee.workLifeBalance || 3}/4</strong></span>
            <span>Performance Rating: <strong>{employee.performanceRating || 3}/5</strong></span>
            <span>Training: <strong>{employee.trainingHours || 0} hrs</strong></span>
          </div>
        </div>

        {/* Skill Mapping & Target Role Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 card-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Skill Competency & Target Role</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    Rule Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Benchmarked against target job role requirements</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                Target: {employee.targetRole || 'Full Stack Developer'}
              </span>
            </div>

            {/* Current Skills Section */}
            <div className="space-y-2 mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Recorded Skills:
              </span>
              <div className="flex flex-wrap gap-2">
                {employee.skills?.length > 0 ? (
                  employee.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-md border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills recorded yet.</span>
                )}
              </div>
            </div>

            {/* Skill Gaps Breakdown */}
            {skillAnalysis && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-600">Target Role Match: {skillAnalysis.targetRole}</span>
                  <span className="font-mono text-blue-600 font-bold">{skillAnalysis.matchPercentage}% Matched</span>
                </div>

                {/* Missing Skills (Skill Gaps) */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1.5">
                    Identified Skill Gaps (Missing Competencies):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.missingSkills?.length > 0 ? (
                      skillAnalysis.missingSkills.map((gap) => (
                        <span
                          key={gap}
                          className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{gap}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-medium">
                        ✓ All required competencies for target role are satisfied!
                      </span>
                    )}
                  </div>
                </div>

                {/* Matched Skills */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1.5">
                    Matched Competencies:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.matchedSkills?.map((m) => (
                      <span
                        key={m}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md"
                      >
                        ✓ {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate('skills')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Open Full Skill Gap Matrix →
            </button>
            <button
              onClick={() => onOpenRecommendations(employee._id || employee.employeeId, employee.targetRole)}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Find Courses for Gaps
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
