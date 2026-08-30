import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';

export const metadata: Metadata = {
  title: 'Agency Tools Directory | LeadPilot AI',
  description: 'Explore the full suite of evidence-backed agency tools: website audits, SEO proposal generators, client acquisition software, and competitor gap analyzers.'
};

export default function ToolsDirectoryPage() {
  const tools = Object.values(SEO_KEYWORDS);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Tools Directory
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/free-tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Free Calculators
          </Link>
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Case Studies
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-4 py-2 rounded-xl font-bold transition-all shadow-sm"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 md:py-16 px-6 max-w-6xl mx-auto space-y-12 w-full">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            Agency Operating System
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Agency Tools for Client Acquisition & Growth
          </h1>
          <p className="text-base text-slate-600 leading-relaxed font-medium">
            Turn raw website data into client-ready deliverables in under 60 seconds. Select a specialized tool below to explore its workflow.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                    {tool.badgeText}
                  </span>
                  <span className="text-xs text-slate-400 group-hover:text-sky-600 font-bold transition-colors">
                    Learn More →
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                  {tool.keyword}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tool.metaDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Audience: {tool.targetAudience.split(',')[0]}</span>
                <span className="text-emerald-600 font-bold">✓ 60s Analysis</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Box */}
        <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl text-center space-y-4">
          <h3 className="text-2xl md:text-3xl font-black">
            Ready to find opportunities and win more agency clients?
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Scan up to 10 prospective client websites per month free. No credit card required.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold text-sm inline-block shadow-lg transition-all"
            >
              Create Free Account →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p suppressHydrationWarning>© {new Date().getFullYear()} LeadPilot AI. Evidence-backed agency client acquisition.</p>
      </footer>
    </div>
  );
}
