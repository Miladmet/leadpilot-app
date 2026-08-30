'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to client console for diagnostics
    console.error('LeadPilot Client Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
            Safe Recovery Mode
          </span>
          <h2 className="text-xl font-black text-slate-900">
            A temporary client glitch occurred
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Your data and database are completely safe. This is usually caused by a page hydration mismatch or temporary browser cache mismatch.
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-500">
            Error Reference ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Component</span>
          </button>

          <Link
            href="/"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 px-4 rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-2"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Link>
        </div>

        <p className="text-[10px] text-slate-400">
          LeadPilot Fault Isolation & Resilience Framework
        </p>
      </div>
    </div>
  );
}
