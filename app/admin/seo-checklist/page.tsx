import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { CheckSquare, ExternalLink, ShieldCheck, FileText, Globe, Search, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Google Search Console Readiness Checklist | LeadPilot Software',
  robots: { index: false, follow: false }
};

export default function SearchConsoleChecklistPage() {
  const steps = [
    {
      step: 1,
      title: 'Add Domain to Google Search Console',
      description: 'Log into Google Search Console and add "leadpilotsoftware.com" as a Domain property (recommended) or URL prefix property.',
      url: 'https://search.google.com/search-console',
      actionText: 'Open Search Console',
      verificationDetails: 'Use domain property to automatically cover https, http, www, and all subdomains.'
    },
    {
      step: 2,
      title: 'Verify Ownership',
      description: 'Verify ownership via DNS TXT record or HTML verification meta tag.',
      verificationDetails: 'The HTML verification meta tag is already included in app/layout.tsx: <meta name="google-site-verification" content="google6d2d4ba6b8465c71" />',
      status: 'Tag Installed'
    },
    {
      step: 3,
      title: 'Submit Dynamic Sitemap',
      description: 'Navigate to "Sitemaps" in Search Console and enter: sitemap.xml',
      url: 'https://leadpilotsoftware.com/sitemap.xml',
      actionText: 'Test Live Sitemap',
      verificationDetails: 'Sitemap contains all core routes, 4 case studies, 4 blog posts, and 6 programmatic SEO landing pages.'
    },
    {
      step: 4,
      title: 'Request Homepage Indexing',
      description: 'In the top URL Inspection bar, paste "https://leadpilotsoftware.com/" and click "Request Indexing".',
      verificationDetails: 'Establishes the primary root brand identity for "LeadPilot Software".'
    },
    {
      step: 5,
      title: 'Request About Page Indexing',
      description: 'Inspect "https://leadpilotsoftware.com/about" and "https://leadpilotsoftware.com/what-is-leadpilot-software" and request indexing.',
      verificationDetails: 'Teaches Google Knowledge Graph that LeadPilot Software is an independent agency SaaS platform distinct from other tools.'
    },
    {
      step: 6,
      title: 'Request Case Study Indexing',
      description: 'Inspect the primary case study URLs: /case-studies/watermark-resize-studio, /case-studies/dental-practice-audit, /case-studies/law-firm-client-acquisition, /case-studies/marketing-agency-retainer-expansion.',
      verificationDetails: 'Enables rich result snippets and problem/solution search visibility.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Admin & SEO Setup
            </span>
            <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-900">
              ← Return Home
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Google Search Console Readiness Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Follow this 6-step checklist to establish fast Google indexing and establish <strong>LeadPilot Software</strong> as a distinct SaaS product entity.
          </p>
        </div>

        {/* Checklist Steps */}
        <div className="space-y-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {s.step}
                  </span>
                  <div>
                    <h2 className="text-base font-black text-slate-900">{s.title}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">{s.description}</p>
                  </div>
                </div>

                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-sky-200 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span>{s.actionText}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <strong className="text-slate-800 block text-[11px] uppercase">Technical Details</strong>
                <p className="text-slate-600 text-[11px]">{s.verificationDetails}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
