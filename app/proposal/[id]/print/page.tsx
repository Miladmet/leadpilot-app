import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

interface PrintPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function PrintProposalPage({ params }: PrintPageProps) {
  const { id } = params;

  // Retrieve the prospect report
  const prospect = await prisma.prospect.findUnique({
    where: { id },
  });

  if (!prospect) {
    notFound();
  }

  // Safely parse suggested services
  let services = [];
  try {
    services = JSON.parse(prospect.servicesSuggested) || [];
  } catch (e) {
    services = [];
  }

  // Parse pain points
  let painPoints = [];
  try {
    painPoints = JSON.parse(prospect.painPoints) || [];
  } catch (e) {
    // If not valid JSON, check if it is comma separated
    painPoints = prospect.painPoints ? prospect.painPoints.split(',') : [];
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 p-8 max-w-4xl mx-auto print:p-0">
      {/* Top Print action bar - hidden on print */}
      <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Proposal Ready for Export</h2>
          <p className="text-xs text-slate-500">Save as PDF by selecting "Save as PDF" in the printer destination options.</p>
        </div>
        <button
          onClick="window.print()"
          // Since this is a server component, we can inline a small javascript event handler
          // Wait! In Server Components, inline event handlers like onClick="window.print()" are supported if written as raw HTML, or we can use a client button or a simple script tag.
          // A simple HTML button with an inline onclick attribute is 100% compliant with RSCs if written as:
          // <button onclick="window.print()" ...>
          // Let's write standard HTML tag so it parses correctly without client wrapper!
          // Wait, Next.js JSX compiler requires camelCase event handlers, which throws error if we write onClick={window.print} on RSC.
          // To make it easy, we can include a tiny client component, or just write a script tag that hooks up the button, or render standard HTML button with an inline string template!
          // Let's write a standard JSX button and include a tiny client script tag at the bottom to bind the button click, or make the whole page a Client Component!
          // Actually, making the print page a Client Component ('use client') is extremely easy and lets us use normal React hooks and handlers!
          // Let's make it a Client Component by adding 'use client' at the top, fetching the data via an API or just passing it? No, wait! If we keep it Server Component, we fetch the DB directly (highly efficient).
          // How do we bind the print button in a Server Component?
          // We can use a standard button with id="print-btn", and at the bottom add:
          // <script dangerouslySetInnerHTML={{ __html: "document.getElementById('print-btn').onclick = function() { window.print(); }" }} />
          // This is incredibly elegant and keeps it as a fast Server Component!
          id="print-btn"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5"
        >
          🖨️ Export PDF
        </button>
      </div>

      {/* PROPOSAL HEADER */}
      <header className="border-b-4 border-sky-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">
            Client Acquisition Proposal
          </h1>
          <p className="text-sky-600 font-bold mt-1 text-sm">PREPARED FOR: {prospect.companyName}</p>
          <a href={prospect.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:underline">
            {prospect.websiteUrl}
          </a>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">LeadPilot AI Platform</p>
          <p className="text-xs text-slate-400">Date: {new Date(prospect.createdAt).toLocaleDateString()}</p>
        </div>
      </header>

      {/* SECTION 1: EXECUTIVE SUMMARY */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          1. Executive Summary
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {prospect.executiveSummary}
        </p>
      </section>

      {/* SECTION 2: AUDITED PROBLEMS */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          2. Problems Found & Opportunity Audit
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Technical & Content Issues</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prospect.problem}
            </p>
          </div>
          <div>
            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Growth & Operational Opportunities</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prospect.opportunity}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECOMMENDED SOLUTION */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          3. Recommended Solutions
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {prospect.proposedSolution}
        </p>
      </section>

      {/* SECTION 4: SERVICE BREAKDOWN & ESTIMATED ROI */}
      <section className="mb-8 page-break-before">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          4. Recommended Service Packages
        </h2>
        <table className="w-full text-left text-sm border-collapse mb-6">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="p-3 font-semibold">Service Package</th>
              <th className="p-3 font-semibold">Matched Problem</th>
              <th className="p-3 font-semibold text-right">Investment Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {services.map((service: any, index: number) => (
              <tr key={index}>
                <td className="p-3 font-bold text-slate-900">{service.name}</td>
                <td className="p-3 text-slate-600">{service.issue}</td>
                <td className="p-3 text-right font-mono font-bold text-sky-600">{service.estimatedFee}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <h3 className="text-xs text-emerald-800 font-bold uppercase">Expected Outcomes</h3>
            <p className="text-xs text-emerald-700 mt-1.5 whitespace-pre-wrap">{prospect.expectedResults}</p>
          </div>
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
            <h3 className="text-xs text-sky-800 font-bold uppercase">Estimated ROI</h3>
            <p className="text-xs text-sky-700 mt-1.5 whitespace-pre-wrap">{prospect.estimatedRoi}</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: ROADMAP TIMELINE */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          5. Project Roadmap Timelines
        </h2>
        <div className="space-y-4">
          <div>
            <span className="inline-block bg-sky-100 text-sky-700 text-xs px-2.5 py-1 rounded font-bold uppercase mb-1">
              30-Day Launch Phase
            </span>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prospect.thirtyDayPlan}
            </p>
          </div>
          <div>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded font-bold uppercase mb-1">
              90-Day Expansion Phase
            </span>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prospect.ninetyDayPlan}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: PRICING RECOMMENDATION */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          6. Pricing & Options Recommendation
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
          {prospect.pricingRecommendation}
        </p>
      </section>

      <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>Generated by LeadPilot AI Client Acquisition Platform • Confidential</p>
      </footer>

      {/* Bind the PDF print command dynamically */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const btn = document.getElementById('print-btn');
            if (btn) {
              btn.addEventListener('click', function() {
                window.print();
              });
            }
          `,
        }}
      />
    </div>
  );
}
