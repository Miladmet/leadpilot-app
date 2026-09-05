import React from 'react';
import Link from 'next/link';
import { SeoKeywordData } from '@/lib/seoKeywords';
import { ArrowRight, CheckCircle2, Search, ShieldCheck, Sparkles, Zap, ChevronRight, HelpCircle } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface Props {
  data: SeoKeywordData;
  canonicalPath: string;
}

export function LandingPageTemplate({ data, canonicalPath }: Props) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `LeadPilot Software - ${data.keyword}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Cloud',
    url: `https://www.leadpilotsoftware.com${canonicalPath}`,
    description: data.metaDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://www.leadpilotsoftware.com'
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
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: data.keyword, url: `https://www.leadpilotsoftware.com${canonicalPath}` }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="hidden sm:inline bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {data.badgeText || 'Agency Suite'}
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-14 sm:py-20 px-6 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            <span>{data.targetAudience}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto">
            {data.headline}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            {data.subtitle}
          </p>

          {/* Interactive URL Scanner Input */}
          <div className="pt-4 max-w-xl mx-auto">
            <form action="/register" method="GET" className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-md">
              <input
                type="text"
                name="url"
                placeholder="Enter client website URL (e.g. stripe.com)"
                className="flex-1 px-4 py-3.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                required
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-6 py-3.5 rounded-xl font-black transition-all shadow-md shrink-0 cursor-pointer"
              >
                Scan Website Free →
              </button>
            </form>
            <span className="text-[11px] text-slate-400 font-medium block mt-2">
              Instant 60-second crawl • No credit card required • 10 Free Analyses
            </span>
          </div>
        </section>

        {/* Key Benefits Grid */}
        <section className="py-12 bg-white border-y border-slate-200 px-6">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Engineered for High-Ticket Agency Retainers
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                How LeadPilot Software helps agencies win more deals with verifiable evidence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {data.keyBenefits.map((b, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                  <div className="text-2xl">{b.icon}</div>
                  <strong className="text-base font-black text-slate-900 block">{b.title}</strong>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem vs Solution Section */}
        <section className="py-14 px-6 max-w-4xl mx-auto space-y-8">
          <div className="bg-rose-50/70 border border-rose-200 p-6 sm:p-8 rounded-3xl space-y-2">
            <strong className="text-rose-900 font-black text-sm uppercase tracking-wider block">
              The Traditional Challenge
            </strong>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {data.problemStatement}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center">
              The LeadPilot Software 3-Step Execution Model
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              {data.solutionBreakdown.map((s, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                    {s.step}
                  </span>
                  <strong className="text-sm font-black text-slate-900 block">{s.title}</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="py-12 bg-white border-t border-slate-200 px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-500">Everything you need to know about {data.keyword}.</p>
            </div>

            <div className="space-y-4 pt-4">
              {data.faqs.map((faq, i) => (
                <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <strong className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-sky-600 shrink-0" />
                    <span>{faq.question}</span>
                  </strong>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-14 px-6 max-w-4xl mx-auto text-center">
          <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-4 shadow-lg">
            <h3 className="text-2xl sm:text-3xl font-black">
              Start Using {data.keyword} Today
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
              Join growth agencies and consultants using LeadPilot Software to uncover verified opportunities and win clients in under 60 seconds.
            </p>
            <div className="pt-2">
              <Link
                href="/register"
                className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-black text-sm px-6 py-3.5 rounded-xl transition-all shadow-md inline-block"
              >
                Scan Your First Prospect Free →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
