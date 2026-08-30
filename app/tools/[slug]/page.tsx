import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SEO_KEYWORDS, SeoKeywordData } from '@/lib/seoKeywords';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(SEO_KEYWORDS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = SEO_KEYWORDS[params.slug];
  if (!data) {
    return {
      title: 'Agency Tools | LeadPilot AI',
      description: 'Explore LeadPilot AI client acquisition and website audit tools for agencies.'
    };
  }

  return {
    title: data.title,
    description: data.metaDescription,
    keywords: [data.keyword, 'lead generation', 'agency software', 'website audit', 'proposals', 'client acquisition'],
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      type: 'website',
      url: `https://leadpilot.ai/tools/${data.slug}`
    }
  };
}

export default function ToolLandingPage({ params }: Props) {
  const data: SeoKeywordData | undefined = SEO_KEYWORDS[params.slug];

  if (!data) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: `LeadPilot AI - ${data.keyword}`,
        operatingSystem: 'Web',
        applicationCategory: 'BusinessApplication',
        description: data.metaDescription,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      },
      {
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* JSON-LD Script Ingestion */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </Link>
          <span className="hidden sm:inline bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            {data.badgeText}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/free-tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden md:inline">
            Free Tools
          </Link>
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden md:inline">
            Case Studies
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 md:py-24 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-block bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            {data.targetAudience}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            {data.headline}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            {data.subtitle}
          </p>

          {/* Interactive URL Scanner Form */}
          <div className="mt-10 max-w-xl mx-auto">
            <form action="/register" method="GET" className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-md">
              <input
                type="text"
                name="url"
                placeholder="Enter client website (e.g. acme.com)"
                className="flex-1 px-4 py-3 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                required
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Analyze Website Free →
              </button>
            </form>
            <div className="mt-3 text-xs text-slate-500 flex justify-center items-center gap-3">
              <span>✓ No credit card required</span>
              <span>•</span>
              <span>✓ Results in under 60 seconds</span>
              <span>•</span>
              <span>✓ 10 free scans/mo</span>
            </div>
          </div>
        </section>

        {/* Key Benefits Grid */}
        <section className="bg-slate-50 py-16 px-6 border-y border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Why Leading Agencies Choose LeadPilot</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Built to Win Retainers, Not Just Generate Reports</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {data.keyBenefits.map((benefit, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem vs Solution Section */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">The Old Agency Way</span>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                {data.problemStatement}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                When agencies pitch prospects with generic statements or unverified checklists, decision makers assume it is automated spam. LeadPilot grounds every single finding in verifiable on-page text quotes, screenshots, and exact URLs.
              </p>
              <div className="pt-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-600 hover:text-sky-700"
                >
                  See How LeadPilot Fixes This →
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block">The LeadPilot 3-Step Process</span>
              <div className="space-y-4">
                {data.solutionBreakdown.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.step}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{step.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-slate-50 py-16 px-6 border-y border-slate-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Frequently Asked Questions</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Questions About Our {data.keyword}</h2>
            </div>

            <div className="space-y-4">
              {data.faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                  <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Agency Tools (Internal Linking Cluster) */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Explore Related Agency Solutions</span>
            <h3 className="text-xl font-black text-slate-900 mt-1">More High-Converting Agency Tools</h3>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.relatedSlugs.map((slug) => {
              const related = SEO_KEYWORDS[slug];
              if (!related) return null;
              return (
                <Link
                  key={slug}
                  href={`/tools/${slug}`}
                  className="p-4 bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm rounded-xl transition-all block group"
                >
                  <span className="text-[10px] uppercase font-bold text-sky-600 block">{related.badgeText}</span>
                  <strong className="text-xs text-slate-800 font-bold block mt-1 group-hover:text-sky-600 transition-colors">
                    {related.keyword}
                  </strong>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{related.metaDescription}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-slate-900 text-white py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-black">
              Turn Any Website Into a Client Proposal in Under 60 Seconds
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Join agencies, consultants, and web designers closing high-ticket retainers with evidence-backed client proposals.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg"
              >
                Start Using {data.keyword} Free →
              </Link>
              <Link
                href="/free-tools"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3.5 rounded-xl font-bold text-base transition-all border border-slate-700"
              >
                Browse Free Tools
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p suppressHydrationWarning>© {new Date().getFullYear()} LeadPilot AI. Evidence-backed agency client acquisition.</p>
      </footer>
    </div>
  );
}
