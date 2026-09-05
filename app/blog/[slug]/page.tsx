import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { BLOG_ARTICLES, BlogArticleData } from '@/lib/blogArticles';
import { ArrowLeft, Clock, Calendar, User, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return Object.keys(BLOG_ARTICLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = BLOG_ARTICLES[params.slug];
  if (!article) {
    return {
      title: 'Agency Blog | LeadPilot Software',
      description: 'Authoritative agency growth and proposal guides.'
    };
  }

  return {
    title: `${article.title} | LeadPilot Software`,
    description: article.description,
    alternates: {
      canonical: `https://www.leadpilotsoftware.com/blog/${article.slug}`
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://www.leadpilotsoftware.com/blog/${article.slug}`,
      siteName: 'LeadPilot Software',
      type: 'article',
      publishedTime: article.publishedDate,
      authors: [article.author]
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description
    }
  };
}

export default function BlogArticleDetailPage({ params }: Props) {
  const article: BlogArticleData | undefined = BLOG_ARTICLES[params.slug];

  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedDate,
    author: {
      '@type': 'Organization',
      name: article.author,
      url: 'https://www.leadpilotsoftware.com'
    },
    publisher: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://www.leadpilotsoftware.com'
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.leadpilotsoftware.com/blog/${article.slug}`
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.leadpilotsoftware.com' },
          { name: 'Blog', url: 'https://www.leadpilotsoftware.com/blog' },
          { name: article.title, url: `https://www.leadpilotsoftware.com/blog/${article.slug}` }
        ]}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="hidden sm:inline bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Agency Insights
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-slate-600 hover:text-slate-900 font-medium text-sm flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>All Articles</span>
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
      <main className="flex-1 py-10 px-6 max-w-3xl mx-auto space-y-8 w-full">
        {/* Article Header Card */}
        <div className="bg-white p-6 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-sky-100 text-sky-800 font-bold px-3 py-1 rounded-full text-[11px]">
              {article.category}
            </span>
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readingTime}</span>
            </span>
            <span className="text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>Published {article.publishedDate}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            {article.description}
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                LP
              </div>
              <span className="font-bold text-slate-800">{article.author}</span>
            </div>
            <span className="text-slate-400">Evidence-First Methodology</span>
          </div>
        </div>

        {/* Article Body */}
        <article className="bg-white p-7 sm:p-10 rounded-3xl border border-slate-200 shadow-xs prose prose-slate max-w-none space-y-6 text-slate-800 leading-relaxed text-sm sm:text-base">
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl font-black text-slate-900 pt-4 border-b border-slate-100 pb-2">
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }

            if (trimmed.startsWith('#### ')) {
              return (
                <h4 key={idx} className="text-base font-black text-slate-900 pt-2">
                  {trimmed.replace('#### ', '')}
                </h4>
              );
            }

            if (trimmed.startsWith('---')) {
              return <hr key={idx} className="border-slate-100 my-6" />;
            }

            if (trimmed.startsWith('1. ') || trimmed.startsWith('- ')) {
              const lines = trimmed.split('\n');
              return (
                <ul key={idx} className="space-y-2 text-xs sm:text-sm pl-4 list-disc text-slate-700">
                  {lines.map((l, lIdx) => (
                    <li key={lIdx} className="leading-relaxed">
                      {l.replace(/^[0-9]+\.\s+/, '').replace(/^-\s+/, '')}
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* In-Article Promotion Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl text-center space-y-4 shadow-md">
          <div className="inline-block bg-sky-500/20 text-sky-300 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Automate This Process
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Turn Any Target Website Into a Client Proposal in Under 60 Seconds
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
            Try LeadPilot Software free. Deep crawl prospective client sites, verify real opportunities, and close high-margin retainers.
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
