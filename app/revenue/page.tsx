'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Target, Zap, Clock, FileText, Mail, Activity, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RevenueDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Unauthorized');

        const res = await fetch('/api/revenue');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const m = data?.metrics || {};
  const f = data?.funnel || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              Revenue Potential Dashboard
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Track business value generated across all verified opportunities.
            </p>
          </div>
        </div>
        <Link href="/opportunities" className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors px-4 py-2 rounded-lg">
          View Pipeline
        </Link>
      </header>

      <main className="flex-1 p-4 sm:p-6 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
        
        {/* Core Revenue Metrics */}
        <div>
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Core Revenue Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Potential Revenue</span>
              <div className="flex items-center gap-2 relative z-10">
                <DollarSign className="w-6 h-6 text-emerald-500" />
                <span className="text-3xl font-black text-slate-800">${m.potentialRevenue?.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-sky-50 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confidence-Adjusted</span>
              <div className="flex items-center gap-2 relative z-10">
                <Activity className="w-6 h-6 text-sky-500" />
                <span className="text-3xl font-black text-slate-800">${Math.round(m.confidenceAdjustedRevenue || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-rose-50 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Proposal Value</span>
              <div className="flex items-center gap-2 relative z-10">
                <FileText className="w-6 h-6 text-rose-500" />
                <span className="text-3xl font-black text-slate-800">${m.proposalValue?.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full blur-2xl"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Quick Win Revenue</span>
              <div className="flex items-center gap-2 relative z-10">
                <Zap className="w-6 h-6 text-amber-500" />
                <span className="text-3xl font-black text-slate-800">${m.quickWinRevenue?.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Breakdown */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Opportunity Funnel</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
              
              <div className="space-y-1.5 relative">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-600 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400"/> Total Potential</span>
                  <span className="text-slate-900">{f.totalPotential} Opps</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-slate-300 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-emerald-700 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> Qualified (&gt;70% Conf)</span>
                  <span className="text-emerald-900">{f.qualifiedPotential} Opps</span>
                </div>
                <div className="w-full bg-emerald-50 rounded-full h-3">
                  <div className="bg-emerald-400 h-3 rounded-full" style={{ width: `${Math.max(5, (f.qualifiedPotential / Math.max(1, f.totalPotential)) * 100)}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-sky-700 flex items-center gap-2"><Target className="w-4 h-4 text-sky-500"/> High Confidence (&gt;90% Conf)</span>
                  <span className="text-sky-900">{f.highConfidence} Opps</span>
                </div>
                <div className="w-full bg-sky-50 rounded-full h-3">
                  <div className="bg-sky-400 h-3 rounded-full" style={{ width: `${Math.max(5, (f.highConfidence / Math.max(1, f.totalPotential)) * 100)}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-rose-700 flex items-center gap-2"><FileText className="w-4 h-4 text-rose-500"/> Proposal Ready</span>
                  <span className="text-rose-900">{f.proposalReady} Opps</span>
                </div>
                <div className="w-full bg-rose-50 rounded-full h-3">
                  <div className="bg-rose-400 h-3 rounded-full" style={{ width: `${Math.max(5, (f.proposalReady / Math.max(1, f.totalPotential)) * 100)}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-indigo-700 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-500"/> Outreach Ready</span>
                  <span className="text-indigo-900">{f.outreachReady} Opps</span>
                </div>
                <div className="w-full bg-indigo-50 rounded-full h-3">
                  <div className="bg-indigo-400 h-3 rounded-full" style={{ width: `${Math.max(5, (f.outreachReady / Math.max(1, f.totalPotential)) * 100)}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Time-To-Value Distribution</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 grid grid-rows-2 gap-4 h-[calc(100%-2rem)]">
              
              <div className="flex items-center gap-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Quick Win Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-2">High impact, low effort opportunities that can be closed and delivered within 30 days.</p>
                  <span className="text-2xl font-black text-amber-600">${m.quickWinRevenue?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                  <Clock className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Long-Term Pipeline</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-2">Larger operational fixes that require 60-90 day timelines and larger retainers.</p>
                  <span className="text-2xl font-black text-slate-600">${m.longTermRevenue?.toLocaleString()}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
