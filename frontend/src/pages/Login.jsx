import React, { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemo = (role) => {
    if (role === 'hr') {
      setEmail('hr@workforce.ai');
      setPassword('HR@12345');
    } else {
      setEmail('employee@workforce.ai');
      setPassword('EMP@12345');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.login(email.trim(), password);

      if (!response?.success) {
        throw new Error(response?.message || 'Login failed.');
      }

      localStorage.setItem('workforce_token', response.token);
      localStorage.setItem(
        'workforce_user',
        JSON.stringify(response.user)
      );

      onLogin(response.user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050b18] text-white">
      {/* Background effects */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-2">

        {/* LEFT: BRANDING */}
        <section className="flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-10">

          <header className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-2xl font-black text-cyan-300 shadow-lg shadow-cyan-500/10">
              W
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Workforce<span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-xs tracking-wide text-slate-400">
                PREDICTIVE WORKFORCE INTELLIGENCE
              </p>
            </div>
          </header>

          <div className="py-12 lg:py-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-medium tracking-wider text-cyan-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              AI-POWERED <span className="text-slate-600">|</span> PEOPLE-CENTRIC
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-slate-400">
              ANALYZE. PREDICT. RETAIN.
            </p>

            <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Smarter People Decisions for a{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                Stronger Tomorrow.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
              Understand workforce trends, identify potential attrition
              risks, and discover skill development opportunities through
              data-driven intelligence.
            </p>

            {/* Feature cards */}
            <div className="mt-9 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  icon: '↗',
                  title: 'Attrition Prediction',
                  desc: 'Identify potential retention risks',
                },
                {
                  icon: '◎',
                  title: 'Skill Mapping',
                  desc: 'Discover workforce skill gaps',
                },
                {
                  icon: '⌘',
                  title: 'Smart Recommendations',
                  desc: 'Explore learning opportunities',
                },
                {
                  icon: '◈',
                  title: 'Workforce Analytics',
                  desc: 'Support informed decisions',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="group flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xl text-cyan-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative analytics panel */}
            <div className="relative mt-8 hidden max-w-lg overflow-hidden rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-blue-500/[0.10] to-cyan-400/[0.02] p-5 sm:block">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Workforce Intelligence
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Turning workforce data into insights
                  </p>
                </div>
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300">
                  AI INSIGHTS
                </div>
              </div>

              <div className="relative mt-5 flex h-20 items-end gap-2">
                {[30, 46, 38, 62, 50, 76, 58, 88, 68, 96, 73, 84].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600/40 to-cyan-300/90 transition-opacity hover:opacity-70"
                      style={{ height: `${height}%` }}
                    />
                  )
                )}
              </div>
              <p className="mt-3 text-[10px] text-slate-500">
                Illustrative visualization — not live workforce data
              </p>
            </div>
          </div>

          <footer className="border-t border-white/[0.08] pt-5 text-xs text-slate-500">
            Built for a more informed, people-centric workforce.
          </footer>
        </section>

        {/* RIGHT: LOGIN */}
        <section className="flex items-center justify-center border-t border-white/[0.07] bg-white/[0.015] px-5 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-12">
          <div className="w-full max-w-md">

            <div className="mb-6 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Welcome to your workspace
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">
                ◈ Secure Login
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#0b1425]/90 p-6 shadow-2xl shadow-black/30 sm:p-9">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-2xl text-cyan-300">
                  ↗
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome Back<span className="text-cyan-400">.</span>
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Sign in to access your workforce intelligence dashboard.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.08] p-4 text-sm text-red-300"
                >
                  <span aria-hidden="true">!</span>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#101d31] px-4 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/10">
                    <span className="text-lg text-cyan-300" aria-hidden="true">
                      ✉
                    </span>
                    <input
                      id="email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-200"
                    >
                      Password
                    </label>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#101d31] px-4 transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/10">
                    <span className="text-lg text-cyan-300" aria-hidden="true">
                      ♙
                    </span>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="min-w-0 flex-1 bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-xs font-medium text-slate-400 transition hover:text-cyan-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-semibold text-slate-950 shadow-lg shadow-cyan-500/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In to Dashboard
                      <span className="text-lg transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo credentials */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-medium tracking-[0.2em] text-slate-500">
                  DEMO ACCESS
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => fillDemo('hr')}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-lg text-blue-300">
                    ◈
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-200">
                      HR Manager
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      hr@workforce.ai
                    </span>
                  </span>
                  <span className="text-xs font-medium text-cyan-300">
                    Use →
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemo('employee')}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-lg text-cyan-300">
                    ♙
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-200">
                      Employee
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      employee@workforce.ai
                    </span>
                  </span>
                  <span className="text-xs font-medium text-cyan-300">
                    Use →
                  </span>
                </button>
              </div>

              <p className="mt-5 text-center text-[11px] leading-5 text-slate-500">
                Demo credentials are for local demonstration only.
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Workforce<span className="font-semibold text-cyan-400">AI</span>
              {' '}· Secure · Intelligent · Future-Ready
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}