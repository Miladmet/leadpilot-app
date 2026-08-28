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
    services = JSON.parse(prospect.recommendations) || [];
  } catch (e) {
    services = [];
  }

  // Parse evidence details
  let verifiedFacts = [];
  try {
    verifiedFacts = JSON.parse(prospect.verifiedFacts) || [];
  } catch (e) {
    verifiedFacts = [];
  }

  let buyingSignals = [];
  try {
    buyingSignals = JSON.parse(prospect.buyingSignals) || [];
  } catch (e) {
    buyingSignals = [];
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 p-8 max-w-4xl mx-auto print:p-0">
      {/* Top Print action bar - hidden on print */}
      <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Evidence-Based Proposal</h2>
          <p className="text-xs text-slate-500">Every finding in this proposal is traceable back to audited website quotes.</p>
        </div>
        <button
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
            Evidence-Based Proposal
          </h1>
          <p className="text-sky-600 font-bold mt-1 text-sm">PREPARED FOR: {prospect.companyName}</p>
          <a href={prospect.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:underline">
            {prospect.websiteUrl}
          </a>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">LeadPilot AI Auditor</p>
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

      {/* SECTION 2: AUDITED SOLUTIONS */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          2. Problems Audited
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
          {prospect.problem}
        </p>
      </section>

      {/* SECTION 3: RECOMMENDED SOLUTION */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          3. Proposed Strategies
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {prospect.proposedSolution}
        </p>
      </section>

      {/* SECTION 4: SERVICE BREAKDOWN & ESTIMATED ROI */}
      <section className="mb-8 page-break-before">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-slate-200 pb-2 mb-3">
          4. Service Recommendations
        </h2>
        <table className="w-full text-left text-sm border-collapse mb-6">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
              <th className="p-3 font-semibold">Service Package</th>
              <th className="p-3 font-semibold">Target Issue</th>
              <th className="p-3 font-semibold">Confidence</th>
              <th className="p-3 font-semibold text-right">Investment Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {services.map((service: any, index: number) => (
              <tr key={index}>
                <td className="p-3 font-bold text-slate-900">{service.serviceName}</td>
                <td className="p-3 text-slate-600">{service.issue}</td>
                <td className="p-3 font-semibold text-emerald-600">{service.confidence}%</td>
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
          5. 30/90 Day Timelines
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
          6. Pricing Options
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
          {prospect.pricingRecommendation}
        </p>
      </section>

      {/* SECTION 7: APPENDIX - CITATIONS & EVIDENCE AUDIT */}
      <section className="mb-8 page-break-before">
        <h2 className="text-lg font-bold text-slate-900 uppercase border-b border-sky-600 pb-2 mb-3">
          Appendix: Verifiable Website Evidence
        </h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          The following facts and quotes were audited and verified from the company's public domain. Recommendations are mathematically matched to these findings.
        </p>

        <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Verified Content Facts</h3>
        <div className="space-y-3 mb-6">
          {verifiedFacts.map((fact: any, index: number) => (
            <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <p className="font-bold text-slate-800">Fact {index + 1}: {fact.fact}</p>
              <blockquote className="mt-1.5 border-l-2 border-slate-400 pl-2 text-slate-500 italic">
                "{fact.evidenceText}"
              </blockquote>
              <a href={fact.sourceUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-sky-600 mt-1 hover:underline">
                Source: {fact.sourceUrl}
              </a>
            </div>
          ))}
        </div>

        {buyingSignals.length > 0 && (
          <>
            <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Verifiable Intent & Hiring Signals</h3>
            <div className="space-y-3">
              {buyingSignals.map((sig: any, index: number) => (
                <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <p className="font-bold text-slate-800">Signal {index + 1}: {sig.signal}</p>
                  <blockquote className="mt-1.5 border-l-2 border-slate-400 pl-2 text-slate-500 italic">
                    "{sig.sourceText}"
                  </blockquote>
                  <div className="flex justify-between items-center mt-1">
                    <a href={sig.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-sky-600 hover:underline">
                      Source: {sig.sourceUrl}
                    </a>
                    <span className="text-[9px] text-slate-400">Audited: {sig.dateDiscovered}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>Generated by LeadPilot AI Client Acquisition Platform • Confidential</p>
      </footer>

      {/* Bind print command */}
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
