
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('workforce_user') || 'null');
  } catch {
    return null;
  }
};

const Icon = ({ children, className = '' }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

const Panel = ({ children, className = '' }) => (
  <section
    className={`rounded-2xl border border-white/[0.09] bg-[#10172b]/90 shadow-[0_12px_40px_rgba(0,0,0,0.16)] ${className}`}
  >
    {children}
  </section>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
    {children}
  </p>
);

export default function Recommendations({
  initialEmployeeId,
  initialTargetRole
}) {
  const [user] = useState(getStoredUser);
  const isHR = user?.role?.toUpperCase() === 'HR';

  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    initialEmployeeId || ''
  );
  const [targetRole, setTargetRole] = useState(
    initialTargetRole || 'Full Stack Developer'
  );
  const [activeTab, setActiveTab] = useState('courses');

  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [activeCustomQuery, setActiveCustomQuery] = useState('');
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployees() {
      try {
        setError(null);

        const res = isHR
          ? await api.getEmployees()
          : await api.getMyEmployee();

        if (cancelled) return;

        const list = isHR
          ? (Array.isArray(res.data) ? res.data : [])
          : (res.data ? [res.data] : []);

        setEmployees(list);

        if (list.length > 0) {
          const emp = isHR
            ? list.find(
                item =>
                  item._id === selectedEmployeeId ||
                  item.employeeId === selectedEmployeeId
              ) || list[0]
            : list[0];

          setSelectedEmployeeId(
          isHR ? (emp._id || emp.employeeId) : emp.employeeId
          );
          setTargetRole(
            initialTargetRole ||
              emp.targetRole ||
              emp.jobRole ||
              'Full Stack Developer'
          );
        } else {
          setSelectedEmployeeId('');
          setResultsData(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Could not load employee profile:', err);
          setError(err.message || 'Could not load employee profile.');
        }
      }
    }

    loadEmployees();

    return () => {
      cancelled = true;
    };
  }, [isHR]);

  useEffect(() => {
    if (!selectedEmployeeId || !targetRole.trim()) return;

    let cancelled = false;

    async function loadRecommendations() {
      try {
        setLoading(true);
        setError(null);
        setActiveCustomQuery('');

        const res = await api.getRecommendationsForEmployee(
          selectedEmployeeId,
          targetRole
        );

        if (!cancelled) {
          if (res.success && res.data) {
            setResultsData(res.data);
          } else {
            throw new Error(
              res.message || 'Failed to fetch recommendations.'
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Fetch recommendations error:', err);
          setError(err.message || 'Could not retrieve recommendations.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId, targetRole]);

  const handleSelectEmployee = event => {
    const id = event.target.value;
    setSelectedEmployeeId(id);

    const emp = employees.find(
      item => (item._id || item.employeeId) === id
    );

    if (emp) {
      setTargetRole(
        emp.targetRole ||
          emp.jobRole ||
          'Full Stack Developer'
      );
    }
  };

  const handleCustomSearch = async event => {
    event.preventDefault();

    const query = customSearchQuery.trim();
    if (!query) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.searchLiveResources({
        query,
        targetRole,
        skills: resultsData?.skillGaps || []
      });

      if (res.success && res.data) {
        setActiveCustomQuery(query);

        setResultsData(prev => ({
          ...prev,
          query: res.data.query,
          jobs: res.data.jobs,
          courses: res.data.courses,
          certifications: res.data.certifications,
          metadata: res.data.metadata || prev?.metadata
        }));
      } else {
        throw new Error(res.message || 'Custom search failed.');
      }
    } catch (err) {
      console.error('Custom search error:', err);
      setError(err.message || 'Error executing custom search.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToProfile = async () => {
    setCustomSearchQuery('');
    setActiveCustomQuery('');

    if (!selectedEmployeeId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.getRecommendationsForEmployee(
        selectedEmployeeId,
        targetRole
      );

      if (res.success && res.data) {
        setResultsData(res.data);
      } else {
        throw new Error(
          res.message || 'Could not reload recommendations.'
        );
      }
    } catch (err) {
      setError(err.message || 'Could not reload recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const courses = resultsData?.courses?.items || [];
  const jobs = resultsData?.jobs?.items || [];
  const certifications = resultsData?.certifications?.items || [];

  const tabItems = [
    {
      id: 'courses',
      label: 'Learning paths',
      subtitle: 'COURSES',
      count: courses.length,
      icon: '◈'
    },
    {
      id: 'jobs',
      label: 'Career opportunities',
      subtitle: 'JOBS',
      count: jobs.length,
      icon: '↗'
    },
    {
      id: 'certifications',
      label: 'Professional credentials',
      subtitle: 'CERTIFICATIONS',
      count: certifications.length,
      icon: '✳'
    }
  ];

  const currentItems =
    activeTab === 'courses'
      ? courses
      : activeTab === 'jobs'
        ? jobs
        : certifications;

  const currentSource =
    activeTab === 'courses'
      ? resultsData?.courses?.source
      : activeTab === 'jobs'
        ? resultsData?.jobs?.source
        : resultsData?.certifications?.source;

  const liveEnabled = resultsData?.metadata?.serpApiKeyConfigured;

  return (
    <div className="relative min-h-full flex-1 overflow-y-auto bg-[#080d1b] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 12% 0%, rgba(37,99,235,.20), transparent 38%), radial-gradient(ellipse at 90% 20%, rgba(139,92,246,.14), transparent 35%)'
        }}
      />

      <div className="relative mx-auto max-w-[1500px] space-y-6">
        {/* HERO */}
        <header className="relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-[#142449] via-[#111a34] to-[#18142f] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                  WorkforceAI Intelligence Engine
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Your next move,
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                  intelligently mapped.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                Discover learning resources, career opportunities, and
                industry credentials aligned with your target role and
                identified skill gaps.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col">
              <div
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  liveEnabled
                    ? 'border-emerald-300/20 bg-emerald-300/[0.06]'
                    : 'border-amber-300/20 bg-amber-300/[0.06]'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
                    liveEnabled
                      ? 'bg-emerald-300/10 text-emerald-300'
                      : 'bg-amber-300/10 text-amber-300'
                  }`}
                >
                  {liveEnabled ? '↗' : '◇'}
                </span>
                <div>
                  <p className="text-xs font-bold text-white">
                    {liveEnabled ? 'Live search enabled' : 'Fallback mode'}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {liveEnabled
                      ? 'SerpApi configured'
                      : 'Demo resources may be shown'}
                  </p>
                </div>
                <span
                  className={`ml-2 h-2 w-2 rounded-full ${
                    liveEnabled ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                <SectionLabel>Recommendation engine</SectionLabel>
                <p className="mt-1 text-sm font-bold text-white">
                  Skill-aware discovery
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* SEARCH AND PERSONALIZATION */}
        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <SectionLabel>Personalization workspace</SectionLabel>
              <h2 className="mt-1 text-lg font-bold text-white">
                Configure your career search
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Recommendations adapt to the selected role
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                {isHR ? 'Employee profile' : 'Your employee profile'}
              </label>

              {isHR ? (
                <select
                  value={selectedEmployeeId}
                  onChange={handleSelectEmployee}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-400"
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option
                      key={emp._id || emp.employeeId}
                      value={emp._id || emp.employeeId}
                    >
                      {emp.name} ({emp.jobRole} · {emp.employeeId})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex min-h-[46px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-400/10 text-sm font-bold text-blue-300">
                    {(employees[0]?.name || user?.name || 'U')
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {employees[0]?.name || user?.name || 'Loading profile...'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {employees[0]?.employeeId || 'Employee workspace'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Target career role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={event => setTargetRole(event.target.value)}
                placeholder="e.g. Data Scientist"
                className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-sm text-cyan-200 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
              />
            </div>

            <div className="lg:col-span-5">
              <label className="mb-2 block text-xs font-semibold text-slate-400">
                Search across learning and careers
              </label>
              <form onSubmit={handleCustomSearch} className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                    ⌕
                  </span>
                  <input
                    type="text"
                    placeholder="React, cloud certification, AI jobs..."
                    value={customSearchQuery}
                    onChange={event =>
                      setCustomSearchQuery(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b1120] py-3 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !customSearchQuery.trim()}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Search ↗
                </button>
              </form>
            </div>
          </div>

          {activeCustomQuery && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-400/20 bg-blue-400/[0.06] px-4 py-3">
              <p className="text-xs text-slate-300">
                Showing search results for{' '}
                <strong className="text-cyan-200">
                  {activeCustomQuery}
                </strong>
              </p>
              <button
                onClick={handleResetToProfile}
                className="text-xs font-bold text-blue-300 hover:text-white"
              >
                ↺ Reset to profile
              </button>
            </div>
          )}

          {resultsData?.skillGaps?.length > 0 && (
            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold text-slate-400">
                  Skill gaps to address
                </span>
                {resultsData.skillGaps.map(gap => (
                  <span
                    key={gap}
                    className="rounded-lg border border-rose-300/15 bg-rose-300/[0.06] px-2.5 py-1 text-[11px] text-rose-200"
                  >
                    {gap}
                  </span>
                ))}
                {resultsData.matchPercentage != null && (
                  <span className="ml-auto rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] px-3 py-1.5 text-xs font-bold text-cyan-200">
                    {resultsData.matchPercentage}% role match
                  </span>
                )}
              </div>
            </div>
          )}
        </Panel>

        {/* OVERVIEW METRICS */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: 'Learning resources',
              count: courses.length,
              icon: '◈',
              color: 'text-cyan-300',
              bg: 'bg-cyan-300/[0.08]',
              detail: 'Build missing skills'
            },
            {
              label: 'Career opportunities',
              count: jobs.length,
              icon: '↗',
              color: 'text-violet-300',
              bg: 'bg-violet-300/[0.08]',
              detail: 'Explore target-role jobs'
            },
            {
              label: 'Certifications',
              count: certifications.length,
              icon: '✳',
              color: 'text-blue-300',
              bg: 'bg-blue-300/[0.08]',
              detail: 'Validate your expertise'
            }
          ].map(metric => (
            <Panel key={metric.label} className="p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${metric.bg} ${metric.color}`}
                >
                  {metric.icon}
                </div>
                <div className="min-w-0">
                  <SectionLabel>{metric.label}</SectionLabel>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {metric.count}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      results
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {metric.detail}
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        {/* RESOURCE TABS */}
        <div>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>Discover your next step</SectionLabel>
              <h2 className="mt-1 text-xl font-bold text-white">
                Curated for your career
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Role: <span className="font-semibold text-slate-300">{targetRole}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {tabItems.map(tab => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl border p-4 text-left transition duration-200 ${
                    active
                      ? 'border-blue-400/40 bg-gradient-to-br from-blue-500/[0.13] to-violet-500/[0.08] shadow-lg shadow-blue-950/20'
                      : 'border-white/[0.08] bg-[#10172b]/70 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${
                        active
                          ? 'bg-blue-400/15 text-blue-200'
                          : 'bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      {tab.icon}
                    </div>
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        active
                          ? 'bg-blue-400/15 text-blue-200'
                          : 'bg-white/[0.05] text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </div>
                  <p className="mt-4 text-[10px] font-bold tracking-[0.16em] text-slate-500">
                    {tab.subtitle}
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      active ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </p>
                  <div
                    className={`mt-4 h-1 rounded-full ${
                      active ? 'bg-blue-400/20' : 'bg-white/[0.04]'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        active ? 'w-full bg-gradient-to-r from-cyan-300 to-violet-400' : 'w-0'
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RESULTS */}
        <Panel>
          <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h3 className="text-base font-bold text-white">
                {activeTab === 'courses'
                  ? 'Recommended learning resources'
                  : activeTab === 'jobs'
                    ? 'Career opportunities'
                    : 'Professional certifications'}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {currentSource
                  ? `Source: ${currentSource}`
                  : 'Resources based on the selected profile and search'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                {currentItems.length} resources
              </span>
              <button
                onClick={handleResetToProfile}
                disabled={loading || !selectedEmployeeId}
                title="Reload profile recommendations"
                className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-40"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-400/20 border-t-cyan-300" />
                <p className="mt-5 text-sm font-semibold text-white">
                  Discovering relevant resources...
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Loading recommendations for {targetRole}
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.05] p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-rose-200">
                      Recommendation request failed
                    </p>
                    <p className="mt-2 break-words text-sm text-slate-400">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={handleResetToProfile}
                    className="shrink-0 rounded-xl bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-200 transition hover:bg-rose-500/25"
                  >
                    Try again ↗
                  </button>
                </div>
              </div>
            ) : !selectedEmployeeId ? (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl text-slate-400">
                  ◇
                </div>
                <p className="mt-4 font-bold text-white">
                  {isHR
                    ? 'No employees found'
                    : 'Employee profile unavailable'}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  {isHR
                    ? 'Add an employee before generating personalized recommendations.'
                    : 'Your employee profile could not be found. Please contact HR.'}
                </p>
              </div>
            ) : !resultsData ? (
              <div className="py-14 text-center text-sm text-slate-400">
                No recommendation data available yet.
              </div>
            ) : currentItems.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl text-slate-400">
                  ⌕
                </div>
                <p className="mt-4 font-bold text-white">
                  No resources found
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  Try another target role or search for a specific skill.
                </p>
              </div>
            ) : activeTab === 'courses' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((item, index) => (
                  <article
                    key={item.link || index}
                    className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.035] to-transparent p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-cyan-300/[0.025]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                          {item.skillTargeted || 'Upskilling'}
                        </span>
                        <span className="text-lg text-cyan-300/70">◈</span>
                      </div>
                      <h4 className="mt-4 text-sm font-bold leading-6 text-white transition group-hover:text-cyan-100">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-xs text-slate-400">
                        Platform · {item.platform || 'Learning platform'}
                      </p>
                      <p className="mt-3 line-clamp-4 text-xs leading-5 text-slate-500">
                        {item.snippet || 'Explore this learning resource to strengthen your professional skills.'}
                      </p>
                    </div>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] px-4 py-3 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/[0.12]"
                      >
                        Explore course <span>↗</span>
                      </a>
                    ) : (
                      <p className="mt-5 text-xs text-slate-500">
                        Course link unavailable
                      </p>
                    )}
                  </article>
                ))}
              </div>
            ) : activeTab === 'jobs' ? (
              <div className="space-y-3">
                {jobs.map((job, index) => (
                  <article
                    key={job.link || index}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-violet-300/25 hover:bg-violet-300/[0.025] sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-violet-300/15 bg-violet-300/[0.07] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-200">
                            Target-role opportunity
                          </span>
                        </div>
                        <h4 className="mt-3 text-base font-bold text-white">
                          {job.title}
                        </h4>
                        <p className="mt-2 text-xs text-slate-400">
                          {job.company || 'Company not specified'}
                          {' · '}
                          {job.location || 'Location not specified'}
                        </p>
                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          {job.snippet || 'View the listing for further information about this opportunity.'}
                        </p>
                        {Array.isArray(job.tags) && job.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {job.tags.map((tag, tagIndex) => (
                              <span
                                key={`${tag}-${tagIndex}`}
                                className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[10px] text-slate-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {job.link ? (
                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-xs font-bold text-white transition hover:brightness-110"
                        >
                          Explore opening ↗
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Listing link unavailable
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {certifications.map((cert, index) => (
                  <article
                    key={cert.link || index}
                    className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-300/[0.035] to-transparent p-5 transition hover:border-violet-300/25 sm:p-6"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="rounded-lg border border-violet-300/15 bg-violet-300/[0.07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-200">
                          {cert.level || 'Professional credential'}
                        </span>
                        <span className="text-xl text-violet-300/80">✳</span>
                      </div>
                      <h4 className="mt-4 text-base font-bold leading-6 text-white">
                        {cert.title}
                      </h4>
                      <p className="mt-2 text-xs text-slate-400">
                        Issuer · {cert.issuer || 'Not specified'}
                      </p>
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {cert.snippet || 'Explore the credential details to learn more about its requirements.'}
                      </p>
                    </div>
                    {cert.link ? (
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-violet-300/15 bg-violet-300/[0.06] px-4 py-3 text-xs font-bold text-violet-200 transition hover:bg-violet-300/[0.12]"
                      >
                        View credential details ↗
                      </a>
                    ) : (
                      <p className="mt-5 text-xs text-slate-500">
                        Credential link unavailable
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </Panel>

        {/* RESPONSIBLE DISCOVERY NOTE */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-start sm:p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-400/[0.08] text-blue-300">
            ◇
          </div>
          <div>
            <p className="text-xs font-bold text-slate-200">
              AI-assisted career discovery
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Recommendations are intended to support career development.
              Verify course details, certification requirements, job availability,
              and eligibility on the linked provider's website before taking action.
              Resource availability depends on the configured data source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
