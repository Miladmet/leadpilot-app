import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, Search, Zap, CheckCircle2, Lock, ArrowRight, Sparkles, Building2, Users } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'About LeadPilot Software | The Evidence-Backed Agency Platform',
  description:
    'Learn how LeadPilot Software helps digital agencies, SEO consultants, and web studios uncover verified website opportunities and win high-margin client retainers.',
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/about'
  },
  openGraph: {
    title: 'About LeadPilot Software',
    description: 'The evidence-backed agency acceleration platform: How LeadPilot Software works, who it helps, and our mission.',
    url: 'https://www.leadpilotsoftware.com/about',
    siteName: 'LeadPilot Software'
  }
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: 'About', url: 'https://www.leadpilotsoftware.com/about' }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            About Us
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/what-is-leadpilot-software" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden md:inline">
            Brand Overview
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

      {/* Main Content */}
      <main className="flex-1 py-12 px-6 max-w-4xl mx-auto space-y-12 w-full">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
            Evidence Before Recommendations
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            About LeadPilot Software
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            LeadPilot Software is an independent B2B agency intelligence platform engineered to replace generic, low-converting SEO audits with indisputable, evidence-backed client proposals.
          </p>
        </section>

        {/* Section 1: What Is LeadPilot Software? */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Sparkles className="h-6 w-6 text-sky-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">What Is LeadPilot Software?</h2>
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            <strong>LeadPilot Software</strong> is a purpose-built software application designed specifically for digital marketing agencies, SEO consultants, web design shops, and growth firms. 
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Traditional agency prospecting relies on either sending spam cold emails or spending 4–6 hours manually auditing a prospect's website before a discovery call. LeadPilot Software automates this entire pipeline into under 60 seconds: deep multi-page discovery, fact extraction, competitor gap analysis, opportunity valuation, and one-click deliverable generation.
          </p>
        </section>

        {/* Section 2: How It Works */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Zap className="h-6 w-6 text-amber-500 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">How It Works</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">1</span>
              <strong className="text-sm font-black text-slate-900 block">Deep Multi-Page Crawl</strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Input any target URL. LeadPilot Software crawls key pages including Pricing, About, Services, and FAQs in under 60 seconds.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">2</span>
              <strong className="text-sm font-black text-slate-900 block">Evidence Verification</strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every opportunity is cross-verified against real DOM nodes, citing exact page URLs and verbatim text quotes.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">3</span>
              <strong className="text-sm font-black text-slate-900 block">Client Deliverables</strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate 30-60-90 day execution plans, cold email angles, interactive solution sandboxes, and exportable PDF proposals.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Who It Helps */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Users className="h-6 w-6 text-emerald-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">Who It Helps</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">Digital Marketing & Growth Agencies</strong>
              <p className="text-slate-600">Stop pitching speculative tactics. Present verifiable revenue upside and competitor gaps during discovery calls.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">SEO Consultants & Search Strategists</strong>
              <p className="text-slate-600">Surface technical schema omissions, mobile layout shifts, and localized gaps in 60 seconds without complex crawlers.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">Web Design & CRO Studios</strong>
              <p className="text-slate-600">Demonstrate why prospects are losing desktop and mobile traffic before pitching full website redesigns.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">B2B Sales Development & Lead Gen Firms</strong>
              <p className="text-slate-600">Equip SDRs with personalized, authentic opening hooks that cite real prospect bottlenecks rather than generic templates.</p>
            </div>
          </div>
        </section>

        {/* Section 4: Evidence-Based Analysis */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <CheckCircle2 className="h-6 w-6 text-indigo-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">Evidence-Based Analysis</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            Our core product philosophy is <strong>Evidence Before Recommendations</strong>.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Generic AI tools generate generic advice that prospects immediately dismiss. LeadPilot Software enforces a strict **Trust & Verification Engine**: every suggested recommendation must link directly to an extracted public evidence item with an exact source URL, page title, and confidence score. If an inference cannot be proven, it is suppressed from client-facing deliverables.
          </p>
        </section>

        {/* Section 5: Privacy & Security */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Lock className="h-6 w-6 text-emerald-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">Privacy & Security</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            LeadPilot Software is built on an enterprise-grade multi-tenant architecture:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold shrink-0">✔</span>
              <span><strong>Row Level Security (RLS)</strong>: Complete account isolation ensuring your prospect lists and client notes are 100% private.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold shrink-0">✔</span>
              <span><strong>Storage Malware Protection</strong>: Pre-storage file scanning, magic-byte verification, and zero-trust download gates.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold shrink-0">✔</span>
              <span><strong>Public Only Scanning</strong>: The crawler only parses publicly accessible HTML pages, respecting robots.txt standards.</span>
            </li>
          </ul>
        </section>

        {/* CTA Footer */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4">
          <h3 className="text-2xl font-black">Experience Evidence-Backed Prospecting</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Scan your first prospective client website and see how LeadPilot Software turns public evidence into high-converting proposals.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-block"
            >
              Start Free (10 Free Analyses) →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
