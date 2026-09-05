import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { CASE_STUDIES } from '@/lib/caseStudies';
import { ArrowRight, TrendingUp, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Agency Case Studies & ROI Breakdowns | LeadPilot Software',
  description:
    'Explore real case studies showing how digital agencies, SEO consultants, and web designers use LeadPilot Software to turn 60-second website audits into high-ticket client retainers.',
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/case-studies'
  },
  openGraph: {
    title: 'LeadPilot Software Agency Case Studies',
    description: 'Real client acquisition breakthroughs: How agencies uncover opportunities and win retainers.',
    url: 'https://www.leadpilotsoftware.com/case-studies',
    siteName: 'LeadPilot Software'
  }
};

export default function CaseStudiesIndexPage() {
  // Only display unique primary case studies
  const primarySlugs = [
    'watermark-resize-studio',
    'dental-practice-audit',
    'law-firm-client-acquisition',
    'marketing-agency-retainer-expansion'
  ];
  const studies = primarySlugs.map((slug) => CASE_STUDIES[slug]).filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: 'Case Studies', url: 'https://www.leadpilotsoftware.com/case-studies' }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Case Studies
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            About
          </Link>
          <Link href="/blog" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            Blog
          </Link>
          <Link href="/tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
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
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            How Agencies Win High-Ticket Deals with LeadPilot Software
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Explore verified case studies breaking down how agencies uncover opportunities, pitch evidence-backed solutions, and close high-margin retainers.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {studies.map((study) => (
            <div
              key={study.slug}
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {study.industry}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{study.potentialValueRange || study.opportunityValue} Value</span>
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-900 leading-snug">
                  {study.title}
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {study.summary}
                </p>

                {/* Structured Breakdown: Problem, Evidence, Opportunity, Solution */}
                <div className="pt-2 space-y-2 border-t border-slate-100 text-xs">
                  {study.problem && (
                    <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                      <strong className="text-rose-800 block text-[10px] uppercase font-black">Problem</strong>
                      <p className="text-slate-700 text-[11px] mt-0.5 line-clamp-2">{study.problem}</p>
                    </div>
                  )}

                  {study.evidence && (
                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                      <strong className="text-amber-800 block text-[10px] uppercase font-black">Verified Evidence</strong>
                      <p className="text-slate-700 text-[11px] mt-0.5 line-clamp-2">{study.evidence}</p>
                    </div>
                  )}

                  {study.solution && (
                    <div className="bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                      <strong className="text-sky-800 block text-[10px] uppercase font-black">Solution & Delivery</strong>
                      <p className="text-slate-700 text-[11px] mt-0.5 line-clamp-2">{study.solution}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Deal Size Won</span>
                  <strong className="text-sm font-black text-slate-900">{study.agencyRoi.closedRetainer}</strong>
                </div>
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>View Case Study</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl text-center space-y-4 shadow-md">
          <h3 className="text-2xl font-black">Ready to Uncover Similar Opportunities for Your Prospects?</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
            Run a 60-second deep website crawl with LeadPilot Software, extract verified evidence, and generate high-converting client proposals on demand.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-sm px-6 py-3 rounded-xl transition-all shadow-md inline-block"
            >
              Analyze Your First Client Website Free →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
