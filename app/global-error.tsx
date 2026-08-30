'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-800">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            ⚠️
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Application Recovery
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              A temporary client-side error occurred. Your account and data are safe.
            </p>
          </div>

          {error.digest && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-mono text-slate-500">
              Reference: {error.digest}
            </div>
          )}

          <button
            onClick={() => reset()}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
