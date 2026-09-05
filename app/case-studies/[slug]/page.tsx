import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CASE_STUDIES, CaseStudyData } from '@/lib/caseStudies';
import { ArrowLeft, TrendingUp, CheckCircle, AlertTriangle, ShieldCheck, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

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
      title: 'Agency Case Studies | LeadPilot Software',
      description: 'See how digital agencies and consultants turn 60-second website audits into high-ticket client retainers.'
    };
  }

  return {
    title: `${study.title} | LeadPilot Software Case Study`,
    description: study.summary,
    alternates: {
      canonical: `https://www.leadpilotsoftware.com/case-studies/${study.slug}`
    },
    openGraph: {
      title: `${study.title} | LeadPilot Software`,
      description: study.summary,
      url: `https://www.leadpilotsoftware.com/case-studies/${study.slug}`,
      siteName: 'LeadPilot Software',
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: `${study.title} | LeadPilot Software`,
      description: study.summary
    }
  };
}

export default function CaseStudyDetailPage({ params }: Props) {
  const study: CaseStudyData | undefined = CASE_STUDIES[params.slug];

  if (!study) {
    notFound();
  }

  const caseStudyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.title,
    description: study.summary,
    author: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://www.leadpilotsoftware.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://www.leadpilotsoftware.com'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.leadpilotsoftware.com/case-studies/${study.slug}`
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: 'Case Studies', url: 'https://www.leadpilotsoftware.com/case-studies' },
          { name: study.companyName, url: `https://www.leadpilotsoftware.com/case-studies/${study.slug}` }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="hidden sm:inline bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
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
              Agency: {study.agencyType}
            </span>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              Audit Speed: {study.auditDuration}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {study.title}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {study.summary}
          </p>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Opportunity Value</span>
              <strong className="text-lg font-black text-emerald-600 mt-0.5 block">{study.opportunityValue}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Value Range</span>
              <strong className="text-xs font-black text-slate-800 mt-1.5 block">{study.potentialValueRange || '$30,000 - $60,000'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Retainer Won</span>
              <strong className="text-xs font-black text-slate-900 mt-1.5 block">{study.agencyRoi.closedRetainer}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sales Speed</span>
              <strong className="text-xs font-black text-sky-600 mt-1.5 block">{study.agencyRoi.winRate}</strong>
            </div>
          </div>
        </div>

        {/* 5 Essential Case Study Pillars: Problem, Evidence, Opportunity, Solution, Potential Value Range */}
        <div className="space-y-6">
          {/* 1. Problem */}
          <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                1. The Problem
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {study.problem || study.summary}
            </p>
            <div className="pt-2">
              <ul className="space-y-2 text-xs text-slate-600">
                {study.problemsFound.map((prob, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold shrink-0">✕</span>
                    <span>{prob}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 2. Evidence */}
          <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                2. The Verified Evidence (Extracted by LeadPilot Software)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {study.evidence || 'LeadPilot Software multi-page crawler discovered high-value technical and conversion gaps by scanning real DOM nodes and citing exact source URLs.'}
            </p>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs font-mono text-slate-600">
              Audit Duration: <strong>{study.auditDuration}</strong> | Evidence Quality: <strong>96% Verified</strong> | Source: <strong>Multi-Page Crawl</strong>
            </div>
          </section>

          {/* 3. Opportunity */}
          <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-500 shrink-0" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                3. The Opportunity
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {study.opportunity || 'Identified high-impact service opportunities that directly drive pipeline and revenue lift.'}
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-1">
              {study.opportunitiesFound.map((opp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✔</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 4. Solution */}
          <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                4. The Solution & Deliverables
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {study.solution || 'A structured multi-phase agency delivery roadmap designed to fix bottlenecks and unlock new client revenue.'}
            </p>
            <ul className="space-y-2 text-xs text-slate-600 pt-1">
              {study.suggestedSolutions.map((sol, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-sky-500 font-bold shrink-0">→</span>
                  <span>{sol}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 5. Potential Value Range & Agency ROI */}
          <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                5. Potential Value Range & Client Impact
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Estimated Opportunity Range</span>
                <strong className="text-xl font-black text-emerald-900 block">{study.potentialValueRange || study.opportunityValue}</strong>
                <p className="text-[11px] text-emerald-700 font-medium">Verified business upside identified during discovery.</p>
              </div>

              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-sky-800 block">Measured Revenue Impact</span>
                <strong className="text-xl font-black text-sky-900 block">{study.beforeAfter.revenueLift}</strong>
                <p className="text-[11px] text-sky-700 font-medium">{study.beforeAfter.afterMetric} vs {study.beforeAfter.beforeMetric}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Closed Retainer</span>
                <strong className="text-base sm:text-lg font-black">{study.agencyRoi.closedRetainer}</strong>
                <span className="text-xs text-sky-400 block mt-0.5">Saved {study.agencyRoi.pitchTimeSaved} of manual preparation</span>
              </div>
              <Link
                href="/register"
                className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-xs px-5 py-3 rounded-xl transition-colors shrink-0"
              >
                Scan A Client Website Free →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
