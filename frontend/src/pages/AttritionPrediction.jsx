import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';

const INITIAL_FORM = {
  age: 29,
  experience: 4,
  yearsAtCompany: 3,
  monthlyIncome: 4200,
  jobSatisfaction: 1,
  workLifeBalance: 1,
  overtime: 'Yes',
  performanceRating: 3,
  trainingHours: 8,
};

const FEATURES = [
  {
    name: 'age',
    label: 'Age',
    min: 20,
    max: 65,
    step: 1,
    suffix: 'yrs',
  },
  {
    name: 'experience',
    label: 'Professional experience',
    min: 0,
    max: 35,
    step: 1,
    suffix: 'yrs',
  },
  {
    name: 'yearsAtCompany',
    label: 'Company tenure',
    min: 0,
    max: 25,
    step: 1,
    suffix: 'yrs',
  },
  {
    name: 'monthlyIncome',
    label: 'Monthly income',
    min: 2500,
    max: 20000,
    step: 250,
    suffix: '',
  },
  {
    name: 'trainingHours',
    label: 'Training hours',
    min: 0,
    max: 80,
    step: 1,
    suffix: 'hrs',
  },
];

const SELECT_FIELDS = [
  {
    name: 'jobSatisfaction',
    label: 'Job satisfaction',
    options: [
      { value: 1, label: '1 — Severely dissatisfied' },
      { value: 2, label: '2 — Strained / neutral' },
      { value: 3, label: '3 — Satisfied' },
      { value: 4, label: '4 — Highly engaged' },
    ],
  },
  {
    name: 'workLifeBalance',
    label: 'Work-life balance',
    options: [
      { value: 1, label: '1 — Severe strain' },
      { value: 2, label: '2 — Challenging' },
      { value: 3, label: '3 — Balanced' },
      { value: 4, label: '4 — Optimal' },
    ],
  },
  {
    name: 'performanceRating',
    label: 'Performance rating',
    options: [
      { value: 1, label: '1 — Unsatisfactory' },
      { value: 2, label: '2 — Below average' },
      { value: 3, label: '3 — Meets standards' },
      { value: 4, label: '4 — Exceeds standards' },
      { value: 5, label: '5 — Outstanding' },
    ],
  },
  {
    name: 'overtime',
    label: 'Overtime workload',
    options: [
      { value: 'No', label: 'No — Regular schedule' },
      { value: 'Yes', label: 'Yes — Frequent overtime' },
    ],
  },
];

function normalizeEmployee(employee) {
  return {
    age: Number(employee.age ?? INITIAL_FORM.age),
    experience: Number(
      employee.experience ?? INITIAL_FORM.experience
    ),
    yearsAtCompany: Number(
      employee.yearsAtCompany ?? INITIAL_FORM.yearsAtCompany
    ),
    monthlyIncome: Number(
      employee.monthlyIncome ??
      employee.salary ??
      INITIAL_FORM.monthlyIncome
    ),
    jobSatisfaction: Number(
      employee.jobSatisfaction ?? INITIAL_FORM.jobSatisfaction
    ),
    workLifeBalance: Number(
      employee.workLifeBalance ?? INITIAL_FORM.workLifeBalance
    ),
    overtime:
      typeof employee.overtime === 'boolean'
        ? employee.overtime
          ? 'Yes'
          : 'No'
        : employee.overtime ?? INITIAL_FORM.overtime,
    performanceRating: Number(
      employee.performanceRating ??
      INITIAL_FORM.performanceRating
    ),
    trainingHours: Number(
      employee.trainingHours ?? INITIAL_FORM.trainingHours
    ),
  };
}

function Panel({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-white/[0.09] bg-[#101729]/90 shadow-lg ${className}`}
    >
      {children}
    </section>
  );
}

function RangeField({ field, value, onChange, disabled }) {
  const percentage =
    ((Number(value) - field.min) / (field.max - field.min)) * 100;

  const displayValue =
    field.name === 'monthlyIncome'
      ? `$${Number(value).toLocaleString('en-US')}`
      : `${value}${field.suffix ? ` ${field.suffix}` : ''}`;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0b1120] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <label
          htmlFor={`field-${field.name}`}
          className="text-xs font-semibold text-slate-200"
        >
          {field.label}
        </label>

        <span className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.07] px-2.5 py-1 font-mono text-xs font-bold text-cyan-300">
          {displayValue}
        </span>
      </div>

      <input
        id={`field-${field.name}`}
        type="range"
        name={field.name}
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="ai-range w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        style={{ '--range-progress': `${percentage}%` }}
      />

      <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-500">
        <span>
          {field.name === 'monthlyIncome'
            ? `$${field.min.toLocaleString('en-US')}`
            : field.min}
        </span>
        <span>
          {field.name === 'monthlyIncome'
            ? `$${field.max.toLocaleString('en-US')}`
            : field.max}
        </span>
      </div>
    </div>
  );
}

function SelectField({ field, value, onChange, disabled }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0b1120] p-4">
      <label
        htmlFor={`field-${field.name}`}
        className="mb-3 block text-xs font-semibold text-slate-200"
      >
        {field.label}
      </label>

      <select
        id={`field-${field.name}`}
        name={field.name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-lg border border-white/10 bg-[#141d30] px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-cyan-400/50 disabled:opacity-60"
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
      <span className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="mt-3 text-2xl font-semibold text-white">
        {value}
      </div>
      <p className="mt-1 text-[10px] text-slate-500">{detail}</p>
    </div>
  );
}

function RiskGauge({ probability, risk }) {
  const percent = Math.max(
    0,
    Math.min(100, Number(probability) * 100 || 0)
  );

  const color =
    risk === 'HIGH'
      ? '#fb7185'
      : risk === 'MEDIUM'
        ? '#fbbf24'
        : '#34d399';

  const circumference = 2 * Math.PI * 72;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
      <svg viewBox="0 0 180 180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r="72"
          fill="none"
          stroke="rgba(148,163,184,0.15)"
          strokeWidth="11"
        />
        <circle
          cx="90"
          cy="90"
          r="72"
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-4xl font-bold text-white">
          {Math.round(percent)}%
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
          Risk score
        </span>
      </div>
    </div>
  );
}

export default function AttritionPrediction({ initialData }) {
  const [user, setUser] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const role = String(user?.role || '').toUpperCase();
  const isEmployee = role === 'EMPLOYEE';
  const isHR = role === 'HR';

  // Read the currently logged-in user.
  useEffect(() => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem('workforce_user') || 'null'
      );
      setUser(storedUser);
    } catch {
      setUser(null);
    }
  }, []);

  // EMP: load only their own profile.
  // HR: load the employee list for selection.
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    let active = true;

    async function loadEmployeeData() {
      setProfileLoading(true);
      setError('');

      try {
        if (isEmployee) {
          const response = await api.getMyEmployee();

          if (!response?.success || !response?.data) {
            throw new Error(
              response?.message || 'Could not load your employee profile.'
            );
          }

          if (!active) return;

          const employee = response.data;

          setEmployeesList([employee]);
          setSelectedPresetId(employee.employeeId || employee._id || '');
          setFormData(normalizeEmployee(employee));
        } else if (isHR) {
          const response = await api.getEmployees();

          if (!response?.success || !Array.isArray(response.data)) {
            throw new Error(
              response?.message || 'Could not load employees.'
            );
          }

          if (!active) return;

          setEmployeesList(response.data);

          if (initialData) {
            setFormData(normalizeEmployee(initialData));
            setSelectedPresetId(
              initialData.employeeId || initialData._id || ''
            );
          }
        } else {
          throw new Error('Your account does not have access to this page.');
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load employee information.');
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadEmployeeData();

    return () => {
      active = false;
    };
  }, [user, isEmployee, isHR, initialData]);

  const handleSelectPreset = (event) => {
    const id = event.target.value;
    setSelectedPresetId(id);
    setPredictionResult(null);
    setError('');

    if (!id) {
      setFormData(INITIAL_FORM);
      return;
    }

    const employee = employeesList.find(
      (item) =>
        String(item.employeeId) === id ||
        String(item._id) === id
    );

    if (employee) {
      setFormData(normalizeEmployee(employee));
    }
  };

  const handleChange = (event) => {
    const { name, value, type } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === 'range' || type === 'number'
          ? Number(value)
          : value,
    }));

    setPredictionResult(null);
    setError('');
  };

  const handleRunPrediction = useCallback(
    async (event) => {
      event?.preventDefault();

      setLoading(true);
      setError('');

      try {
        const response = await api.predictAttrition(formData);

        if (!response?.success || !response?.data) {
          throw new Error(
            response?.message || 'Prediction failed.'
          );
        }

        setPredictionResult(response.data);
        setLastUpdated(new Date());
      } catch (err) {
        setPredictionResult(null);
        setError(
          err.message || 'Unable to communicate with the prediction service.'
        );
      } finally {
        setLoading(false);
      }
    },
    [formData]
  );

  const risk = String(predictionResult?.risk || 'UNKNOWN').toUpperCase();
  const probability = Math.max(
    0,
    Math.min(1, Number(predictionResult?.probability ?? 0))
  );

  const riskColor =
    risk === 'HIGH'
      ? 'text-rose-300'
      : risk === 'MEDIUM'
        ? 'text-amber-300'
        : 'text-emerald-300';

  if (profileLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center bg-[#080d19] text-slate-300">
        Loading employee information...
      </div>
    );
  }

  if (!user || (!isEmployee && !isHR)) {
    return (
      <div className="rounded-xl border border-rose-400/20 bg-[#080d19] p-6 text-rose-300">
        Please log in with an authorized HR or Employee account.
      </div>
    );
  }

  return (
    <div className="min-h-full flex-1 space-y-6 overflow-y-auto bg-[#080d19] p-4 text-slate-200 sm:p-6 lg:p-8">
      <style>{`
        .ai-range {
          height: 5px;
          appearance: none;
          -webkit-appearance: none;
          border-radius: 999px;
          outline: none;
          background: linear-gradient(
            to right,
            #22d3ee 0%,
            #818cf8 var(--range-progress),
            rgba(148,163,184,0.16) var(--range-progress),
            rgba(148,163,184,0.16) 100%
          );
        }
        .ai-range::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #e0f2fe;
          border: 3px solid #22d3ee;
          box-shadow: 0 0 12px rgba(34,211,238,0.35);
        }
        .ai-range::-moz-range-thumb {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #e0f2fe;
          border: 3px solid #22d3ee;
        }
        .ai-grid-bg {
          background-image:
            linear-gradient(rgba(129,140,248,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129,140,248,0.035) 1px, transparent 1px);
          background-size: 26px 26px;
        }
      `}</style>

      <header className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-[#141e37] via-[#11182c] to-[#101528] p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-cyan-200">
              WorkforceAI / Predictive Intelligence
            </p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Attrition Risk
              <span className="block bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Intelligence Engine
              </span>
            </h1>
            <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
              Simulate workforce scenarios, evaluate employee risk
              indicators, and explore retention opportunities.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Logged-in role
            </p>
            <p className="mt-2 text-sm font-semibold text-cyan-300">
              {isHR ? 'HR Manager' : 'Employee'}
            </p>
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-[#101729] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold text-white">
            {isHR ? 'Employee benchmark' : 'My employee profile'}
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            {isHR
              ? 'Select an employee to prefill the prediction inputs.'
              : 'Your own profile is loaded from your account.'}
          </p>
        </div>

        {isHR ? (
          <select
            value={selectedPresetId}
            onChange={handleSelectPreset}
            className="w-full rounded-lg border border-white/10 bg-[#0b1120] px-3 py-2.5 text-xs text-slate-200 sm:max-w-md"
          >
            <option value="">Manual scenario</option>
            {employeesList.map((employee) => (
              <option
                key={employee.employeeId || employee._id}
                value={employee.employeeId || employee._id}
              >
                {employee.name || employee.employeeName || 'Employee'}
                {' — '}
                {employee.employeeId || employee._id}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-4 py-2.5 text-xs text-cyan-200">
            Profile loaded
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <Panel className="p-5 sm:p-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] font-mono text-xs font-bold text-cyan-300">
                01
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Workforce feature configuration
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Adjust the nine model inputs to evaluate a scenario.
                </p>
              </div>
            </div>

            <form onSubmit={handleRunPrediction} className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Workforce demographics
                  </h3>
                  <span className="font-mono text-[10px] text-slate-600">
                    05 FEATURES
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {FEATURES.map((field) => (
                    <RangeField
                      key={field.name}
                      field={field}
                      value={formData[field.name]}
                      onChange={handleChange}
                      disabled={isEmployee}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Engagement & performance
                  </h3>
                  <span className="font-mono text-[10px] text-slate-600">
                    04 FEATURES
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SELECT_FIELDS.map((field) => (
                    <SelectField
                      key={field.name}
                      field={field}
                      value={formData[field.name]}
                      onChange={handleChange}
                      disabled={isEmployee}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-white/[0.07] pt-5">
                <p className="mb-3 text-[10px] leading-5 text-slate-500">
                  {isEmployee
                    ? 'Your profile values are read-only. Contact HR to correct employee records.'
                    : 'HR can change the inputs to simulate a workforce scenario.'}
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Running prediction...' : 'Run Attrition Prediction'}
                </button>
              </div>
            </form>
          </Panel>

          <div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-4">
            <p className="text-[10px] leading-5 text-slate-400">
              <span className="font-semibold text-amber-200">
                Responsible AI:
              </span>{' '}
              This forecast is a decision-support estimate, not a definitive
              judgment about an employee. Use privacy, fairness, and human
              review safeguards.
            </p>
          </div>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Prediction intelligence
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Model output & risk indicators
                </p>
              </div>

              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/5 px-2.5 py-1 font-mono text-[9px] text-emerald-300">
                {loading
                  ? 'PROCESSING'
                  : error
                    ? 'ERROR'
                    : predictionResult
                      ? 'RESULT READY'
                      : 'STANDBY'}
              </span>
            </div>

            <div className="p-5">
              {predictionResult ? (
                <>
                  <div className="ai-grid-bg rounded-xl border border-white/[0.06] bg-[#0b1120] px-4 py-5">
                    <p className="text-center text-[9px] uppercase tracking-widest text-slate-500">
                      Predicted attrition probability
                    </p>

                    <RiskGauge probability={probability} risk={risk} />

                    <div className="mt-1 flex justify-center">
                      <span
                        className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-widest ${
                          risk === 'HIGH'
                            ? 'border-rose-400/25 bg-rose-400/10 text-rose-300'
                            : risk === 'MEDIUM'
                              ? 'border-amber-400/25 bg-amber-400/10 text-amber-300'
                              : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
                        }`}
                      >
                        {risk} RISK
                      </span>
                    </div>

                    <p className="mt-3 text-center text-[10px] text-slate-500">
                      Classification returned by the prediction service.
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MetricCard
                      label="Risk classification"
                      value={risk}
                      detail="Model-assigned category"
                    />
                    <MetricCard
                      label="Probability"
                      value={`${Math.round(probability * 100)}%`}
                      detail="Estimated model output"
                    />
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">
                        Risk threshold map
                      </h3>
                      <span className={`font-mono text-[10px] ${riskColor}`}>
                        {probability.toFixed(2)}
                      </span>
                    </div>

                    <div className="relative flex h-2 overflow-hidden rounded-full">
                      <div className="w-[40%] bg-emerald-400/50" />
                      <div className="w-[30%] bg-amber-400/60" />
                      <div className="w-[30%] bg-rose-400/60" />
                      <div
                        className="absolute -top-1 h-4 w-1 rounded-full bg-white"
                        style={{
                          left: `${probability * 100}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-[9px]">
                      <span className="text-emerald-300">LOW · 0–39%</span>
                      <span className="text-center text-amber-300">
                        MEDIUM · 40–69%
                      </span>
                      <span className="text-right text-rose-300">
                        HIGH · 70–100%
                      </span>
                    </div>
                  </div>

                  {lastUpdated && (
                    <p className="mt-4 text-right font-mono text-[9px] text-slate-600">
                      LAST RUN {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <span className="text-[10px] text-slate-400">
                      Detailed risk indicator
                    </span>
                    <RiskBadge
                      level={risk}
                      score={probability}
                      size="lg"
                    />
                  </div>
                </>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <h3 className="text-sm font-semibold text-white">
                    {loading
                      ? 'Analysing employee data...'
                      : 'Awaiting model inference'}
                  </h3>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">
                    Run the prediction to see the result returned by the model.
                  </p>
                </div>
              )}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-white">
              Contributing factor indicators
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Signals returned by the prediction service.
            </p>

            {predictionResult?.factors?.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {predictionResult.factors.map((factor, index) => (
                  <li
                    key={`${index}-${factor}`}
                    className="rounded-xl border border-white/[0.07] bg-[#0b1120] p-3 text-xs text-slate-300"
                  >
                    <span className="mr-2 font-mono text-cyan-300">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {factor}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-xs text-slate-500">
                {predictionResult
                  ? 'No contributing factors were returned.'
                  : 'Run an analysis to view model-returned indicators.'}
              </p>
            )}

            <p className="mt-4 text-[10px] leading-5 text-slate-500">
              Model indicators are not proof of why an employee might leave.
            </p>
          </Panel>
        </div>
      </div>

      <footer className="flex flex-col justify-between gap-2 border-t border-white/[0.06] pt-4 text-[10px] text-slate-600 sm:flex-row">
        <span>WorkforceAI · Predictive Workforce Intelligence</span>
        <span>Decision support only · Human review recommended</span>
      </footer>
    </div>
  );
}