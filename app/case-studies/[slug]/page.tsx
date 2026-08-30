import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CASE_STUDIES, CaseStudyData } from '@/lib/caseStudies';
import { ArrowLeft, TrendingUp, CheckCircle, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(CASE_STUDIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const study = CASE_STUDIES[params.slug];
  if (!study) {
    return {
      title: 'Agency Case Studies | LeadPilot AI',
      description: 'See how digital agencies and consultants turn 60-second website audits into high-ticket client retainers.'
    };
  }

  return {
    title: `${study.title} | LeadPilot AI Case Study`,
    description: study.summary
  };
}

export default function CaseStudyDetailPage({ params }: Props) {
  const study: CaseStudyData | undefined = CASE_STUDIES[params.slug];

  if (!study) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </Link>
          <span className="hidden sm:inline bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Agency Case Study
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>All Case Studies</span>
          </Link>
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 px-6 max-w-4xl mx-auto space-y-8 w-full">
        {/* Title & Metadata Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
              {study.industry}
            </span>
            <span className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full">
              Agency Type: {study.agencyType}
            </span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              Audit Time: {study.auditDuration}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {study.title}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {study.summary}
          </p>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Opportunity Value Found</span>
              <strong className="text-xl font-black text-emerald-600 mt-0.5 block">{study.opportunityValue}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Retainer Won</span>
              <strong className="text-sm font-black text-slate-900 mt-1 block">{study.agencyRoi.closedRetainer}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales Speed</span>
              <strong className="text-sm font-black text-sky-600 mt-1 block">{study.agencyRoi.winRate}</strong>
            </div>
          </div>
        </div>

        {/* 1. Problems Found & Opportunities Found (2-Column Grid) */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Problems Found */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Problems Found on Client Website
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              {study.problemsFound.map((prob, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold mt-0.5 shrink-0">✕</span>
                  <span className="leading-relaxed font-medium">{prob}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities Found */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-5 w-5 text-sky-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Opportunities Uncovered
              </h3>
            </div>
            <ul className="space-y-3 text-xs text-slate-700">
              {study.opportunitiesFound.map((opp, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold mt-0.5 shrink-0">✔</span>
                  <span className="leading-relaxed font-medium">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2. Suggested Solutions Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Suggested Agency Solutions
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {study.suggestedSolutions.map((sol, i) => (
              <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                  {sol}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Before / After Example */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Before vs After Implementation
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Before Optimization</span>
              <strong className="text-lg font-black text-rose-900 block">{study.beforeAfter.beforeMetric}</strong>
              <p className="text-xs text-rose-800 leading-relaxed">{study.beforeAfter.beforeState}</p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">After Optimization</span>
              <strong className="text-lg font-black text-emerald-900 block">{study.beforeAfter.afterMetric}</strong>
              <p className="text-xs text-emerald-800 leading-relaxed">{study.beforeAfter.afterState}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-xl text-center text-xs font-bold flex justify-center items-center gap-2">
            <span>Overall Client Impact:</span>
            <span className="text-emerald-400 text-sm font-black">{study.beforeAfter.revenueLift}</span>
          </div>
        </div>

        {/* Bottom Conversion Box */}
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-8 sm:p-10 rounded-3xl text-center space-y-4 shadow-lg">
          <h3 className="text-2xl font-black">
            Replicate These Results with Your Agency Prospects
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Run an evidence-backed website audit on any target company in 60 seconds and generate client proposals that close.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md inline-block"
            >
              Start Free Today (10 Audits/Mo) →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p suppressHydrationWarning>© {new Date().getFullYear()} LeadPilot AI. Evidence-backed agency client acquisition.</p>
      </footer>
    </div>
  );
}
