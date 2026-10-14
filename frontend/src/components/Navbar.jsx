import React from 'react';

export default function Navbar({
  activeTab,
  onOpenAddModal,
  healthInfo,
  user,
  onLogout
}) {
  const titles = {
    dashboard: {
      title: 'Workforce Retention Dashboard',
      subtitle:
        'Real-time attrition forecasting, department health, and talent retention indices'
    },
    employees: {
      title: 'Employee Directory & Talent Records',
      subtitle:
        'Manage personnel roster, review satisfaction metrics, and monitor risk profiles'
    },
    predict: {
      title: 'AI Attrition Risk Predictor',
      subtitle:
        'Simulate workforce variables using Scikit-Learn Random Forest inference'
    },
    skills: {
      title: 'Automated Skill Gap Mapping Engine',
      subtitle:
        'Rule-based competency analysis, role benchmarks, and structured upskilling paths'
    },
    recommendations: {
      title: 'External Learning & Career Recommendations',
      subtitle:
        'SerpApi integrated live jobs, certifications, and high-impact online courses'
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  const isHR = user?.role === 'HR';

  const getInitials = (name = '') => {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U'
    );
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">

      {/* Page Title */}
      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
          {current.title}
        </h2>

        <p className="text-xs text-slate-500 hidden sm:block truncate">
          {current.subtitle}
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3 ml-4">

        {/* SerpApi Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
          <span
            className={`w-2 h-2 rounded-full ${
              healthInfo?.serpApiActive
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500'
            }`}
          />

          <span>
            {healthInfo?.serpApiActive
              ? 'SerpApi: Live'
              : 'SerpApi: Fallback Mode'}
          </span>
        </div>

        {/* Add Employee - HR Only */}
        {isHR && (
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>

            <span>Add Employee</span>
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
            {getInitials(user?.name)}
          </div>

          {/* User Details */}
          <div className="hidden md:block max-w-[140px]">
            <p className="text-xs font-semibold text-slate-800 truncate">
              {user?.name || 'User'}
            </p>

            <p
              className={`text-[10px] font-semibold ${
                isHR
                  ? 'text-blue-600'
                  : 'text-emerald-600'
              }`}
            >
              {isHR ? 'HR Administrator' : 'Employee'}
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Sign out"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-5-4l5-5m0 0l-5-5m5 5H3"
              />
            </svg>
          </button>

        </div>
      </div>
    </header>
  );
}