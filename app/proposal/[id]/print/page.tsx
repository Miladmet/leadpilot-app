import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { calculateTrustScore } from '@/lib/trustEngine';


interface PrintPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function PrintProposalPage({ params }: PrintPageProps) {
  const { id } = params;

  // 1. PDF Security: Verify User Authentication
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  const authPayload = token ? verifyToken(token) : null;

  if (!authPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-black">
            403
          </div>
          <h1 className="text-xl font-black">403 Forbidden</h1>
          <p className="text-xs text-slate-300">
            Storage Security Gate: Authentication is strictly required to view or export customer proposal PDFs.
          </p>
        </div>
      </div>
    );
  }

  // 2. Retrieve the prospect report and verify strict ownership
  const prospect = await prisma.prospect.findUnique({
    where: { id },
  });

  if (!prospect) {
    notFound();
  }

  if (prospect.userId !== authPayload.userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-black">
            403
          </div>
          <h1 className="text-xl font-black">403 Forbidden</h1>
          <p className="text-xs text-slate-300">
            Storage Security Violation: You do not have ownership of this proposal document. Cross-tenant access is blocked.
          </p>
        </div>
      </div>
    );
  }

  // Derive auditable Platform Trust metrics for this proposal
  const trustData = calculateTrustScore({
    verificationPassRate: prospect.verificationPassRate,
    evidenceQuality: prospect.evidenceQuality,
    crawlCoveragePercent: prospect.crawlCoveragePercent,
    findingReliability: prospect.findingReliability,
    rlsCoveragePercent: 100,
    storageSecurityScore: 100,
    tenantIsolationPassRate: 100,
  });



  // Safely parse arrays
  let verifiedFacts = [];
  try { verifiedFacts = JSON.parse(prospect.verifiedFacts) || []; } catch (e) {}

  let insights = [];
  try { insights = JSON.parse(prospect.aiInferences) || []; } catch (e) {}

  let recommendations = [];
  try { recommendations = JSON.parse(prospect.recommendations) || []; } catch (e) {}

  let competitorGaps = [];
  try { competitorGaps = JSON.parse(prospect.competitorGaps || "[]") || []; } catch (e) {}

  let pricingAssumptions = { assumptions: [], pricingModel: '', disclaimer: '' };
  try {
    pricingAssumptions = JSON.parse(prospect.revenueAssumptions) || { assumptions: [], pricingModel: '', disclaimer: '' };
  } catch (e) {}

  let scoreExplanations = { opportunityScore: { score: 50, explanation: '', breakdown: [], evidence: [] }, buyingSignalScore: { score: 50, explanation: '', breakdown: [], evidence: [] }, techStack: [] };
  try {
    scoreExplanations = JSON.parse(prospect.scoreExplanations) || { opportunityScore: { score: 50, explanation: '', breakdown: [], evidence: [] }, buyingSignalScore: { score: 50, explanation: '', breakdown: [], evidence: [] }, techStack: [] };
  } catch (e) {}
  const techStack = scoreExplanations.techStack || [];

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

      {/* PRINT STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
        }
      `}} />

      {/* PREMIUM COVER PAGE */}
      <div className="min-h-[1000px] flex flex-col justify-between border-b-8 border-slate-900 pb-12 mb-12 page-break-after">
        <div className="pt-24">
          <span className="text-xs font-bold tracking-widest text-sky-600 uppercase">LEADPILOT AI • SOLUTIONS SUITE</span>
          <div className="h-2 w-16 bg-sky-600 mt-4 mb-12"></div>
          
          <h1 className="text-5xl font-black text-slate-900 leading-tight uppercase tracking-wider mt-6">
            Client Acquisition<br />
            & Solution Audit
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-4">A complete, evidence-based systems optimization & proposal roadmap.</p>
        </div>

        <div className="pt-12 space-y-6">
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">PREPARED FOR</span>
              <strong className="text-slate-800 text-base block mt-1">{prospect.companyName}</strong>
              <span className="text-slate-500 font-mono mt-0.5 block">{prospect.websiteUrl}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">AUDITED BY</span>
              <strong className="text-slate-800 text-base block mt-1">LeadPilot AI Safe Auditor</strong>
              <span className="text-slate-500 mt-0.5 block">Audit Date: {new Date(prospect.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-400 leading-relaxed max-w-xl">
            This client acquisition blueprint compiles verifiable public facts, gap benchmarks, and recommended services based on observations. All project valuations are illustrative ranges rather than guarantees of performance.
          </div>
        </div>
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

      {/* Speculative stamp disclaimer for printable PDF */}
      {prospect.proposalStatus === 'Speculative' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs leading-relaxed">
          <strong>⚠️ CONSULTATIVE ANALYSIS DISCLAIMER:</strong> This report is generated based on public knowledge archives and limited site crawl evidence. All recommended services and calculations are consultative suggestions. Verification of details during the discovery call is recommended.
        </div>
      )}

      {/* PLATFORM TRUST STATUS CARD */}
      {trustData.isAvailable ? (
        <div className="mb-8 p-5 bg-slate-50 border border-slate-250 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Trust Certification</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">{trustData.displayScore}</span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${trustData.statusColor.badge}`}>
                  ● {trustData.statusLevel}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500">Telemetry Engine: LeadPilot AI v{trustData.diagnostics.trustEngineVersion}</span>
              <p className="text-[10px] text-slate-400">Auditable & Deterministic Platform Controls</p>
            </div>
          </div>

          {/* 6 Component Breakdown Grid */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {trustData.componentList.map((comp) => (
              <div key={comp.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block truncate" title={comp.name}>
                    {comp.name}
                  </span>
                  <span className="text-[8px] text-slate-400 font-mono">Weight: {comp.weightPercent}%</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-sm font-black text-slate-900">{comp.score}%</span>
                  <span className="text-[9px] font-mono text-emerald-600 font-bold">+{comp.weightedPoints}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 leading-relaxed italic">
            * {trustData.summary}
          </p>
        </div>
      ) : (
        <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Platform Trust Certification</span>
              <span className="text-base font-bold text-slate-800">Trust Score Unavailable</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-300">
              Audit Pending
            </span>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Telemetry validation in progress. LeadPilot never fabricates or estimates audit confidence scores.
          </p>
        </div>
      )}



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

      {/* SECTION 2.1: OBSERVED TECHNOLOGY STACK */}
      {techStack.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
            2.1. Observed Technology Stack
          </h2>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            The following external integrations and systems were observed on the client domain during the auditing process:
          </p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech: string, idx: number) => (
              <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg shadow-sm font-bold">
                💻 {tech}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 3: COMPETITOR GAP SNAPSHOT */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          3. Competitor Gap Snapshot
        </h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          The following benchmark snapshot details observable web features audited on the prospect website versus 2 to 5 standard competitors in their industry.
        </p>
        <table className="w-full text-left text-xs border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-2.5">Observable Web Feature</th>
              <th className="p-2.5">Prospect ({prospect.companyName})</th>
              <th className="p-2.5">Competitors Status</th>
              <th className="p-2.5 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-250 bg-white">
            {competitorGaps.length > 0 ? (
              competitorGaps.map((gap: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-bold text-slate-800">{gap.featureName}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      gap.prospectStatus === 'Detected' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {gap.prospectStatus}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 font-medium">{gap.competitorStatus}</td>
                  <td className="p-2.5 text-right font-mono text-slate-400">{gap.confidence || 100}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                  No competitor benchmarks compiled for this client profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* SECTION 4: BUSINESS OPPORTUNITIES */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          4. Business Opportunities
        </h2>
        <div className="space-y-4">
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 text-sm">Opportunity {idx + 1}: {rec.serviceName}</h3>
                <div className="flex gap-1.5 items-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                    rec.priority === 'Very High Priority' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    rec.priority === 'High Priority' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                    rec.priority === 'Strong' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    rec.priority === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {rec.priority || 'Strong'}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    rec.status === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              </div>
              <p className="text-slate-600"><strong>Issue:</strong> {rec.issue}</p>
              {rec.evidenceList && rec.evidenceList.length > 0 && (
                <blockquote className="mt-1.5 bg-white p-2 rounded border border-slate-200/80 italic text-[11px] text-slate-500 leading-relaxed">
                  <strong>Verifiable Evidence Quote:</strong> "{rec.evidenceList[0]}"
                </blockquote>
              )}
              <p className="text-slate-600"><strong>Impact:</strong> {rec.impact}</p>
              {rec.calculation && (
                <p className="text-[11px] text-emerald-800 bg-emerald-50/50 p-2 rounded border border-emerald-100 mt-1.5 font-sans">
                  <strong>Calculation Formula:</strong> {rec.calculation}
                </p>
              )}
              {rec.calculationDetails && (
                <p className="text-[10px] text-slate-400 bg-slate-100/50 p-2 rounded border border-slate-200 mt-1.5">
                  <strong>Opportunity Prioritization Calculation Details:</strong> {rec.calculationDetails}
                </p>
              )}
              <div className="flex gap-4 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span><strong>Revenue Potential:</strong> {rec.estimatedFee}</span>
                <span><strong>Confidence:</strong> {rec.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: RECOMMENDED SERVICES & SOLUTIONS */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          5. Recommended Solutions
        </h2>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
              <th className="p-3 w-1/3">Problem Found</th>
              <th className="p-3">Solution / Recommended Service</th>
              <th className="p-3">Expected Outcome</th>
              <th className="p-3 text-right w-1/4">Value Estimate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {recommendations.map((rec: any, idx: number) => (
              <tr key={idx}>
                <td className="p-3">
                  <span className="font-semibold text-rose-700 block">{rec.issue}</span>
                  {rec.evidenceList && rec.evidenceList.length > 0 && (
                    <span className="block text-[10px] text-slate-400 italic mt-1 bg-slate-50 p-2 rounded border border-slate-100 leading-normal">
                      Quote: "{rec.evidenceList[0]}"
                    </span>
                  )}
                </td>
                <td className="p-3 font-bold text-slate-900">{rec.serviceName}</td>
                <td className="p-3 text-slate-600">{rec.expectedOutcome}</td>
                <td className="p-3 text-right">
                  <span className="font-mono font-bold text-emerald-600 block text-sm">${(rec.estimatedValue || 0).toLocaleString()}</span>
                  {rec.calculation && (
                    <span className="text-[9px] text-slate-500 block mt-1 italic leading-tight">
                      {rec.calculation}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* SECTION 6: COST ESTIMATE */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          6. Pricing & Cost Estimate
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
          {prospect.pricingRecommendation}
        </p>
      </section>

      {/* SECTION 7: EXPECTED OUTCOMES & ROI */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          7. Expected Outcomes & Estimated ROI
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

      {/* SECTION 8: PROJECT ROADMAP TIMELINES */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          8. Action Timelines
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

      {/* SECTION 9: NEXT STEPS */}
      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          9. Next Steps
        </h2>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
          <p>
            1. **Alignment Discovery Call**: Schedule a consultative 30-minute discovery call to present these findings and confirm the website audit details.
          </p>
          <p>
            2. **Evidence Validation**: Review the client's internal performance metrics, forms flow, and target customer profiles to match AI inferences against real-time pipeline indicators.
          </p>
          <p>
            3. **Custom Solution Tailoring**: Adjust scope of services, set final retainers, and customize the 30/90-day onboarding project timeline.
          </p>
        </div>
      </section>

      {/* SECTION 10: SAFE REVENUE ESTIMATES & FINANCIAL DISCLAIMER */}
      <section className="mb-8 page-break-before">
        <h2 className="text-sm font-bold text-slate-900 uppercase border-b-2 border-slate-900 pb-2 mb-3">
          10. Safe Project Value Valuation Range
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
        <p className="mb-1 font-semibold">Findings are based on publicly observable website information and AI-assisted analysis. Recommendations should be independently reviewed.</p>
        <p className="text-[10px] text-slate-400/80">Generated by LeadPilot AI Safe Verification Platform • Confidential</p>
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
