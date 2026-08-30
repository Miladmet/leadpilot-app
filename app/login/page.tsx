'use strict';
'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  classifyAuthError, 
  ClassifiedAuthError, 
  fetchAuthDiagnostics, 
  AuthDiagnosticsData 
} from '@/lib/authErrors';
import { 
  AlertCircle, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Database, 
  Server, 
  X, 
  CheckCircle2, 
  HelpCircle,
  WifiOff
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<ClassifiedAuthError | null>(null);
  
  // Diagnostics Drawer State
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<AuthDiagnosticsData | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleRunDiagnostics = async () => {
    setDiagnosticsLoading(true);
    try {
      const data = await fetchAuthDiagnostics();
      setDiagnosticsData(data);
    } catch (e) {
      console.error('[Diagnostics] Failed to fetch:', e);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  const openDiagnostics = () => {
    setShowDiagnostics(true);
    if (!diagnosticsData) {
      handleRunDiagnostics();
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAuthError(null);

    // Client-side quick checks
    if (!email.trim()) {
      setAuthError({
        category: 'VALIDATION_ERROR',
        userMessage: 'Please enter your email address.',
        actionHint: 'A valid email is required to access your account.',
        isRetryable: false
      });
      setLoading(false);
      return;
    }

    if (!password) {
      setAuthError({
        category: 'VALIDATION_ERROR',
        userMessage: 'Please enter your account password.',
        actionHint: 'Password is required to sign in.',
        isRetryable: false
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        // Non-JSON response (e.g. 502/504 HTML page)
        console.error('[Login Response Parse Error]:', parseErr);
      }

      if (!res.ok) {
        const classified = classifyAuthError(data.error || 'Login failed', res.status);
        console.error('[Login Failed - Internal Log]:', {
          status: res.status,
          category: classified.category,
          technical: classified.technicalDetails,
          timestamp: new Date().toISOString()
        });
        setAuthError(classified);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      // Catches browser fetch errors (e.g. "Load failed", "Failed to fetch", offline)
      console.error('[Login Network Exception - Internal Log]:', err);
      const classified = classifyAuthError(err);
      setAuthError(classified);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 relative">
      {/* ---------------- DIAGNOSTICS MODAL ---------------- */}
      {showDiagnostics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-sky-600" />
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                  Authentication Diagnostics
                </h3>
              </div>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Real-time connectivity and status indicators for LeadPilot authentication infrastructure.
            </p>

            {diagnosticsData ? (
              <div className="space-y-2.5">
                {/* Server Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-slate-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Server Status</span>
                      <span className="text-[10px] text-slate-400">Next.js Edge & API Gateway</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    diagnosticsData.serverStatus === 'Operational' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    ● {diagnosticsData.serverStatus}
                  </span>
                </div>

                {/* Database Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Database Status</span>
                      <span className="text-[10px] text-slate-400">Prisma ORM & Tenant Store</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    diagnosticsData.databaseStatus === 'Connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    ● {diagnosticsData.databaseStatus}
                  </span>
                </div>

                {/* Authentication Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Authentication Engine</span>
                      <span className="text-[10px] text-slate-400">JWT Token Signing & Validation</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    diagnosticsData.authStatus === 'Ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    ● {diagnosticsData.authStatus}
                  </span>
                </div>

                {/* Latency & Timestamp */}
                <div className="p-2.5 bg-slate-100/70 rounded-xl flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Round-Trip Latency: <strong className="text-slate-800 font-bold">{diagnosticsData.latencyMs}ms</strong></span>
                  <span>{new Date(diagnosticsData.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin text-sky-600 mx-auto" />
                <span className="text-xs text-slate-500 font-medium">Checking platform status...</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleRunDiagnostics}
                disabled={diagnosticsLoading}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${diagnosticsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Ping</span>
              </button>
              <button
                onClick={() => setShowDiagnostics(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block text-3xl font-black text-sky-600">
          LeadPilot AI
        </Link>
        <div className="mt-2">
          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200 uppercase tracking-wider">
            Find Opportunities. Generate Proposals. Win Clients.
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your agency account
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 max-w-xs mx-auto">
          LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
        </p>
        <p className="mt-3 text-center text-sm text-slate-600">
          Or{' '}
          <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-500">
            register for a 10-analysis free account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-xl sm:px-10 border border-slate-200 space-y-6">
          
          {/* USER-FRIENDLY ERROR BANNER WITH RETRY & DIAGNOSTICS */}
          {authError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                {authError.category === 'NETWORK_ERROR' ? (
                  <WifiOff className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <strong className="font-bold text-rose-900 block">
                    {authError.userMessage}
                  </strong>
                  {authError.actionHint && (
                    <p className="text-rose-700 text-[11px] leading-relaxed">
                      {authError.actionHint}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons: Retry Connection & View Diagnostics */}
              <div className="flex items-center gap-2 pt-1 border-t border-rose-150">
                {authError.isRetryable && (
                  <button
                    type="button"
                    onClick={() => handleLogin()}
                    disabled={loading}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    <span>Retry Connection</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={openDiagnostics}
                  className="text-slate-700 hover:text-slate-900 text-[11px] font-semibold underline flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <HelpCircle className="h-3 w-3 text-slate-500" />
                  <span>View Diagnostics</span>
                </button>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            {/* Email Field with Mobile Keyboard Support */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError && authError.category === 'VALIDATION_ERROR') {
                      setAuthError(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      passwordInputRef.current?.focus();
                    }
                  }}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-sm font-medium transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field with Mobile Keyboard Support */}
            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="mt-1">
                <input
                  ref={passwordInputRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError && authError.category === 'VALIDATION_ERROR') {
                      setAuthError(null);
                    }
                  }}
                  className="block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-sm font-medium transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-3 text-sm font-bold text-white shadow-md transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer items-center gap-2"
              >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              </button>
            </div>
          </form>

          {/* Discreet diagnostics link at bottom */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={openDiagnostics}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <Activity className="h-3 w-3" />
              <span>Platform Connection Diagnostics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
