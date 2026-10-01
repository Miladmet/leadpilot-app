import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Target, Activity, CheckCircle, ShieldCheck, Zap, DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function ProposalIntelligencePage({ params }: Props) {
  const { id } = params;

  // 1. Authenticate user
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const authPayload = token ? verifyToken(token) : null;

  if (!authPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-black mb-2 text-rose-400">Unauthorized</h2>
          <p className="text-sm text-slate-400">Please log in to LeadPilot to view this proposal.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Proposal
  const proposal = await prisma.proposals.findUnique({
    where: { id },
    include: {
      prospect: true
    }
  });

  if (!proposal) {
    notFound();
  }

  // 3. Render Proposal Intelligence Document
  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-4 inline-block">
                Generated via Opportunity Intelligence Engine
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mt-2">
                {proposal.title}
              </h1>
              <p className="text-sm text-slate-500 font-semibold mt-2">
                Prepared For: <span className="text-slate-800">{proposal.prospect?.companyName || 'Valued Client'}</span>
              </p>
            </div>
            
            <div className="text-left md:text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg border border-sky-100 font-bold text-sm">
                <CheckCircle className="w-4 h-4" />
                {proposal.status}
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-3">
                {new Date(proposal.createdAt).toLocaleDateString()} at {new Date(proposal.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Value Estimate</span>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span className="text-xl font-black text-slate-800">{proposal.valueEstimate}</span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Confidence Rating</span>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-500" />
              <span className="text-xl font-black text-slate-800">{proposal.confidenceRating}%</span>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evidence Score</span>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <span className="text-xl font-black text-slate-800">{proposal.evidenceScore}/100</span>
            </div>
          </div>
          
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Engine Trust</span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xl font-black text-white">{proposal.trustScore}/100</span>
            </div>
          </div>
        </div>

        {/* PROPOSAL BODY */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Executive Summary
                </h3>
              </div>
              <div className="p-5 sm:p-6 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {proposal.executiveSummary}
              </div>
            </section>
            
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  Problem & Evidence
                </h3>
              </div>
              <div className="p-5 sm:p-6 space-y-5 text-sm text-slate-600">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Identified Problem:</h4>
                  <p className="leading-relaxed">{proposal.problem}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-1 text-[11px] uppercase tracking-wider">Verified Evidence:</h4>
                  <p className="leading-relaxed font-mono text-[11px] text-slate-500">{proposal.evidence}</p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  The Opportunity
                </h3>
              </div>
              <div className="p-5 sm:p-6 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {proposal.opportunity}
              </div>
            </section>

          </div>
          
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 p-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Timeline & Next Steps
                </h3>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estimated Timeline</h4>
                  <p className="text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block">
                    {proposal.timeline}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Next Steps</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {proposal.nextSteps.split('\n').map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{step.replace(/^\d+\.\s*/, '')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        {/* FOOTER */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Powered by LeadPilot Proposal Intelligence Engine
          </p>
        </footer>
        
      </div>
    </div>
  );
}
