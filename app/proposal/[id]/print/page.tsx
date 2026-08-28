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

  let pricingAssumptions = { assumptions: [], pricingModel: '', disclaimer: '' };
  try {
    pricingAssumptions = JSON.parse(prospect.revenueAssumptions) || { assumptions: [], pricingModel: '', disclaimer: '' };
  } catch (e) {}

  return (
    <div className="min-h-screen bg-white text-slate-800 p-8 max-w-4xl mx-auto print:p-0">
      
      {/* Top action bar - hidden on print */}
      <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Evidence-Based & Verified Proposal</h2>
          <p className="text-xs text-slate-500">Press Export PDF to save as a verified client-ready PDF document.</p>
        </div>
        <button
          id="print-btn"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5"
        >
          🖨️ Export PDF
        </button>
      </div>

      {/* PROPOSAL HEADER */}
      <header className="border-b-4 border-slate-900 pb-6 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-wider">
            Verified proposal
          </h1>
          <p className="text-sky-600 font-bold mt-1 text-sm">PREPARED FOR: {prospect.companyName}</p>
          <a href={prospect.websiteUrl} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:underline">
            {prospect.websiteUrl}
          </a>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">LeadPilot AI Verification Suite</p>
          <p className="text-xs text-slate-400">Date Audited: {new Date(prospect.createdAt).toLocaleDateString()}</p>
        </div>
      </header>

      {/* Trust & Self-Correction Banner */}
      <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="text-center">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Evidence Quality</span>
          <span className="text-base font-black text-emerald-600">{prospect.evidenceQuality}%</span>
        </div>
        <div className="text-center border-x border-slate-200">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verification Pass Rate</span>
          <span className="text-base font-black text-sky-600">{prospect.verificationPassRate}%</span>
        </div>
        <div className="text-center">
          <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Finding Reliability</span>
          <span className="text-base font-black text-indigo-600">{prospect.findingReliability}%</span>
        </div>
      </div>

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
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between items-start">
              <div>
                <span className="font-bold text-slate-800">✅ {fact.fact}</span>
                {fact.evidenceText && (
                  <blockquote className="mt-1.5 border-l-2 border-slate-350 pl-2 text-slate-500 italic">
                    "{fact.evidenceText}"
                  </blockquote>
                )}
                <span className="block text-[10px] text-slate-400 mt-2"><strong>Source:</strong> {fact.sourceUrl}</span>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase ml-4">
                {fact.status || 'Verified'}
              </span>
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
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-sm">Opportunity {idx + 1}: {rec.serviceName}</h3>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                  rec.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {rec.status}
                </span>
              </div>
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

      {/* SECTION 8: SAFE REVENUE ESTIMATES & FINANCIAL DISCLAIMER */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          8. Safe Project Value Valuation Range
        </h2>
        
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <span className="font-bold text-slate-700">Estimated Opportunity Range:</span>
            <span className="text-lg font-black text-emerald-600 font-mono">{prospect.opportunityRange}</span>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Pricing Model Assumptions</h4>
            <ul className="list-disc pl-4 mt-1.5 text-slate-600 space-y-1.5">
              {pricingAssumptions.assumptions.map((asm: string, index: number) => (
                <li key={index}>{asm}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Financial Disclaimer</h4>
            <p className="mt-1.5 text-[10px] text-slate-400 italic leading-relaxed">
              {pricingAssumptions.disclaimer}
            </p>
          </div>
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>Generated by LeadPilot AI Safe Verification Platform • Confidential</p>
      </footer>

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
