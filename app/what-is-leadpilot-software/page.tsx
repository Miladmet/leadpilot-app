import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ShieldCheck, CheckCircle, HelpCircle, ArrowRight, Zap, Target, Layers, FileText } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'What Is LeadPilot Software? | Brand Overview & Agency Platform Guide',
  description:
    'Learn what LeadPilot Software is, how it differs from unrelated products like leadpilot.com or leadpilot.chat, and how digital agencies use it for evidence-backed client proposals.',
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/what-is-leadpilot-software'
  },
  openGraph: {
    title: 'What Is LeadPilot Software? Brand Guide & Overview',
    description: 'A dedicated SaaS platform for digital agencies. Learn how LeadPilot Software works and how it differs from other tools.',
    url: 'https://www.leadpilotsoftware.com/what-is-leadpilot-software',
    siteName: 'LeadPilot Software'
  }
};

export default function WhatIsLeadPilotSoftwarePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: 'What Is LeadPilot Software?', url: 'https://www.leadpilotsoftware.com/what-is-leadpilot-software' }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Brand Guide
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            About
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
        {/* Header Hero */}
        <section className="text-center space-y-4">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
            Official Brand & Architecture Guide
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            What Is LeadPilot Software?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            A standalone, proprietary B2B SaaS platform engineered specifically to help digital agencies audit prospective clients and generate evidence-backed proposals in 60 seconds.
          </p>
        </section>

        {/* 1. What Is LeadPilot Software */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-3">
            1. What Is LeadPilot Software?
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
            <strong>LeadPilot Software</strong> (operating at <Link href="https://www.leadpilotsoftware.com" className="text-sky-600 font-bold hover:underline">leadpilotsoftware.com</Link>) is a specialized client acquisition and proposal engine for agencies, SEO consultancies, and web design studios.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Unlike generic web crawlers or email scrapers, LeadPilot Software analyzes target domains through the lens of an agency sales pitch. In under 60 seconds, it discovers high-impact pages (pricing models, service tiers, schema markup, mobile viewport performance), extracts verified facts, benchmarks competitors, and compiles executive proposals with realistic opportunity valuations.
          </p>
        </section>

        {/* 2. How It Differs from Other LeadPilot Products */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <HelpCircle className="h-6 w-6 text-sky-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">
              2. How It Differs from Other "LeadPilot" Products
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Because several unrelated tools share similar names, Google and customers should note these fundamental distinctions:
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black text-sm block">
                LeadPilot Software vs. leadpilot.com
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                `leadpilot.com` is a financial advisor marketing and email newsletter platform. In contrast, <strong>LeadPilot Software</strong> is a technical website audit, evidence verification, and proposal engine built exclusively for marketing, SEO, and web design agencies.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black text-sm block">
                LeadPilot Software vs. leadpilot.chat / AI Chatbots
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                `leadpilot.chat` and generic chatbot widgets focus on live chat messaging on customer websites. <strong>LeadPilot Software</strong> is a deep intelligence crawler that operates independently to discover opportunities, calculate agency ROI, and build pitch decks before discovery calls.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black text-sm block">
                LeadPilot Software vs. Generic AI Prompt Wrappers
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generic AI tools hallucinate assumptions about prospects. <strong>LeadPilot Software</strong> operates on an strict <em>Evidence-First Engine</em>: every recommendation is grounded in real DOM elements, HTTP responses, schema audits, and verbatim quotes.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Who It Serves */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Target className="h-6 w-6 text-emerald-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">3. Who It Serves</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            LeadPilot Software is engineered for B2B client services:
          </p>
          <ul className="grid sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-black">Digital Marketing Agencies</strong>
              <span>To pitch verified revenue upside and multi-phase retainers.</span>
            </li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-black">SEO Agencies & Freelancers</strong>
              <span>To uncover technical schema omissions, localized gaps, and speed bottlenecks.</span>
            </li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-black">Web Design & CRO Studios</strong>
              <span>To demonstrate mobile checkout friction and layout shift issues with proof.</span>
            </li>
            <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block font-black">B2B Growth Consultants</strong>
              <span>To conduct thorough discovery in 60 seconds and save 5+ hours per pitch.</span>
            </li>
          </ul>
        </section>

        {/* 4. Platform Capabilities */}
        <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="h-6 w-6 text-indigo-600 shrink-0" />
            <h2 className="text-xl font-black text-slate-900">4. Platform Capabilities</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">Multi-Page Discovery Crawler</strong>
              <p className="text-slate-600">Automatically explores high-yield subpages (pricing, features, about, case studies, terms) to gather evidence.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">Opportunity Valuation Engine</strong>
              <p className="text-slate-600">Calculates conservative, realistic opportunity value ranges using transparent pricing attribution models.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">7 Specialized Solution Sandboxes</strong>
              <p className="text-slate-600">Generates wireframes and models for Website Redesigns, SEO Content, Lead Gen Funnels, AI Automation, Conversion Optimization, Pricing, and Competitor Gaps.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <strong className="text-slate-900 font-black block">Executive Deliverable Generator</strong>
              <p className="text-slate-600">Exports white-label PDFs, discovery call scripts, 30-day quick wins, and 90-day execution roadmaps.</p>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4">
          <h3 className="text-2xl font-black">Experience LeadPilot Software</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Try the evidence-backed website audit platform trusted by modern agencies.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md inline-block"
            >
              Start Free Account →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
