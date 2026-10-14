import React from 'react';

export default function MetricCard({ title, value, subtext, icon, trend, alertColor }) {
  const borderHighlight = alertColor ? `border-l-4 ${alertColor}` : 'border-slate-200';

  return (
    <div className={`bg-white rounded-xl p-5 border ${borderHighlight} card-shadow hover-card transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-100">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.type === 'danger' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {trend.label}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-slate-500 line-clamp-1">
          {subtext}
        </p>
      )}
    </div>
  );
}
