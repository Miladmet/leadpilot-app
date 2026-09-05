import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, Search, Zap, CheckCircle2, Lock, ArrowRight, Sparkles, Database, FileText, Cpu, Scale, Award } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Auditing Methodology & Verification Standards | LeadPilot Software',
  description:
    'Discover how LeadPilot Software conducts evidence-backed website audits with zero hallucination, double-agent verification passes, and transparent opportunity sizing.',
  alternates: {
    canonical: 'https://leadpilotsoftware.com/methodology'
  },
  openGraph: {
    title: 'LeadPilot Software Auditing Methodology',
    description: 'The science behind our evidence-first website opportunity audits: crawling ethics, DOM fact extraction, and deterministic verification.',
    url: 'https://leadpilotsoftware.com/methodology',
    siteName: 'LeadPilot Software'
  }
};

export default function MethodologyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Auditing Methodology & Verification Standards - LeadPilot Software',
    url: 'https://leadpilotsoftware.com/methodology',
    description: 'The science behind our evidence-first website opportunity audits: crawling ethics, DOM fact extraction, and deterministic verification.',
    publisher: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://leadpilotsoftware.com'
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://leadpilotsoftware.com' },
          { name: 'Methodology', url: 'https://leadpilotsoftware.com/methodology' }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Auditing Science
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden md:inline">
            About Us
          </Link>
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            Case Studies
          </Link>
          <Link href="/blog" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            Blog
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Start Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-6 max-w-5xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          The Science of Evidence-Backed Auditing
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto">
          How LeadPilot Software Turns Raw Web Data Into Unquestionable Client Proposals.
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
          Unlike generic AI tools that hallucinate findings or produce vague checklists, LeadPilot Software enforces a rigorous multi-stage auditing pipeline built exclusively for agencies who cannot afford to present inaccurate claims to prospective clients.
        </p>

        {/* High-Level Trust Badges */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Hallucination Rate</span>
            <strong className="text-2xl font-black text-emerald-600 mt-1 block">0.0%</strong>
            <p className="text-xs text-slate-500 mt-0.5">Enforced by DOM validation</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Verification Passes</span>
            <strong className="text-2xl font-black text-sky-600 mt-1 block">2-Stage</strong>
            <p className="text-xs text-slate-500 mt-0.5">Extraction + cross-check</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Crawl Method</span>
            <strong className="text-2xl font-black text-slate-900 mt-1 block">GET-Only</strong>
            <p className="text-xs text-slate-500 mt-0.5">Non-intrusive & compliant</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Auditing Speed</span>
            <strong className="text-2xl font-black text-purple-600 mt-1 block">&lt;60 Sec</strong>
            <p className="text-xs text-slate-500 mt-0.5">Automated pipeline</p>
          </div>
        </div>
      </section>

      {/* Main Pillars */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              The 5 Pillars of Our Verification Architecture
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every audit finding presented to your agency client undergoes five deterministic validation stages before being written to the proposal.
            </p>
          </div>

          {/* Pillar 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 mb-4">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Pillar 01</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Ethical Public Surface Crawling</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                We inspect public, visible web assets just like Googlebot does. No security tests, no credential brute-forcing, and no intrusive network scanning.
              </p>
            </div>
            <div className="md:col-span-7 space-y-3">
              <h4 className="text-base font-bold text-slate-900">Compliant, Polite & Transparent Retrieval</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                LeadPilot Software strictly retrieves only public HTML, CSS, JavaScript, and metadata using standard HTTP GET requests. Our crawler respects <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">robots.txt</code> crawl delay parameters and avoids any action that could stress prospect servers.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Only public HTML documents and media headers are inspected.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Automatic user-agent identification and rate-limiting prevents server strain.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Zero storage of sensitive prospect database records or proprietary backend credentials.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-3 order-2 md:order-1">
              <h4 className="text-base font-bold text-slate-900">Verbatim Ground-Truth Extraction</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Before generating recommendations, our parsing engine isolates exact DOM excerpts, technical response headers, and structural elements. If an issue is flagged—such as a missing viewport meta tag, uncompressed image assets, or broken schema—the exact HTML snippet is bound to the record as immutable evidence.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Technical DOM attributes, viewport tags, and Open Graph objects extracted raw.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Core Web Vitals metrics estimated based on actual payload size and script weights.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Citations directly link findings to the originating URL and page section.</span>
                </li>
              </ul>
            </div>
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 order-1 md:order-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Database className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Pillar 02</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Deterministic Fact Extraction</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Raw HTML is stripped of noise and processed into structured evidence tables. Speculation is prohibited at the data ingestion layer.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">Pillar 03</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Double-Pass Verification</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Our dual-engine protocol requires a secondary validation agent to confirm every finding before it can be recommended to an agency.
              </p>
            </div>
            <div className="md:col-span-7 space-y-3">
              <h4 className="text-base font-bold text-slate-900">Zero-Tolerance for AI Hallucinations</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generic LLMs tend to invent fictional weaknesses when prompted for website feedback. LeadPilot Software solves this by decoupling discovery from validation. The primary analyzer identifies potential opportunities; a secondary, independent verification pass rigorously checks that finding against the raw DOM excerpts. If proof cannot be cited, the finding is discarded.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Secondary verification pass compares suggested fix against raw source code.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Unverifiable assumptions or ungrounded claims are automatically pruned.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Platform Trust Score calculates the ratio of verified vs rejected findings.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-3 order-2 md:order-1">
              <h4 className="text-base font-bold text-slate-900">Empirical Deal Sizing & Agency ROI</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Opportunity valuation ranges ($8,500 – $24,000) are not arbitrary estimates. They are derived from verified agency service pricing benchmarks across North America and Western Europe, matching technical difficulty, required engineering hours, and client revenue impact.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Standardized service categories (CRO, Technical SEO, Speed, Schema, Funnel Design).</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Calculated based on standard agency hourly rates ($125–$175/hr) and target margins.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Gives agencies transparent economic backing when justifying proposals to executives.</span>
                </li>
              </ul>
            </div>
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 order-1 md:order-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <Scale className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Pillar 04</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Agency Opportunity Sizing</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Clear economic formulas translate technical gaps into billable retainer and project values that agency clients understand.
              </p>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">Pillar 05</span>
              <h3 className="text-xl font-black text-slate-900 mt-1">Tenant Privacy & Isolation</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Agency pipelines and prospect audits are strictly confidential. We never sell agency prospect lists or use your audit data to train public models.
              </p>
            </div>
            <div className="md:col-span-7 space-y-3">
              <h4 className="text-base font-bold text-slate-900">Enterprise Tenant Boundary Protection</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                LeadPilot Software enforces cryptographic tenant isolation. Your scanned targets, custom proposal notes, and CRM synchronization webhooks exist inside your private account partition. Your competitors will never see who you are pitching or what deals you are preparing.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Zero-knowledge client data policy: we do not train foundation models on your audits.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Encrypted in-transit (TLS 1.3) and at rest with automated Row-Level Security controls.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Outbound CRM delivery utilizes fault-isolated webhooks with automatic retry buffers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Comparison Table */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            How LeadPilot Software Compares to Standard AI Tools
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Why leading digital agencies rely on LeadPilot Software instead of pasting URLs into general-purpose LLMs.
          </p>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-4 font-bold text-slate-600">Verification Dimension</th>
                <th className="p-4 font-bold text-sky-700 bg-sky-50/50">LeadPilot Software</th>
                <th className="p-4 font-bold text-slate-400">Generic ChatGPT / AI Wrappers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-4 font-semibold text-slate-900">Evidence Requirement</td>
                <td className="p-4 font-bold text-emerald-600 bg-sky-50/20">Verbatim DOM Quotes & Structural Proof</td>
                <td className="p-4 text-slate-500">None (Prone to believable hallucinations)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Verification Passes</td>
                <td className="p-4 font-bold text-emerald-600 bg-sky-50/20">Dual-Pass (Extraction + Verification)</td>
                <td className="p-4 text-slate-500">Single generation pass</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Commercial Deal Sizing</td>
                <td className="p-4 font-bold text-emerald-600 bg-sky-50/20">Real-World Agency Pricing Formulas</td>
                <td className="p-4 text-slate-500">Invented numbers with no agency context</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Competitor Gap Parity</td>
                <td className="p-4 font-bold text-emerald-600 bg-sky-50/20">Niche-specific standard gap matrices</td>
                <td className="p-4 text-slate-500">Superficial high-level summaries</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-900">Agency White-Labeling</td>
                <td className="p-4 font-bold text-emerald-600 bg-sky-50/20">Client-ready proposal decks & CRM sync</td>
                <td className="p-4 text-slate-500">Raw unformatted chat transcript</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="bg-sky-500/20 text-sky-400 border border-sky-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
            Test the Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-black">
            Generate Your First Evidence-Backed Audit in 60 Seconds
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Join hundreds of agencies, SEO consultants, and web development studios that use LeadPilot Software to pitch prospects with undeniable facts.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/register"
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Start Free Agency Scan</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/audit/sample-audit"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl transition-all border border-slate-700 flex items-center justify-center"
            >
              View Sample Public Audit
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 px-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LeadPilot Software. All rights reserved. Built exclusively for digital agencies.</p>
        <div className="mt-3 flex justify-center gap-4">
          <Link href="/about" className="hover:text-slate-800">About</Link>
          <Link href="/methodology" className="hover:text-slate-800 font-bold text-sky-600">Methodology</Link>
          <Link href="/case-studies" className="hover:text-slate-800">Case Studies</Link>
          <Link href="/what-is-leadpilot-software" className="hover:text-slate-800">Brand Disambiguation</Link>
          <Link href="/sitemap.xml" className="hover:text-slate-800">Sitemap</Link>
        </div>
      </footer>
    </div>
  );
}
