import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { calculateTrustScore } from '@/lib/trustEngine';
import { generateSolutionSandbox } from '@/lib/sandboxEngine';

interface SandboxPrintPageProps {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function SandboxPrintPage({ params }: SandboxPrintPageProps) {
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
            Storage Security Gate: Authentication is strictly required to view or export solution previews.
          </p>
        </div>
      </div>
    );
  }

  // 2. Retrieve prospect report and verify strict ownership
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

  // Parse prospect arrays
  let recommendations = [];
  try { recommendations = JSON.parse(prospect.recommendations) || []; } catch (e) {}

  let competitorGaps = [];
  try { competitorGaps = JSON.parse(prospect.competitorGaps || "[]") || []; } catch (e) {}

  let verifiedFacts = [];
  try { verifiedFacts = JSON.parse(prospect.verifiedFacts) || []; } catch (e) {}

  // Trust Score
  const trustData = calculateTrustScore({
    verificationPassRate: prospect.verificationPassRate,
    evidenceQuality: prospect.evidenceQuality,
    crawlCoveragePercent: prospect.crawlCoveragePercent,
    findingReliability: prospect.findingReliability,
    rlsCoveragePercent: 100,
    storageSecurityScore: 100,
    tenantIsolationPassRate: 100,
  });

  // Generate Solution Sandbox Model
  const sandbox = generateSolutionSandbox(
    recommendations,
    {
      companyName: prospect.companyName,
      websiteUrl: prospect.websiteUrl,
      evidenceQuality: prospect.evidenceQuality,
      findingReliability: prospect.findingReliability,
      opportunityRange: prospect.opportunityRange,
      competitorGaps,
      verifiedFacts
    },
    trustData
  );

  const generatedDate = new Date();
  const formattedDateTime = generatedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-white text-slate-800 p-8 max-w-4xl mx-auto print:p-0 relative">
      {/* Running print footer */}
      <div className="hidden print:block print-footer-timestamp">
        Solution Preview • {formattedDateTime}
      </div>

      {/* Top action bar - hidden on print */}
      <div className="mb-6 flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 print:hidden">
        <div>
          <h2 className="text-sm font-bold text-slate-900">LeadPilot Solution Sandbox Preview</h2>
          <p className="text-xs text-slate-500">Preview a potential implementation based on verified opportunities.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] text-slate-500 font-mono hidden sm:block">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Generated</span>
            {formattedDateTime}
          </div>
          <button
            id="print-btn"
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            🖨️ Export Solution Preview PDF
          </button>
        </div>
      </div>

      {/* PDF Safety Fallback Banner */}
      <div id="print-error-banner" className="hidden mb-6 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex justify-between items-center print:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>PDF rendering encountered a temporary interruption. All report data is safely preserved.</span>
        </div>
        <button
          id="retry-print-btn"
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
        >
          Retry PDF Generation
        </button>
      </div>


      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .page-break-before { page-break-before: always; }
          .page-break-after { page-break-after: always; }
          .print-footer-timestamp {
            position: fixed;
            bottom: 6mm;
            right: 8mm;
            font-size: 8pt;
            color: #64748b;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
        }
      `}} />

      {/* COVER PAGE */}
      <div className="min-h-[1000px] flex flex-col justify-between border-b-8 border-slate-900 pb-12 mb-12 page-break-after">
        <div className="pt-20">
          <span className="text-xs font-bold tracking-widest text-sky-600 uppercase">LEADPILOT AI • SOLUTION SANDBOX</span>
          <div className="h-2 w-16 bg-sky-600 mt-4 mb-12"></div>
          
          <h1 className="text-5xl font-black text-slate-900 leading-tight uppercase tracking-wider mt-6">
            Solution Sandbox<br />
            & Implementation Blueprint
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-4">
            Preview a potential implementation based on verified opportunities.
          </p>

          {/* Positioning Badges */}
          <div className="flex flex-wrap gap-2 mt-6">
            {sandbox.positioning.badges.map((b, i) => (
              <span key={i} className="bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                ● {b}
              </span>
            ))}
          </div>
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
              <strong className="text-slate-800 text-base block mt-1">LeadPilot Solution Sandbox Engine</strong>
              <span className="text-slate-500 mt-0.5 block">Audit Date & Time: {formattedDateTime}</span>
            </div>
          </div>

          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>Sandbox Planning Notice:</strong> {sandbox.disclaimer}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Solution Sandbox</span>
          <h2 className="text-3xl font-black text-slate-900 uppercase">{prospect.companyName}</h2>
          <span className="text-xs text-slate-400 font-mono">{prospect.websiteUrl}</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-900">LeadPilot AI Sandbox Suite</p>
          <p className="text-xs text-slate-500 font-mono">Date & Time: {formattedDateTime}</p>
        </div>
      </header>

      {/* TRUST & SAFETY BANNER */}
      {sandbox.isAvailable && sandbox.trustIntegration && (
        <div className="mb-8 p-4 bg-slate-900 text-white rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[9px] uppercase text-slate-400 font-bold block">Platform Trust</span>
            <strong className="text-lg font-black text-emerald-400">{sandbox.trustIntegration.trustScore}</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-400 font-bold block">Evidence Quality</span>
            <strong className="text-lg font-black text-sky-400">{sandbox.trustIntegration.evidenceQuality}%</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-400 font-bold block">Verification Status</span>
            <strong className="text-lg font-black text-indigo-300">{sandbox.trustIntegration.verificationStatus}</strong>
          </div>
          <div>
            <span className="text-[9px] uppercase text-slate-400 font-bold block">Sandbox Confidence</span>
            <strong className="text-lg font-black text-amber-300">{sandbox.trustIntegration.sandboxConfidence}%</strong>
          </div>
        </div>
      )}

      {/* CONTENT SECTIONS */}
      {sandbox.isAvailable && sandbox.sandboxes ? (
        <div className="space-y-10">
          
          {/* 1. WEBSITE REDESIGN SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 page-break-before">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 1</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.websiteRedesign.title}</h3>
              </div>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.websiteRedesign.badge}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Current State</span>
                <p className="text-slate-700">{sandbox.sandboxes.websiteRedesign.currentState}</p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Observed Issues</span>
                <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                  {sandbox.sandboxes.websiteRedesign.observedIssues.map((iss, i) => (
                    <li key={i}>{iss}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mock Structure Preview */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mock Homepage Structure</span>
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-bold px-2 py-0.5 rounded">
                  {sandbox.sandboxes.websiteRedesign.mockHomepageStructure.heroSection.badge}
                </span>
                <h4 className="text-base font-black text-white">{sandbox.sandboxes.websiteRedesign.mockHomepageStructure.heroSection.headline}</h4>
                <p className="text-xs text-slate-300">{sandbox.sandboxes.websiteRedesign.mockHomepageStructure.heroSection.subheadline}</p>
                <div className="pt-2 flex flex-wrap gap-2 items-center">
                  <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg shadow">
                    {sandbox.sandboxes.websiteRedesign.mockHomepageStructure.suggestedCTAs.suggestedCTA}
                  </span>
                  <span className="text-[10px] text-slate-400 italic">
                    ({sandbox.sandboxes.websiteRedesign.mockHomepageStructure.suggestedCTAs.microcopy})
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Used Panel */}
            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used & Rationale</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.websiteRedesign.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.websiteRedesign.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.websiteRedesign.evidence.confidence}%)</p>
            </div>
          </section>

          {/* 2. SEO CONTENT SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 2</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.seoContent.title}</h3>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.seoContent.badge}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sample Content Architecture & Category Hubs</span>
              <p className="text-slate-600"><strong>Resource Hub Anchor:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sky-700 font-mono">{sandbox.sandboxes.seoContent.sampleContentArchitecture.resourceHub}</code></p>
              <div className="grid sm:grid-cols-3 gap-2 pt-2">
                {sandbox.sandboxes.seoContent.sampleContentArchitecture.categories.map((cat, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="block text-slate-800 text-xs">{cat.name}</strong>
                    <span className="text-[10px] text-sky-600 font-mono block mt-0.5">{cat.slug}</span>
                    <span className="text-[9px] text-slate-400 uppercase block mt-1">{cat.intent}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.seoContent.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.seoContent.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.seoContent.evidence.confidence}%)</p>
            </div>
          </section>

          {/* 3. LEAD GENERATION SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 page-break-before">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 3</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.leadGeneration.title}</h3>
              </div>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.leadGeneration.badge}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">High-Value Lead Magnet</span>
                <h4 className="font-bold text-slate-800 text-sm">{sandbox.sandboxes.leadGeneration.landingPageExample.leadMagnetConcept}</h4>
                <p className="text-slate-500 text-[11px]">Designed to capture enterprise leads seeking benchmark transparency.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">5-Step Discovery Framework</span>
                <ol className="list-decimal list-inside text-slate-700 space-y-1 text-[11px]">
                  {sandbox.sandboxes.leadGeneration.discoveryCallFlow.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.leadGeneration.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.leadGeneration.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.leadGeneration.evidence.confidence}%)</p>
            </div>
          </section>

          {/* 4. AI AUTOMATION SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 4</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.aiAutomation.title}</h3>
              </div>
              <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.aiAutomation.badge}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold text-rose-500 uppercase block">Current Manual Workflow</span>
                <p className="text-slate-700 font-mono text-[11px]">{sandbox.sandboxes.aiAutomation.currentProcess}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[9px] font-bold text-emerald-600 uppercase block">Suggested Automated Workflow</span>
                <p className="text-slate-700 font-mono text-[11px]">{sandbox.sandboxes.aiAutomation.suggestedProcess}</p>
              </div>
            </div>

            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.aiAutomation.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.aiAutomation.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.aiAutomation.evidence.confidence}%)</p>
            </div>
          </section>

          {/* 5. CONVERSION OPTIMIZATION SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 page-break-before">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 5</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.conversionOptimization.title}</h3>
              </div>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.conversionOptimization.badge}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Proposed A/B Experiments</span>
              <div className="space-y-2">
                {sandbox.sandboxes.conversionOptimization.proposedExperiments.map((exp, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <strong className="text-slate-900 block">{exp.experiment}</strong>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Hypothesis: {exp.hypothesis}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.conversionOptimization.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.conversionOptimization.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.conversionOptimization.evidence.confidence}%)</p>
            </div>
          </section>

          {/* 6. LICENSING & PRICING SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 6</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.pricingLicensing.title}</h3>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.pricingLicensing.badge}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-3 text-xs">
              {sandbox.sandboxes.pricingLicensing.suggestedStructure.map((tier, i) => (
                <div key={i} className={`p-4 rounded-xl border space-y-2 ${tier.featured ? 'bg-emerald-50/50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200'}`}>
                  <strong className="text-slate-900 block text-sm">{tier.tier}</strong>
                  <span className="text-[10px] text-slate-500 block">{tier.target}</span>
                  <div className="pt-2 border-t border-slate-150">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Illustrative Range</span>
                    <strong className="text-sm font-black text-emerald-700 font-mono">{tier.illustrativeRange}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.pricingLicensing.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.pricingLicensing.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.pricingLicensing.evidence.confidence}%)</p>
            </div>
          </section>

          {/* 7. COMPETITOR GAP SANDBOX */}
          <section className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 page-break-before">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Sandbox Type 7</span>
                <h3 className="text-lg font-black text-slate-900">{sandbox.sandboxes.competitorGap.title}</h3>
              </div>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sandbox.sandboxes.competitorGap.badge}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5">Observed Competitor Capability</th>
                    <th className="p-2.5">Current Prospect Status</th>
                    <th className="p-2.5">Potential Future Capability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sandbox.sandboxes.competitorGap.comparisons.map((cmp, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-bold text-slate-800">{cmp.capability}</td>
                      <td className="p-2.5 text-slate-600">{cmp.prospectStatus}</td>
                      <td className="p-2.5 text-sky-700 font-medium">{cmp.potentialFutureCapability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Evidence Used</span>
              <p className="text-slate-700"><strong>Finding:</strong> "{sandbox.sandboxes.competitorGap.evidence.evidenceUsed}"</p>
              <p className="text-slate-500 text-[11px]"><strong>Why Generated:</strong> {sandbox.sandboxes.competitorGap.evidence.whyGenerated} (Confidence: {sandbox.sandboxes.competitorGap.evidence.confidence}%)</p>
            </div>
          </section>

          {/* FINANCIAL SAFETY DISCLAIMER */}
          <div className="p-5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs space-y-2">
            <h4 className="font-bold text-amber-950 uppercase tracking-wider text-[11px]">Financial Safety Notice & Disclaimer</h4>
            <p className="text-amber-900 leading-relaxed italic text-[11px]">
              {sandbox.disclaimer}
            </p>
            <p className="text-amber-800 text-[10px] pt-1 border-t border-amber-200/60">
              {sandbox.financialSafety?.nonGuaranteeNotice}
            </p>
          </div>

        </div>
      ) : (
        <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
          <h3 className="text-base font-bold text-slate-800">Solution Sandbox Unavailable</h3>
          <p className="text-xs text-slate-500">{sandbox.reason}</p>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-12 text-xs text-slate-400 border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <p className="mb-1 font-semibold">Findings are based on publicly observable website information and AI-assisted analysis.</p>
          <p className="text-[10px] text-slate-400/80">Generated by LeadPilot AI Safe Verification Platform • Confidential Solution Sandbox Preview</p>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Report Date & Time</span>
          <span className="font-mono text-xs font-bold text-slate-700">{formattedDateTime}</span>
        </div>
      </footer>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            function triggerPrint() {
              try {
                window.print();
              } catch (err) {
                console.error('PDF Generation interrupted:', err);
                const banner = document.getElementById('print-error-banner');
                if (banner) banner.classList.remove('hidden');
              }
            }
            const btn = document.getElementById('print-btn');
            if (btn) btn.addEventListener('click', triggerPrint);
            const retryBtn = document.getElementById('retry-print-btn');
            if (retryBtn) retryBtn.addEventListener('click', triggerPrint);
          `,
        }}
      />

    </div>
  );
}
