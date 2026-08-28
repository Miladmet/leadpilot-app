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

  // Safely parse arrays
  let verifiedFacts = [];
  try { verifiedFacts = JSON.parse(prospect.verifiedFacts) || []; } catch (e) {}

  let insights = [];
  try { insights = JSON.parse(prospect.aiInferences) || []; } catch (e) {}

  let recommendations = [];
  try { recommendations = JSON.parse(prospect.recommendations) || []; } catch (e) {}

  return (
    <div className="min-h-screen bg-white text-slate-800 p-8 max-w-4xl mx-auto print:p-0">
      
      {/* Top action bar - hidden on print */}
      <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Client-Ready Proposal</h2>
          <p className="text-xs text-slate-500">Press Export PDF to open the printer window and save as PDF.</p>
        </div>
        <button
          id="print-btn"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5"
        >
          🖨️ Export PDF
        </button>
      </div>

      {/* PROPOSAL HEADER */}
      <header className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-wider">
            Service proposal
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
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          1. Executive Summary
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {prospect.executiveSummary}
        </p>
      </section>

      {/* SECTION 2: VERIFIED FINDINGS */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          2. Verified Findings
        </h2>
        <div className="space-y-3">
          {verifiedFacts.map((fact: any, idx: number) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-800">✅ {fact.fact}</span>
              <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
                <span><strong>Source:</strong> {fact.sourceUrl}</span>
                <span><strong>Confidence:</strong> {fact.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: BUSINESS OPPORTUNITIES */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          3. Business Opportunities
        </h2>
        <div className="space-y-4">
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Opportunity {idx + 1}: {rec.serviceName}</h3>
              <p className="text-slate-600"><strong>Issue:</strong> {rec.issue}</p>
              <p className="text-slate-600"><strong>Impact:</strong> {rec.impact}</p>
              <div className="flex gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span><strong>Revenue Potential:</strong> {rec.estimatedFee}</span>
                <span><strong>Confidence:</strong> {rec.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: RECOMMENDED SERVICES & SOLUTIONS */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          4. Recommended Solutions
        </h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3">Problem Found</th>
              <th className="p-3">Solution / Recommended Service</th>
              <th className="p-3">Expected Outcome</th>
              <th className="p-3 text-right">Value Estimate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {recommendations.map((rec: any, idx: number) => (
              <tr key={idx}>
                <td className="p-3 font-semibold text-rose-700">{rec.issue}</td>
                <td className="p-3 font-bold text-slate-900">{rec.serviceName}</td>
                <td className="p-3 text-slate-600">{rec.expectedOutcome}</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-600">${(rec.estimatedValue || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* SECTION 5: COST ESTIMATE */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          5. Pricing & Cost Estimate
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
          {prospect.pricingRecommendation}
        </p>
      </section>

      {/* SECTION 6: EXPECTED OUTCOMES & ROI */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          6. Expected Outcomes & Estimated ROI
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <h3 className="text-xs text-emerald-800 font-bold uppercase">Quantifiable Outcomes</h3>
            <p className="text-xs text-emerald-700 mt-1.5 whitespace-pre-wrap">{prospect.expectedResults}</p>
          </div>
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl">
            <h3 className="text-xs text-sky-800 font-bold uppercase">Estimated ROI Matrix</h3>
            <p className="text-xs text-sky-700 mt-1.5 whitespace-pre-wrap">{prospect.estimatedRoi}</p>
          </div>
        </div>
      </section>

      {/* SECTION 7: PROJECT ROADMAP TIMELINES */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          7. Action Timelines
        </h2>
        <div className="space-y-4">
          <div>
            <span className="inline-block bg-sky-100 text-sky-700 text-xs px-2.5 py-1 rounded font-bold uppercase mb-1">
              30-Day Action Plan
            </span>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prospect.thirtyDayPlan}
            </p>
          </div>
          <div>
            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded font-bold uppercase mb-1">
              90-Day Action Plan
            </span>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prospect.ninetyDayPlan}
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>Generated by LeadPilot AI Client Acquisition Platform • Confidential</p>
      </footer>

      {/* Bind print */}
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
