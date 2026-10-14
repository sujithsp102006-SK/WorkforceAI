
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const riskStyles = {
  HIGH: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
  MEDIUM: 'border-amber-300/30 bg-amber-300/10 text-amber-200',
  LOW: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300',
};

function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.08] bg-[#101827] shadow-[0_15px_45px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </section>
  );
}

function Heading({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
          {eyebrow}
        </p>
        <h2 className="text-lg font-bold tracking-tight text-white">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-slate-400">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function RiskPill({ level }) {
  const risk = String(level || 'UNKNOWN').toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wide ${
        riskStyles[risk] ||
        'border-white/10 bg-white/5 text-slate-300'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {risk}
    </span>
  );
}

function Metric({ icon, label, value, note, tone = 'cyan' }) {
  const colors = {
    cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
    violet: 'border-violet-300/20 bg-violet-300/10 text-violet-200',
    rose: 'border-rose-300/20 bg-rose-300/10 text-rose-200',
    amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
    green: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
  };

  return (
    <Panel className="group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/[0.06] blur-2xl transition group-hover:bg-cyan-300/15" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-white">
            {value ?? '—'}
          </p>
          <p className="mt-2 text-[11px] leading-4 text-slate-500">{note}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${colors[tone]}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-5 h-px bg-gradient-to-r from-cyan-300/50 via-violet-300/20 to-transparent" />
    </Panel>
  );
}

function EmptyState({ title, message }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{message}</p>
    </div>
  );
}

// REAL VERTICAL DEPARTMENT BAR CHART
function DepartmentBarChart({ departments }) {
  const chartData = departments.map((dept) => ({
    name: dept.name || 'Unknown',
    employees: Number(dept.count || 0),
  }));

  return (
    <div className="h-[340px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 24, right: 12, left: -12, bottom: 12 }}
        >
          <CartesianGrid
            stroke="#263449"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
            interval={0}
            tickMargin={12}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />

          <Tooltip
            cursor={{ fill: 'rgba(103,232,249,0.06)' }}
            contentStyle={{
              background: '#101827',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#67e8f9', marginBottom: 4 }}
            formatter={(value) => [value, 'Employees']}
          />

          <Bar
            dataKey="employees"
            name="Employees"
            fill="#67e8f9"
            radius={[7, 7, 0, 0]}
            maxBarSize={58}
            label={{
              position: 'top',
              fill: '#e2e8f0',
              fontSize: 12,
              fontWeight: 600,
            }}
            activeBar={{ fill: '#a5f3fc' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// REAL ATTRITION RISK DONUT CHART
function RiskDistributionChart({ total, high, medium, low }) {
  const data = [
    { name: 'High risk', value: high, color: '#fb7185' },
    { name: 'Medium risk', value: medium, color: '#fbbf24' },
    { name: 'Low risk', value: low, color: '#34d399' },
  ];

  return (
    <div className="w-full">
      <div className="relative h-[250px] w-full">
        {total > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((item) => item.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={67}
                  outerRadius={95}
                  paddingAngle={4}
                  stroke="none"
                >
                  {data
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: '#101827',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value, name) => [
                    `${value} employees`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{total}</span>
              <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
                Employees
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-slate-500">No risk data available</p>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-3">
        {data.map((item) => {
          const percentage = total
            ? Math.round((item.value / total) * 100)
            : 0;

          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-300">{item.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-500">
                  {percentage}%
                </span>
                <span
                  className="min-w-6 text-right font-mono text-sm font-bold"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate, onSelectEmployee }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('workforce_user') || 'null');
    } catch {
      return null;
    }
  });

  const isHR = user?.role === 'HR';

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isHR) {
        const res = await api.getDashboardStats();

        if (!res.success) {
          throw new Error(res.message || 'Failed to load dashboard');
        }

        setStats(res.data);
      } else {
        const res = await api.getMyEmployee();

        if (!res.success) {
          throw new Error(res.message || 'Unable to load employee profile');
        }

        setStats({ employeeMode: true, employee: res.data });
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#080d18] p-6 text-center">
        <div>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/20 border-t-cyan-300" />
          <p className="mt-5 text-sm font-semibold text-white">
            Initializing WorkforceAI
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Loading workforce intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center bg-[#080d18] p-6">
        <Panel className="w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/10 text-xl text-rose-300">
            !
          </div>

          <h2 className="mt-4 font-bold text-white">
            Unable to load intelligence
          </h2>
          <p className="mt-2 text-sm text-slate-400">{error}</p>

          <button
            onClick={fetchStats}
            className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200"
          >
            Retry connection
          </button>
        </Panel>
      </div>
    );
  }

  // EMPLOYEE DASHBOARD
  if (!isHR) {
    const employee = stats?.employee;
    const risk = String(employee?.riskLevel || '').toUpperCase();

    const actions = [
      {
        icon: '⌁',
        title: 'Attrition prediction',
        text: 'Explore your current retention risk assessment.',
        page: 'predict',
        tone: 'text-cyan-300',
      },
      {
        icon: '◇',
        title: 'Skill intelligence',
        text: 'Discover skill gaps and your next growth opportunities.',
        page: 'skills',
        tone: 'text-violet-300',
      },
      {
        icon: '↗',
        title: 'Career recommendations',
        text: 'Explore relevant jobs, courses and certifications.',
        page: 'recommendations',
        tone: 'text-emerald-300',
      },
    ];

    return (
      <div className="w-full min-w-0 space-y-6 bg-[#080d18] p-4 text-slate-100 sm:p-6 lg:p-8">
        <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#13283e] via-[#111a2d] to-[#1c1433] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              Personal intelligence workspace
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-4xl">
              Your career. Your{' '}
              <span className="text-cyan-300">next level.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              Welcome back, {employee?.name || user?.name || 'Employee'}.
              Explore your recorded workforce profile, skill opportunities
              and retention indicators.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('skills')}
                className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold text-[#08111e] transition hover:bg-cyan-200"
              >
                Explore my skills ↗
              </button>

              <span className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 font-mono text-xs text-slate-300">
                ID / {employee?.employeeId || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon="◈"
            label="Employee identity"
            value={employee?.employeeId || 'N/A'}
            note="Your workforce ID"
          />

          <Metric
            icon="⌁"
            label="Attrition indicator"
            value={employee?.riskLevel || 'Not assessed'}
            note={
              employee?.riskScore != null
                ? `Risk score: ${Math.round(employee.riskScore * 100)}%`
                : 'No risk score recorded'
            }
            tone={
              risk === 'HIGH'
                ? 'rose'
                : risk === 'MEDIUM'
                  ? 'amber'
                  : 'green'
            }
          />

          <Metric
            icon="◎"
            label="Job satisfaction"
            value={
              employee?.jobSatisfaction != null
                ? `${employee.jobSatisfaction} / 4`
                : '—'
            }
            note="Recorded satisfaction score"
            tone="violet"
          />

          <Metric
            icon="⌘"
            label="Learning hours"
            value={
              employee?.trainingHours != null
                ? `${employee.trainingHours} hrs`
                : '—'
            }
            note="Professional development"
            tone="amber"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Panel className="p-5 sm:p-6">
            <Heading
              eyebrow="Employee data"
              title="Your workforce profile"
              subtitle="Information from your employee record"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ['Department', employee?.department],
                ['Job role', employee?.jobRole],
                [
                  'Experience',
                  employee?.experience != null
                    ? `${employee.experience} years`
                    : '—',
                ],
                [
                  'Company tenure',
                  employee?.yearsAtCompany != null
                    ? `${employee.yearsAtCompany} years`
                    : '—',
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                >
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-200">
                    {value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <Heading
              eyebrow="Model signals"
              title="Retention indicators"
              subtitle="Recorded factors for review—not proof of causation"
            />

            {employee?.riskLevel && (
              <div className="mb-4">
                <RiskPill level={employee.riskLevel} />
              </div>
            )}

            {employee?.riskFactors?.length ? (
              <div className="space-y-3">
                {employee.riskFactors.map((factor, index) => (
                  <div
                    key={index}
                    className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-sm text-slate-300"
                  >
                    <span className="text-cyan-300">✳</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No indicators recorded"
                message="Review an assessment to see available risk factors."
              />
            )}

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <p className="mb-3 text-xs font-semibold text-slate-400">
                Recorded skills
              </p>

              <div className="flex flex-wrap gap-2">
                {employee?.skills?.length ? (
                  employee.skills.map((skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-lg border border-violet-300/20 bg-violet-300/[0.07] px-3 py-1.5 text-xs text-violet-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">
                    No skills recorded yet.
                  </span>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <div>
          <Heading
            eyebrow="Career intelligence"
            title="Choose your next move"
            subtitle="Open a module to explore your career data."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {actions.map((item, index) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101827] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#131e30]"
              >
                <span className="absolute right-4 top-4 font-mono text-[10px] text-slate-600">
                  0{index + 1}
                </span>

                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-2xl ${item.tone}`}
                >
                  {item.icon}
                </span>

                <h3 className="mt-5 font-bold text-white">{item.title}</h3>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
                  {item.text}
                </p>
                <p className="mt-5 text-xs font-bold text-cyan-300">
                  Open module ↗
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // HR DASHBOARD
  const total = Number(stats?.totalEmployees || 0);
  const high = Number(stats?.highRiskCount || 0);
  const medium = Number(stats?.mediumRiskCount || 0);
  const low = Number(stats?.lowRiskCount || 0);

  const highPercent = total ? Math.round((high / total) * 100) : 0;
  const departments = stats?.departmentDistribution || [];
  const highRiskEmployees = stats?.recentHighRiskEmployees || [];

  const insightTitle =
    total === 0
      ? 'Workforce data needed'
      : high > 0
        ? `${high} employee${high === 1 ? '' : 's'} classified as high risk`
        : 'No high-risk employees recorded';

  const insightDescription =
    total === 0
      ? 'Add employee records to populate workforce analytics.'
      : high > 0
        ? 'Review the model indicators and validate the context with HR before deciding on retention actions.'
        : 'Continue reviewing workforce indicators and keep employee records up to date.';

  return (
    <div className="w-full min-w-0 space-y-6 bg-[#080d18] p-4 text-slate-100 sm:p-6 lg:p-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#13283e] via-[#111a2d] to-[#1c1433] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              WorkforceAI / Analytics workspace
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Workforce{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
              Predictive retention analytics, employee risk distribution and
              skill intelligence—designed to support better-informed HR decisions.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                'ATTRITION ANALYTICS',
                'PEOPLE INTELLIGENCE',
                'SKILL MAPPING',
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('predict')}
              className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-bold text-[#08111e] shadow-[0_0_25px_rgba(103,232,249,0.12)] transition hover:bg-cyan-200"
            >
              Run prediction ↗
            </button>

            <button
              onClick={() => onNavigate('skills')}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
            >
              Skill mapping →
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          icon="◈"
          label="Total headcount"
          value={total}
          note={`Average tenure: ${stats?.averageTenureYears ?? 0} yrs`}
        />
        <Metric
          icon="⚠"
          label="High attrition risk"
          value={high}
          note={`${highPercent}% of recorded workforce`}
          tone="rose"
        />
        <Metric
          icon="◉"
          label="Medium risk"
          value={medium}
          note="Requires contextual review"
          tone="amber"
        />
        <Metric
          icon="✓"
          label="Low risk"
          value={low}
          note="Lower model-estimated risk"
          tone="green"
        />
        <Metric
          icon="◇"
          label="Skill gaps"
          value={stats?.totalSkillGapsCount ?? 0}
          note="Identified competency gaps"
          tone="violet"
        />
      </div>

      {/* WORKFORCE INSIGHT */}
      <Panel className="relative overflow-hidden border-cyan-300/15 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-300/[0.06] blur-3xl" />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-200">
            ✳
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              Workforce insight
            </p>
            <h2 className="mt-2 text-lg font-bold text-white">{insightTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {insightDescription}
            </p>
            <p className="mt-3 text-[10px] leading-5 text-slate-500">
              Summary based on dashboard counts; not a new ML prediction or
              causal assessment.
            </p>
          </div>

          <button
            onClick={() => onNavigate('employees')}
            className="shrink-0 self-start rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/10"
          >
            Review workforce →
          </button>
        </div>
      </Panel>

      {/* CHARTS */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <Panel className="min-w-0 p-5 sm:p-6 xl:col-span-3">
          <Heading
            eyebrow="Talent distribution"
            title="Department intelligence"
            subtitle="Compare employee headcount across departments"
            action={
              <span className="rounded-lg border border-white/10 px-3 py-2 text-[10px] text-slate-400">
                {departments.length} departments
              </span>
            }
          />

          {departments.length ? (
            <DepartmentBarChart departments={departments} />
          ) : (
            <EmptyState
              title="No department data"
              message="Department analytics will appear when employee records are available."
            />
          )}
        </Panel>

        <Panel className="min-w-0 p-5 sm:p-6 xl:col-span-2">
          <Heading
            eyebrow="Model output"
            title="Attrition risk distribution"
            subtitle="Risk classification across recorded employees"
          />

          <RiskDistributionChart
            total={total}
            high={high}
            medium={medium}
            low={low}
          />

          <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs">
            <span className="text-slate-400">Average satisfaction</span>
            <span className="font-mono font-bold text-cyan-300">
              {stats?.averageSatisfaction ?? '—'} / 4.0
            </span>
          </div>

          <p className="mt-3 text-[10px] leading-5 text-slate-500">
            Risk scores are model estimates. HR should validate context before
            making employment decisions.
          </p>
        </Panel>
      </div>

      {/* HIGH RISK EMPLOYEE TABLE */}
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">
          <Heading
            eyebrow="Priority monitoring"
            title="High-risk employee overview"
            subtitle="Review model-classified employees and their recorded indicators."
          />

          <button
            onClick={() => onNavigate('employees')}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-cyan-200"
          >
            View all employees →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-white/[0.025] text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Employee</th>
                <th className="px-5 py-4 font-semibold">Department / Role</th>
                <th className="px-5 py-4 font-semibold">Tenure / Experience</th>
                <th className="px-5 py-4 font-semibold">Risk level</th>
                <th className="px-5 py-4 font-semibold">Recorded indicator</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">
              {highRiskEmployees.length ? (
                highRiskEmployees.map((emp) => (
                  <tr
                    key={emp._id || emp.employeeId}
                    className="transition hover:bg-cyan-300/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-200">{emp.name}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">
                        {emp.employeeId}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-slate-300">{emp.jobRole || '—'}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {emp.department || '—'}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      <p>{emp.yearsAtCompany ?? '—'} yrs at company</p>
                      <p className="mt-1 text-[10px]">
                        {emp.experience ?? '—'} yrs total experience
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <RiskPill level={emp.riskLevel} />
                    </td>

                    <td
                      className="max-w-[220px] truncate px-5 py-4 text-slate-400"
                      title={emp.riskFactors?.[0] || ''}
                    >
                      {emp.riskFactors?.[0] || 'No indicator recorded'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          onSelectEmployee(emp._id || emp.employeeId);
                          onNavigate('details');
                        }}
                        className="rounded-lg border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-2 text-[10px] font-bold text-cyan-200 transition hover:bg-cyan-300/15"
                      >
                        Inspect ↗
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState
                      title="No high-risk employees to display"
                      message="There are no records in the dashboard's high-risk employee list."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-white/[0.06] px-5 py-3 text-[10px] leading-5 text-slate-500">
          Risk scores support human review. They should not be treated as
          definitive predictions or used alone for employment decisions.
        </div>
      </Panel>
    </div>
  );
}
