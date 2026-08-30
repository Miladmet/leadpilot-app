import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { CASE_STUDIES } from '@/lib/caseStudies';
import { ArrowRight, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agency Case Studies & ROI Breakdowns | LeadPilot AI',
  description: 'Explore real case studies showing how digital agencies, SEO consultants, and web designers turn 60-second website audits into high-ticket client retainers.'
};

export default function CaseStudiesIndexPage() {
  const studies = Object.values(CASE_STUDIES);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </Link>
          <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Case Studies
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/free-tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Free Tools
          </Link>
          <Link href="/tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Solutions
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6 max-w-5xl mx-auto space-y-10 w-full">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            Agency Success Stories
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            How Agencies Win High-Ticket Deals with LeadPilot
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Explore verified case studies breaking down how agencies uncover opportunities, pitch evidence-backed solutions, and close retainers.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {studies.map((study) => (
            <Link
              key={study.slug}
              href={`/case-studies/${study.slug}`}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                    {study.industry}
                  </span>
                  <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
                    {study.opportunityValue} Value
                  </span>
                </div>
                <h2 className="text-base font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                  {study.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {study.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{study.agencyRoi.closedRetainer.split(' ')[0]} Retainer</span>
                <span className="text-sky-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Read Breakdown</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Box */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4">
          <h3 className="text-2xl font-black">
            Want to audit your next prospect in 60 seconds?
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Scan target websites, verify evidence, and export client-ready proposal decks.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-block"
            >
              Create Free Account →
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
