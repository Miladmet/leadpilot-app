'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sparkles, 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { 
  calculateProposalValue, 
  calculateAgencyPricing,
  generateQuickOpportunityScan,
  generateQuickSeoGapCheck,
  generateQuickCompetitorGapSnapshot
} from '@/lib/growthEngine';
import LeadMagnetModal from '@/components/LeadMagnetModal';

type ToolTab = 'scanner' | 'seo' | 'competitor' | 'proposal' | 'pricing' | 'trust';

export default function FreeToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolTab>('scanner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultOffer, setModalDefaultOffer] = useState<'report' | 'template' | 'audit'>('report');

  // Scanner states
  const [scanDomain, setScanDomain] = useState('example.com');
  const [scanResult, setScanResult] = useState(generateQuickOpportunityScan('example.com'));

  // SEO Checker states
  const [seoDomain, setSeoDomain] = useState('example.com');
  const [seoResult, setSeoResult] = useState(generateQuickSeoGapCheck('example.com'));

  // Competitor Snapshot states
  const [compDomain, setCompDomain] = useState('example.com');
  const [compResult, setCompResult] = useState(generateQuickCompetitorGapSnapshot('example.com'));

  // Proposal Calculator states
  const [oppCount, setOppCount] = useState(4);
  const [avgDeal, setAvgDeal] = useState(5000);
  const [monthlyRetainer, setMonthlyRetainer] = useState(2500);

  // Agency Pricing states
  const [hoursEst, setHoursEst] = useState(25);
  const [hourlyRate, setHourlyRate] = useState(125);
  const [targetMargin, setTargetMargin] = useState(60);

  // Trust Analyzer states
  const [evidenceQuality, setEvidenceQuality] = useState(92);
  const [crawlCoverage, setCrawlCoverage] = useState(88);
  const [verificationRate, setVerificationRate] = useState(94);

  const proposalVal = calculateProposalValue(oppCount, avgDeal, monthlyRetainer);
  const agencyPricing = calculateAgencyPricing('Standard', targetMargin, hoursEst, hourlyRate);
  
  // Calculate trust score estimate
  const computedTrustScore = Math.round((evidenceQuality * 0.35) + (crawlCoverage * 0.35) + (verificationRate * 0.30));
  const trustLevel = computedTrustScore >= 95 ? 'Trusted' : computedTrustScore >= 85 ? 'Verified' : computedTrustScore >= 70 ? 'Review Required' : 'Low Confidence';
  const trustBadgeColor = computedTrustScore >= 95 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : computedTrustScore >= 85 ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-amber-100 text-amber-800 border-amber-300';

  const triggerModal = (offer: 'report' | 'template' | 'audit') => {
    setModalDefaultOffer(offer);
    setIsModalOpen(true);
  };

  const handleRunScan = (e: React.FormEvent) => {
    e.preventDefault();
    setScanResult(generateQuickOpportunityScan(scanDomain));
  };

  const handleRunSeo = (e: React.FormEvent) => {
    e.preventDefault();
    setSeoResult(generateQuickSeoGapCheck(seoDomain));
  };

  const handleRunComp = (e: React.FormEvent) => {
    e.preventDefault();
    setCompResult(generateQuickCompetitorGapSnapshot(compDomain));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <LeadMagnetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultOffer={modalDefaultOffer}
      />

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
            Free Tools Suite
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            Solutions
          </Link>
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm hidden sm:inline">
            Case Studies
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
      <main className="flex-1 py-10 px-6 max-w-6xl mx-auto space-y-8 w-full">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            Agency Lead Magnets & Calculators
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            Free Website & Opportunity Intelligence Tools
          </h1>
          <p className="text-sm text-slate-600 font-medium">
            Test any target website or calculate your agency revenue upside with our suite of free interactive tools.
          </p>
        </div>

        {/* 6 Free Tools Tab Bar */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs scrollbar-none">
          <button
            onClick={() => setActiveTool('scanner')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'scanner' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>1. Opportunity Scanner</span>
          </button>
          <button
            onClick={() => setActiveTool('seo')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'seo' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>2. SEO Gap Checker</span>
          </button>
          <button
            onClick={() => setActiveTool('competitor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'competitor' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>3. Competitor Snapshot</span>
          </button>
          <button
            onClick={() => setActiveTool('proposal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'proposal' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>4. Proposal Calculator</span>
          </button>
          <button
            onClick={() => setActiveTool('pricing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'pricing' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>5. Pricing Calculator</span>
          </button>
          <button
            onClick={() => setActiveTool('trust')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTool === 'trust' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>6. Trust Score Analyzer</span>
          </button>
        </div>

        {/* 1. Website Opportunity Scanner */}
        {activeTool === 'scanner' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Website Opportunity Scanner</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quickly detect high-ticket conversion, speed, and content opportunities.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                Free Instant Preview
              </span>
            </div>

            <form onSubmit={handleRunScan} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={scanDomain}
                onChange={(e) => setScanDomain(e.target.value)}
                placeholder="Enter client website URL (e.g. acme.com)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                required
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Scan Domain Now →
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Target Domain: <strong className="text-slate-900">{scanResult.domain}</strong>
                </span>
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Estimated Opportunity Value: {scanResult.estimatedServiceValue}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {scanResult.topOpportunities.map((opp, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-xs font-bold text-slate-900">{opp.service}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        opp.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {opp.severity} Severity
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      <strong>Observed:</strong> {opp.evidence}
                    </p>
                    <p className="text-[11px] text-sky-700 font-medium pt-1 border-t border-slate-100">
                      <strong>Suggested Service:</strong> {opp.suggestedFix}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-slate-700">
                  <strong>Want the full 15-page client-ready audit with quotes and source URLs?</strong>
                  <p className="text-[11px] text-slate-500">Includes 30-day roadmap, competitor gap comparison, and proposal PDF export.</p>
                </div>
                <button
                  onClick={() => triggerModal('report')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  Unlock Full Report Free →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. SEO Gap Checker */}
        {activeTool === 'seo' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">SEO Gap Checker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Identify technical search visibility issues and missing schema elements.</p>
              </div>
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-3 py-1 rounded-full">
                Technical Audit
              </span>
            </div>

            <form onSubmit={handleRunSeo} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={seoDomain}
                onChange={(e) => setSeoDomain(e.target.value)}
                placeholder="Enter client website URL (e.g. acme.com)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                required
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Check SEO Gaps →
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Critical SEO Bottlenecks</span>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {seoResult.criticalGaps.map((gap, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">High-ROI Quick Wins</span>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {seoResult.quickWins.map((win, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span>{win}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    Estimated Upside: <strong className="text-emerald-600 font-bold">{seoResult.potentialTrafficIncrease}</strong>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => triggerModal('template')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Download Free SEO Proposal Template (PDF & Figma) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Competitor Gap Snapshot */}
        {activeTool === 'competitor' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Competitor Gap Snapshot</h3>
                <p className="text-xs text-slate-500 mt-0.5">Benchmark any website against top performers in its category.</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full">
                Competitive Intel
              </span>
            </div>

            <form onSubmit={handleRunComp} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={compDomain}
                onChange={(e) => setCompDomain(e.target.value)}
                placeholder="Enter client website URL (e.g. acme.com)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                required
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
              >
                Benchmark Against Rivals →
              </button>
            </form>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Category Gaps vs Market Leaders
                </span>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {compResult.gapsVsCategoryLeaders.map((item, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 text-xs">
                      <strong className="text-slate-900 block font-bold">{item.area}</strong>
                      <span className="text-[11px] text-slate-600 mt-0.5 block">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1">
                <strong>Recommended Sales Pitch Angle:</strong>
                <p className="text-amber-900 font-medium leading-relaxed">{compResult.pitchAngle}</p>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => triggerModal('audit')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Generate Complete Competitor Audit Deck Free →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Proposal Value Calculator */}
        {activeTool === 'proposal' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Proposal Value Calculator</h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculate contract values and annual retainer potential for prospective clients.</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
                ROI Modeling
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-1">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Identified Opportunities</span>
                    <span className="text-sky-600 font-black">{oppCount}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={oppCount}
                    onChange={(e) => setOppCount(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Avg Project Scope Fee</span>
                    <span className="text-sky-600 font-black">${avgDeal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="15000"
                    step="500"
                    value={avgDeal}
                    onChange={(e) => setAvgDeal(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Monthly Retainer Tier</span>
                    <span className="text-sky-600 font-black">${monthlyRetainer.toLocaleString()}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={monthlyRetainer}
                    onChange={(e) => setMonthlyRetainer(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Initial Project Fee</span>
                  <strong className="text-lg font-black text-slate-900 block">{proposalVal.formattedInitial}</strong>
                  <span className="text-[10px] text-slate-500">Based on {oppCount} scopes</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Annual Contract Value</span>
                  <strong className="text-lg font-black text-sky-600 block">{proposalVal.formattedAnnual}</strong>
                  <span className="text-[10px] text-slate-500">Initial + 12 mo retainer</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estimated Gross Margin</span>
                  <strong className="text-lg font-black text-emerald-600 block">{proposalVal.formattedMargin}</strong>
                  <span className="text-[10px] text-slate-500">~65% typical agency margin</span>
                </div>

                <div className="col-span-2 sm:col-span-3 p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs text-sky-900 font-medium">
                    LeadPilot automatically generates these pricing formulas directly inside your exportable proposal PDFs.
                  </p>
                  <Link
                    href="/register"
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
                  >
                    Build First Proposal →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Agency Pricing Calculator */}
        {activeTool === 'pricing' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Agency Pricing Calculator</h3>
                <p className="text-xs text-slate-500 mt-0.5">Determine profitable project and retainer pricing based on margin targets.</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1 rounded-full">
                Profit Modeling
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-1">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Estimated Project Hours</span>
                    <span className="text-sky-600 font-black">{hoursEst} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={hoursEst}
                    onChange={(e) => setHoursEst(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Internal Hourly Cost</span>
                    <span className="text-sky-600 font-black">${hourlyRate}/hr</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Target Gross Margin</span>
                    <span className="text-sky-600 font-black">{targetMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Recommended Project Fee</span>
                  <strong className="text-lg font-black text-slate-900 block">{agencyPricing.formattedProjectFee}</strong>
                  <span className="text-[10px] text-slate-500">Includes {targetMargin}% margin</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Monthly Retainer</span>
                  <strong className="text-lg font-black text-sky-600 block">{agencyPricing.formattedRetainer}</strong>
                  <span className="text-[10px] text-slate-500">Ongoing maintenance</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project Gross Profit</span>
                  <strong className="text-lg font-black text-emerald-600 block">{agencyPricing.formattedGrossProfit}</strong>
                  <span className="text-[10px] text-slate-500">Revenue minus cost</span>
                </div>

                <div className="col-span-2 sm:col-span-3 p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs text-slate-300">
                    LeadPilot locks in these profit targets across all customized proposal deliverables.
                  </p>
                  <button
                    onClick={() => triggerModal('template')}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    Get Proposal Template →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Trust Score Analyzer */}
        {activeTool === 'trust' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Platform Trust Score Analyzer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Explore how evidence density and verification affect client credibility.</p>
              </div>
              <span className={`border text-xs font-black px-3 py-1 rounded-full ${trustBadgeColor}`}>
                Status: {trustLevel} ({computedTrustScore}%)
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-1">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Evidence Quality</span>
                    <span className="text-sky-600 font-black">{evidenceQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={evidenceQuality}
                    onChange={(e) => setEvidenceQuality(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Crawl Coverage</span>
                    <span className="text-sky-600 font-black">{crawlCoverage}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={crawlCoverage}
                    onChange={(e) => setCrawlCoverage(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Verification Pass Rate</span>
                    <span className="text-sky-600 font-black">{verificationRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={verificationRate}
                    onChange={(e) => setVerificationRate(Number(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Trust Engine Reliability Reading</span>
                    <strong className="text-2xl font-black text-slate-900">{computedTrustScore}%</strong>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {computedTrustScore >= 85
                      ? 'Optimal reliability. Audit claims are directly backed by verified quotes and deep multi-page crawl coverage.'
                      : 'Review Required. Lower evidence density means claims must be manually cross-referenced before delivering to C-level prospects.'}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-xs text-emerald-950 font-medium">
                    Every LeadPilot scan includes an auditable Platform Trust card to prove you did genuine research.
                  </p>
                  <Link
                    href="/register"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0"
                  >
                    Scan Target Website →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} LeadPilot Software. Evidence-backed agency client acquisition.</p>
      </footer>
    </div>
  );
}
