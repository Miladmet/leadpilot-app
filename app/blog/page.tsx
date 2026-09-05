import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BLOG_ARTICLES } from '@/lib/blogArticles';
import { ArrowRight, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Agency Growth & Proposal Strategy Blog | LeadPilot Software',
  description:
    'Authoritative guides on turning website audits into high-ticket client retainers, conducting competitor gap analysis, and scaling agency client acquisition.',
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/blog'
  },
  openGraph: {
    title: 'LeadPilot Software Agency Growth Blog',
    description: 'Evidence-first strategies for digital agencies, SEO consultants, and web design studios.',
    url: 'https://www.leadpilotsoftware.com/blog',
    siteName: 'LeadPilot Software'
  }
};

export default function BlogIndexPage() {
  const articles = Object.values(BLOG_ARTICLES);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: 'Blog', url: 'https://www.leadpilotsoftware.com/blog' }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Agency Blog
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            About
          </Link>
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            Case Studies
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
            Agency Insights & Strategy
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            The Evidence-First Agency Blog
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Practical frameworks and benchmarks showing how agencies audit prospects, out-pitch competitors, and win high-margin retainers.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((art) => (
            <article
              key={art.slug}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded-full border border-sky-200 text-[11px]">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{art.readingTime}</span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-slate-900 leading-snug hover:text-sky-600 transition-colors">
                  <Link href={`/blog/${art.slug}`}>{art.title}</Link>
                </h2>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {art.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{art.publishedDate}</span>
                </span>
                <Link
                  href={`/blog/${art.slug}`}
                  className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 group"
                >
                  <span>Read Guide</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl text-center space-y-4 shadow-md">
          <h3 className="text-2xl font-black">Put These Strategies to Work</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Try LeadPilot Software free and uncover your first set of verified client opportunities in under 60 seconds.
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
