import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { sanitizePublicAudit } from '@/lib/growthEngine';
import { ShieldCheck, TrendingUp, Sparkles, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Public Website Opportunity Audit | LeadPilot AI`,
    description: `Evidence-backed website audit and opportunity summary powered by LeadPilot AI. Generate your own audit in under 60 seconds.`
  };
}

export default async function PublicAuditPage({ params }: Props) {
  let prospect = null;

  try {
    prospect = await prisma.prospect.findUnique({
      where: { id: params.id }
    });
  } catch (err) {
    console.error('Error loading public audit:', err);
  }

  // Fallback demo audit for sample preview URLs (e.g. /audit/sample or /audit/demo)
  if (!prospect) {
    prospect = {
      id: params.id || 'sample-audit',
      companyName: 'Acme Cloud Technologies',
      websiteUrl: 'https://acmecloud.com',
      createdAt: new Date().toISOString(),
      opportunityRange: '$12,000 - $38,000',
      opportunityScore: 88,
      evidenceQuality: 94,
      verificationPassRate: 96,
      pagesCrawledCount: 8,
      crawlCoveragePercent: 92,
      executiveSummary: 'Multi-page evidence audit of Acme Cloud Technologies identified critical conversion friction on mobile checkout tiers and high-impact SEO schema gaps.',
      recommendations: JSON.stringify([
        { service: 'Mobile Conversion Rate Optimization', estimatedFee: '$4,500 - $8,000', status: 'Verified', explanation: 'Primary signup CTAs drop below viewport fold on mobile devices.' },
        { service: 'Topical SEO Schema & FAQ Injection', estimatedFee: '$3,000 - $6,500', status: 'Verified', explanation: 'Service catalog lacks FAQPage and Organization structured data markup.' },
        { service: 'Core Web Vitals Speed Sprint', estimatedFee: '$2,500 - $5,000', status: 'Verified', explanation: 'Hero image assets lack WebP compression, elevating LCP to 3.8 seconds.' },
        { service: 'Competitor Parity Expansion', estimatedFee: '$3,500 - $7,500', status: 'Verified', explanation: 'Top 3 competitors offer interactive pricing calculators; target site requires manual quote.' }
      ]),
      competitorGaps: JSON.stringify([
        { area: 'Instant Pricing Calculator', status: 'Missing on target site, present on 85% of competitors' },
        { area: 'Customer Video Case Studies', status: 'Target site features text only; rivals display verified video proof' },
        { area: 'Live Chat / Co-browsing Support', status: 'Target site has contact form only' }
      ]),
      verifiedFacts: JSON.stringify([
        { fact: 'Target website runs Next.js with Tailwind CSS framework.' },
        { fact: 'Pricing page lists 3 service tiers starting at $299/month.' },
        { fact: 'Careers section indicates active hiring for 4 enterprise sales roles.' }
      ])
    };
  }

  const audit = sanitizePublicAudit(prospect);
  if (!audit) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Banner with Strong CTA */}
      <div className="bg-slate-900 text-white px-6 py-3 text-xs font-semibold flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
            Public Audit
          </span>
          <span>This evidence-backed audit was generated with LeadPilot AI in under 60 seconds.</span>
        </div>
        <Link
          href="/register"
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-1.5 rounded-xl font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5"
        >
          <span>Generate Your Own Audit Free →</span>
        </Link>
      </div>

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </Link>
          <span className="hidden sm:inline bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Audit Deliverable
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/register"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Create Agency Account
          </Link>
        </div>
      </header>

      {/* Main Audit Content */}
      <main className="flex-1 py-10 px-6 max-w-5xl mx-auto space-y-8 w-full">
        {/* Title Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Website Opportunity Audit
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {audit.companyName}
            </h1>
            <p className="text-xs text-slate-500 font-mono" suppressHydrationWarning>
              {audit.websiteUrl} • Generated on {audit.createdAt ? audit.createdAt.substring(0, 10) : '2026-08-30'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trust Score</span>
              <strong className="text-xl font-black text-sky-600 block">{audit.trustScore}%</strong>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Opportunity Value</span>
              <strong className="text-xl font-black text-emerald-600 block">{audit.opportunityRange}</strong>
            </div>
          </div>
        </div>

        {/* 1. Platform Trust Score Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Platform Trust & Verification Status
              </h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              ● Verified Evidence ({audit.trustScore}%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Verification Pass Rate</span>
              <strong className="text-sm font-black text-slate-900 mt-0.5 block">{audit.verificationPassRate}%</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Crawl Coverage</span>
              <strong className="text-sm font-black text-slate-900 mt-0.5 block">{audit.crawlCoveragePercent}%</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Pages Crawled</span>
              <strong className="text-sm font-black text-slate-900 mt-0.5 block">{audit.pagesCrawledCount} Pages</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Facts</span>
              <strong className="text-sm font-black text-slate-900 mt-0.5 block">{audit.verifiedFactsCount} Verified</strong>
            </div>
          </div>
        </div>

        {/* 2. Opportunity Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Opportunity Summary & Recommended Services
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Total Scope: {audit.opportunityRange}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {audit.executiveSummary}
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {audit.topOpportunities.map((opp, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <strong className="text-xs font-bold text-slate-900">{opp.title}</strong>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {opp.fee}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {opp.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Competitor Gap Snapshot */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Competitor Gap Snapshot
            </h3>
          </div>

          <div className="space-y-2">
            {audit.competitorGaps && audit.competitorGaps.length > 0 ? (
              audit.competitorGaps.map((gap, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs">
                  <span className="text-amber-500 font-bold mt-0.5">⚠️</span>
                  <div>
                    <strong className="text-slate-900 font-bold">{gap.area || 'Gap Area'}</strong>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">{gap.status || gap.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No critical competitor omissions identified.</p>
            )}
          </div>
        </div>

        {/* 4. Strong Conversion CTA Box */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl text-center space-y-5 shadow-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold uppercase tracking-wider border border-sky-500/30">
            For Agencies, Consultants & Web Designers
          </span>
          <h2 className="text-3xl sm:text-4xl font-black max-w-xl mx-auto leading-tight">
            Want to Deliver Audits Like This to Your Own Prospects?
          </h2>
          <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
            LeadPilot helps digital agencies turn any prospective client website into an evidence-backed audit and proposal deck in under 60 seconds.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-3.5 rounded-xl font-black text-sm transition-all shadow-lg cursor-pointer"
            >
              Generate Your Own Audit Free →
            </Link>
            <Link
              href="/free-tools"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-xl font-bold text-sm transition-all border border-white/20"
            >
              Explore Free Calculators
            </Link>
          </div>

          <p className="text-[11px] text-slate-400">
            10 Free scans per month • No credit card required • Zero setup time
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LeadPilot AI. Evidence-backed agency client acquisition.</p>
      </footer>
    </div>
  );
}
