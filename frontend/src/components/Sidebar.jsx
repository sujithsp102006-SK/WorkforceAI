import React from 'react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout
}) {
  const isHR = user?.role === 'HR';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      badge: null
    },

    // HR ONLY
    ...(isHR
      ? [
          {
            id: 'employees',
            label: 'Employees',
            icon: (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            ),
            badge: 'Live'
          }
        ]
      : []),

    {
      id: 'predict',
      label: 'Attrition Predictor',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      badge: 'ML Engine'
    },

    {
      id: 'skills',
      label: 'Skill Mapping',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      badge: 'Rules'
    },

    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      badge: 'SerpApi'
    }
  ];

  const handleNavigation = (tab) => {
    setActiveTab(tab);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">

      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg">
          W
        </div>

        <div>
          <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
            Workforce AI
          </h1>

          <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-400">
            Predictive Analytics
          </span>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="px-4 pt-4">
        <div className="rounded-xl bg-slate-800/70 border border-slate-700 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Access Level
          </p>

          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-semibold text-white">
              {isHR ? 'HR Administrator' : 'Employee'}
            </span>

            <span
              className={`text-[9px] px-2 py-1 rounded-full font-bold ${
                isHR
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {user?.role || 'USER'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">

        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
          Core Modules
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? 'text-white'
                      : 'text-slate-400'
                  }
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    isActive
                      ? 'bg-blue-500/50 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 space-y-2">

        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">
            Inference Engine
          </span>

          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-300">
          RandomForest (Scikit-Learn) with rule-based skill graph & SerpApi live feeds.
        </p>
      </div>

      {/* User Info + Logout */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/30">

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 border border-blue-400/30 flex items-center justify-center font-bold text-xs text-white">
            {user?.name
              ? user.name
                  .split(' ')
                  .map((name) => name[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'U'}
          </div>

          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || 'User'}
            </p>

            <p className="text-[10px] text-slate-400 truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-all"
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

          Sign Out
        </button>

      </div>
    </aside>
  );
}