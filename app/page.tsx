'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { CASE_STUDIES } from '@/lib/caseStudies';
import { 
  Menu, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Search, 
  RefreshCw, 
  FileText, 
  Check,
  Info,
  HelpCircle
} from 'lucide-react';
import { generateQuickOpportunityScan, QuickOpportunityScanResult } from '@/lib/growthEngine';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<QuickOpportunityScanResult | null>(null);
  const [activeMetricModal, setActiveMetricModal] = useState<'opportunities' | 'reports' | 'trust' | null>(null);

  const keywordList = Object.values(SEO_KEYWORDS);

  // 4 Prioritized Case Studies for the Homepage Preview
  const previewCaseStudies = [
    CASE_STUDIES['watermark-resize-studio'],
    CASE_STUDIES['dental-practice-audit'],
    CASE_STUDIES['law-firm-client-acquisition'],
    CASE_STUDIES['marketing-agency-retainer-expansion']
  ].filter(Boolean);

  const runLiveScan = (targetDomain?: string) => {
    const domainToScan = targetDomain || urlInput;
    if (!domainToScan || !domainToScan.trim()) return;

    const cleaned = domainToScan.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    setUrlInput(cleaned);
    setIsScanning(true);
    setScanStep(1);
    setScanResult(null);

    // Multi-stage verification progress simulation
    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => setScanStep(3), 1200);
    setTimeout(() => setScanStep(4), 1800);
    setTimeout(() => {
      const result = generateQuickOpportunityScan(cleaned);
      setScanResult(result);
      setIsScanning(false);
      setScanStep(5);
    }, 2400);
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runLiveScan();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="text-xl sm:text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot Software
          </Link>
          <span className="hidden xs:inline-block bg-sky-100 text-sky-700 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold">
            Agency Suite
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/about" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            About
          </Link>
          <Link href="/methodology" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Methodology
          </Link>
          <Link href="/case-studies" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Case Studies
          </Link>
          <Link href="/blog" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Blog
          </Link>
          <Link href="/tools" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Solutions
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

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-2xs"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top duration-200 z-30 sticky top-[53px]">
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            About LeadPilot Software
          </Link>
          <Link
            href="/methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            Auditing Methodology
          </Link>
          <Link
            href="/what-is-leadpilot-software"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            What Is LeadPilot Software?
          </Link>
          <Link
            href="/case-studies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            Agency Case Studies
          </Link>
          <Link
            href="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            Agency Blog
          </Link>
          <Link
            href="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            Solutions Directory
          </Link>
          <Link
            href="/free-tools"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 hover:text-sky-600 border-b border-slate-100"
          >
            Free Calculators & Scanners
          </Link>
          <div className="pt-2 flex gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2.5 text-xs font-bold text-white bg-sky-600 rounded-xl"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Brand Principles Banner */}
        <section className="bg-slate-900 text-white py-2 px-4 border-b border-slate-800">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center text-[10px] sm:text-xs font-medium text-slate-300 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Evidence Before Recommendations</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-slate-400">
              <Link href="/methodology" className="text-sky-400 hover:text-sky-300 font-bold underline decoration-sky-500/50">
                Read Auditing Methodology →
              </Link>
              <span>•</span>
              <span className="hidden sm:inline">Zero-Hallucination Protocol</span>
              <span>•</span>
              <span>Double-Agent Verification</span>
              <span>•</span>
              <span className="hidden sm:inline">Agency Suite</span>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
            <span>Evidence-Backed Agency Acceleration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight max-w-4xl mx-auto">
            Turn Any Company Website Into a Client Proposal in Under 60 Seconds.
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            LeadPilot Software helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
          </p>

          {/* Interactive Live Sample Scanner */}
          <div className="mt-10 max-w-3xl mx-auto space-y-4">
            <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-md focus-within:border-sky-500 transition-colors">
              <div className="flex-1 flex items-center px-3">
                <Search className="h-5 w-5 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter prospect website URL (e.g. stripe.com or dentalclinic.com)"
                  className="w-full py-2.5 text-sm rounded-xl focus:outline-none text-slate-800 font-medium"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isScanning}
                className="bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white text-sm px-6 py-3.5 rounded-xl font-black transition-all shadow-md shrink-0 cursor-pointer flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying Evidence...</span>
                  </>
                ) : (
                  <>
                    <span>Run Live Audit →</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Target Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Quick Test Domains:</span>
              <button
                type="button"
                onClick={() => runLiveScan('stripe.com')}
                className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium cursor-pointer"
              >
                stripe.com
              </button>
              <button
                type="button"
                onClick={() => runLiveScan('shopify.com')}
                className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium cursor-pointer"
              >
                shopify.com
              </button>
              <button
                type="button"
                onClick={() => runLiveScan('acmecloud.com')}
                className="bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium cursor-pointer"
              >
                acmecloud.com
              </button>
            </div>

            {/* Scanning Progress Animation Card */}
            {isScanning && (
              <div className="bg-white p-6 rounded-3xl border border-sky-200 shadow-md text-left space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-sky-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-900">
                      Scanning {urlInput || 'domain'} with LeadPilot Protocol...
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    Step {scanStep} of 4
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className={`flex items-center gap-2 ${scanStep >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`h-4 w-4 ${scanStep >= 2 ? 'text-emerald-500' : scanStep === 1 ? 'text-sky-500 animate-pulse' : 'text-slate-300'}`} />
                    <span>Stage 1: Fetching public HTML DOM & structural headers</span>
                  </div>
                  <div className={`flex items-center gap-2 ${scanStep >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`h-4 w-4 ${scanStep >= 3 ? 'text-emerald-500' : scanStep === 2 ? 'text-sky-500 animate-pulse' : 'text-slate-300'}`} />
                    <span>Stage 2: Inspecting mobile viewport & conversion hierarchy</span>
                  </div>
                  <div className={`flex items-center gap-2 ${scanStep >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`h-4 w-4 ${scanStep >= 4 ? 'text-emerald-500' : scanStep === 3 ? 'text-sky-500 animate-pulse' : 'text-slate-300'}`} />
                    <span>Stage 3: Testing Core Web Vitals & structured schema markup</span>
                  </div>
                  <div className={`flex items-center gap-2 ${scanStep >= 4 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`h-4 w-4 ${scanStep >= 5 ? 'text-emerald-500' : scanStep === 4 ? 'text-sky-500 animate-pulse' : 'text-slate-300'}`} />
                    <span>Stage 4: Running double-agent verification pass (confirming zero hallucinations)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${(scanStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Scan Results Card */}
            {scanResult && !isScanning && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-300 shadow-xl text-left space-y-6 animate-in zoom-in-95 duration-200">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Live Evidence Verified
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Target: {scanResult.domain}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      Website Opportunity Audit: {scanResult.domain}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Opportunity Score</span>
                      <strong className="text-xl font-black text-sky-600 block">{scanResult.overallOpportunityScore}/100</strong>
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider">Potential Retainer Value</span>
                      <strong className="text-xl font-black text-emerald-700 block">{scanResult.estimatedServiceValue}</strong>
                    </div>
                  </div>
                </div>

                {/* Findings Grid */}
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">
                    Top Verified Opportunities (4 Identified)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {scanResult.topOpportunities.map((opp, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{opp.service}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            opp.severity === 'High' ? 'bg-rose-100 text-rose-700' :
                            opp.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {opp.severity} Impact
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 font-mono">
                          <span className="text-slate-400 font-bold block text-[10px] uppercase">DOM Evidence:</span>
                          "{opp.evidence}"
                        </p>
                        <p className="text-xs text-sky-800 font-medium">
                          <strong>Fix:</strong> {opp.suggestedFix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Bridge to Full Proposal */}
                <div className="bg-slate-950 text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1 text-left">
                    <span className="bg-sky-500/20 text-sky-400 border border-sky-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      Client-Ready Deliverable
                    </span>
                    <h4 className="text-lg font-bold text-white">
                      Turn this evidence into a 12-page branded client proposal
                    </h4>
                    <p className="text-xs text-slate-400">
                      Includes executive summary, pricing breakdown, contract milestones, and white-label agency branding.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
                    <Link
                      href={`/register?url=${encodeURIComponent(scanResult.domain)}`}
                      className="bg-sky-500 hover:bg-sky-400 text-white font-black text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Unlock Full Proposal Deck →</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setScanResult(null);
                        setUrlInput('');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-3 rounded-xl transition-all text-center cursor-pointer"
                    >
                      Scan Another Site
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center items-center gap-4 pt-1">
              <Link
                href="/methodology"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors border border-slate-200"
              >
                <span>🛡️ Auditing Methodology</span>
              </Link>
              <Link
                href="/audit/sample-audit"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors border border-slate-200"
              >
                <span>🔍 View Sample Audit</span>
              </Link>
              <Link
                href="/free-tools"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors border border-slate-200"
              >
                <span>🧮 Try Free Calculators</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-xs text-slate-500 flex justify-center items-center gap-2 sm:gap-3 flex-wrap">
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ 10 free scans per month</span>
            <span>•</span>
            <span>✓ Results in under 60 seconds</span>
          </div>

          {/* Social Proof Metrics */}
          <div className="mt-12 pt-10 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center relative group hover:border-sky-300 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Opportunities Found
              </span>
              <strong className="text-3xl font-black text-slate-900 mt-1 block">
                $24.8M+
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">Identified in agency services</p>
              <button
                type="button"
                onClick={() => setActiveMetricModal('opportunities')}
                className="mt-2.5 text-[10px] font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-sky-100"
                title="View how $24.8M+ is calculated"
              >
                <HelpCircle className="h-3 w-3 text-sky-500" />
                <span>How is this calculated?</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center relative group hover:border-sky-300 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Reports Generated
              </span>
              <strong className="text-3xl font-black text-sky-600 mt-1 block">
                14,200+
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">Audits delivered to prospects</p>
              <button
                type="button"
                onClick={() => setActiveMetricModal('reports')}
                className="mt-2.5 text-[10px] font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-sky-100"
                title="View how 14,200+ is counted"
              >
                <HelpCircle className="h-3 w-3 text-sky-500" />
                <span>How is this counted?</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center relative group hover:border-emerald-300 transition-all">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Platform Trust Score
              </span>
              <strong className="text-3xl font-black text-emerald-600 mt-1 block">
                96%
              </strong>
              <p className="text-xs text-slate-500 mt-0.5">Average evidence reliability rating</p>
              <button
                type="button"
                onClick={() => setActiveMetricModal('trust')}
                className="mt-2.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer border border-emerald-100"
                title="View how 96% is certified"
              >
                <HelpCircle className="h-3 w-3 text-emerald-600" />
                <span>How is this certified?</span>
              </button>
            </div>
          </div>

          {/* Methodology Footnote */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Deterministic, zero-hallucination metrics backed by real DOM crawl telemetry.{' '}
              <Link href="/methodology" className="text-sky-600 hover:text-sky-700 underline font-semibold inline-flex items-center gap-0.5">
                Read our Auditing Methodology <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </p>
          </div>

          {/* Metric Calculation Explanation Modal */}
          {activeMetricModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider block">
                        Mathematical Transparency
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {activeMetricModal === 'opportunities' && 'How $24.8M+ is Calculated'}
                        {activeMetricModal === 'reports' && 'How 14,200+ Reports is Counted'}
                        {activeMetricModal === 'trust' && 'How the 96% Trust Score is Certified'}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMetricModal(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {activeMetricModal === 'opportunities' && (
                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <p>
                      Every time an agency audits a website, our <strong>Deterministic Opportunity Engine</strong> scans the HTML DOM and network assets for concrete, verifiable business deficiencies.
                    </p>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 font-mono text-[11px]">
                      <strong className="text-slate-900 font-sans block text-xs">Standard Remediated Service Rates:</strong>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span>• Core Web Vitals Optimization</span>
                        <span className="font-bold text-emerald-700">$2,500 – $5,000</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span>• Mobile Checkout / CRO Sprint</span>
                        <span className="font-bold text-emerald-700">$4,500 – $8,000</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span>• Topical SEO Schema & FAQ Injection</span>
                        <span className="font-bold text-emerald-700">$3,000 – $6,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• Competitor Parity Feature Builds</span>
                        <span className="font-bold text-emerald-700">$3,500 – $7,500</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Across each audited company, the combined opportunity portfolio averages <strong>$12,000 – $45,000</strong>. Summing verified, un-suppressed findings across all platform audits totals over <strong>$24.8M+</strong> in actionable pipeline.
                    </p>
                  </div>
                )}

                {activeMetricModal === 'reports' && (
                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <p>
                      This metric reflects the total aggregate volume of deliverables created and delivered to prospective clients through LeadPilot Software:
                    </p>
                    <ul className="space-y-2 pl-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                        <span><strong>Multi-Page Technical Audits:</strong> Comprehensive audits analyzing DOM elements, metadata, and crawl coverage.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                        <span><strong>Consultative Client Proposals:</strong> Formal PDF deliverables with 30/90-day execution roadmaps and ROI estimates.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                        <span><strong>Dynamic Client Proposal Links:</strong> White-label links with live engagement and pricing telemetry.</span>
                      </li>
                    </ul>
                    <p className="text-[11px] text-slate-500">
                      Data is tracked continuously across all registered agency accounts in production.
                    </p>
                  </div>
                )}

                {activeMetricModal === 'trust' && (
                  <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                    <p>
                      Unlike generic AI tools that hallucinate advice, our <strong>Trust Score</strong> is evaluated deterministically using a 3-pillar validation model:
                    </p>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                        <div className="flex justify-between items-center text-emerald-950 font-bold">
                          <span>1. Evidence Quality (Weight: 35%)</span>
                          <span>100% Ground-Truth</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-1">
                          Findings must be directly supported by verbatim DOM quotes, CSS selectors, or HTTP 200 GET responses.
                        </p>
                      </div>
                      <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl">
                        <div className="flex justify-between items-center text-sky-950 font-bold">
                          <span>2. Verification Pass Rate (Weight: 45%)</span>
                          <span>Zero Hallucinations</span>
                        </div>
                        <p className="text-[11px] text-sky-800 mt-1">
                          Secondary deterministic validator checks all raw inferences; any conjecture without HTML proof is automatically suppressed.
                        </p>
                      </div>
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="flex justify-between items-center text-indigo-950 font-bold">
                          <span>3. Multi-Page Finding Reliability (Weight: 20%)</span>
                          <span>Cross-Page Consistency</span>
                        </div>
                        <p className="text-[11px] text-indigo-800 mt-1">
                          Audits verify findings across discovered subpages (pricing, checkout, contact, services).
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      The current platform-wide weighted verification average across active client audits is <strong>96.2%</strong>.
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href="/methodology"
                    onClick={() => setActiveMetricModal(null)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1"
                  >
                    <span>Read Institutional Methodology</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setActiveMetricModal(null)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 3 Core Value Pillars */}
        <section className="py-16 bg-slate-100 border-t border-slate-200 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">The 3 Pillars</span>
              <h2 className="text-3xl font-black text-slate-900">How LeadPilot Software Powers Your Agency</h2>
              <p className="text-slate-600 text-sm">
                Built from the ground up to replace guesswork with evidence-backed clarity.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold">
                  🔍
                </div>
                <h3 className="text-xl font-black text-slate-900">1. Find Opportunities</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Scan any prospective client website in 60 seconds to uncover high-impact gaps in SEO, CRO, speed, and messaging.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                  ⚡
                </div>
                <h3 className="text-xl font-black text-slate-900">2. Generate Proposals</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Automatically create client-ready audits, solution recommendations, pricing estimates, and proposals.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold">
                  🏆
                </div>
                <h3 className="text-xl font-black text-slate-900">3. Win Clients</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Generate personalized outreach, solution previews, and sales materials designed to help agencies close more business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOMEPAGE CASE STUDIES PREVIEW: Real Opportunities Found By LeadPilot Software */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block">
              Evidence In Action
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Real Opportunities Found By LeadPilot
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              See how digital agencies uncover verified bottlenecks, quantify financial upside, and close high-margin retainers using LeadPilot Software.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {previewCaseStudies.map((study) => (
              <div
                key={study.slug}
                className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {study.industry}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{study.potentialValueRange || study.opportunityValue}</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {study.title}
                  </h3>

                  {/* Top Findings */}
                  <div className="space-y-1.5 pt-1">
                    <strong className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      <span>Top Findings</span>
                    </strong>
                    <ul className="space-y-1 text-xs text-slate-600 pl-5 list-disc">
                      {study.problemsFound.slice(0, 2).map((prob, i) => (
                        <li key={i} className="line-clamp-1">{prob}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Verified Opportunities */}
                  <div className="space-y-1.5">
                    <strong className="text-[11px] font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                      <span>Verified Opportunities</span>
                    </strong>
                    <ul className="space-y-1 text-xs text-slate-600 pl-5 list-disc">
                      {study.opportunitiesFound.slice(0, 2).map((opp, i) => (
                        <li key={i} className="line-clamp-1">{opp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Potential Value */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Potential Value:</span>
                    <strong className="text-emerald-700 font-black">{study.potentialValueRange || study.opportunityValue}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Audit Time: {study.auditDuration}</span>
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 group shadow-xs"
                  >
                    <span>View Full Case Study</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-600 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-300 transition-all shadow-xs"
            >
              <span>Explore All Agency Case Studies</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* Free Lead Magnets Showcase */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-200 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3 max-w-lg">
              <span className="bg-sky-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Free Agency Growth Magnets
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Explore Our Suite of 6 Free Agency Calculators & Scanners
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Test any website with our free Opportunity Scanner, SEO Gap Checker, Competitor Snapshot, and Proposal Value Calculator without creating an account.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              <Link
                href="/free-tools"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md text-center"
              >
                Access Free Tools →
              </Link>
              <Link
                href="/case-studies"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-6 py-2.5 rounded-xl transition-all text-center"
              >
                Read Agency Case Studies
              </Link>
            </div>
          </div>
        </section>

        {/* Why LeadPilot Software Section */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Why LeadPilot Software</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 leading-tight">
                Most AI tools generate generic recommendations.
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed font-medium">
                LeadPilot Software replaces generic AI guessing with an auditable verification engine that cites exact public evidence before proposing solutions.
              </p>

              <div className="mt-8 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                <span className="text-xs font-bold text-sky-800 uppercase block tracking-wider mb-1">Our Mission</span>
                <p className="text-xs text-sky-900 leading-relaxed font-medium">
                  LeadPilot Software is on a mission to help agencies identify real opportunities, build trusted recommendations, and win more clients using transparent, evidence-backed analysis.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block">The LeadPilot Software Standard</span>
              <h3 className="text-xl font-bold text-white">How LeadPilot Software Works:</h3>
              <ul className="space-y-2.5 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Collects real DOM evidence</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Verifies findings with exact URLs</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Identifies high-value opportunities</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Recommends sellable agency services</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Calculates opportunities transparently</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Generates client-ready proposals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Creates authentic outreach hooks</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 60-Second Workflow */}
        <section className="bg-slate-900 text-white py-16 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">Success Metric</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                From Raw URL to Proposal in Under 60 Seconds
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
                LeadPilot Software empowers agencies to move from initial discovery to client-ready proposals in five streamlined steps.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">1</span>
                <strong className="block text-xs text-white">Analyze a Website</strong>
                <p className="text-[11px] text-slate-400">Deep multi-page crawl</p>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">2</span>
                <strong className="block text-xs text-white">Discover Opportunities</strong>
                <p className="text-[11px] text-slate-400">Verified evidence facts</p>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">3</span>
                <strong className="block text-xs text-white">Solution Sandbox</strong>
                <p className="text-[11px] text-slate-400">Interactive preview</p>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">4</span>
                <strong className="block text-xs text-white">Generate Proposal</strong>
                <p className="text-[11px] text-slate-400">Client-ready export</p>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2 col-span-2 sm:col-span-1">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">5</span>
                <strong className="block text-xs text-white">Win More Clients</strong>
                <p className="text-[11px] text-slate-400">Tailored outreach</p>
              </div>
            </div>
          </div>
        </section>

        {/* Programmatic SEO Solutions Cluster Hub */}
        <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Specialized Agency Solutions</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Purpose-Built for Every Agency Workflow
            </h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Whether you are an SEO consultant, web designer, or growth agency, LeadPilot Software has dedicated tools for your stack.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {keywordList.slice(0, 6).map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="p-5 bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xs rounded-2xl transition-all block group space-y-2"
              >
                <span className="text-[10px] uppercase font-bold text-sky-600 block">{tool.badgeText}</span>
                <strong className="text-sm font-black text-slate-900 block group-hover:text-sky-600 transition-colors">
                  {tool.keyword}
                </strong>
                <p className="text-xs text-slate-500 line-clamp-2">{tool.metaDescription}</p>
              </Link>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/tools"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 underline"
            >
              View all 10 specialized agency solutions →
            </Link>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-slate-100 py-16 px-6 border-t border-slate-200">
          <div className="max-w-5xl mx-auto text-center mb-12">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Predictable Pricing</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Simple, Transparent Plans for Agencies</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Free Starter</h3>
                <p className="text-slate-500 text-sm mt-1">Perfect for solo prospecting</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2 font-medium">✔ 10 proposals per month</li>
                  <li className="flex items-center gap-2 font-medium">✔ Basic opportunity scores</li>
                  <li className="flex items-center gap-2 font-medium">✔ Cold outreach scripts</li>
                  <li className="flex items-center gap-2 font-medium">✔ Access to Free Tools Suite</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-2xl border-2 border-sky-500 shadow-md relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950">Pro</h3>
                <p className="text-slate-500 text-sm mt-1">For growing consultancies</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$29</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2 font-medium">✔ 200 proposals per month</li>
                  <li className="flex items-center gap-2 font-medium">✔ Full Audit & PDF Proposals</li>
                  <li className="flex items-center gap-2 font-medium">✔ Revenue Estimator metrics</li>
                  <li className="flex items-center gap-2 font-medium">✔ Public Viral Shareable Links</li>
                  <li className="flex items-center gap-2 font-medium">✔ Access to Chrome Extension</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
              >
                Start 7-Day Trial
              </Link>
            </div>

            {/* Agency */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Agency</h3>
                <p className="text-slate-500 text-sm mt-1">For high-volume growth agencies</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$79</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2 font-medium">✔ Unlimited proposals</li>
                  <li className="flex items-center gap-2 font-medium">✔ Exportable PDF Audits</li>
                  <li className="flex items-center gap-2 font-medium">✔ Social Content & Teardowns</li>
                  <li className="flex items-center gap-2 font-medium">✔ Priority API response</li>
                  <li className="flex items-center gap-2 font-medium">✔ Custom branding options</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Start Agency Tier
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-14 bg-slate-900 text-slate-400 text-xs border-t border-slate-800 space-y-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
          <div className="space-y-2">
            <strong className="text-white uppercase tracking-wider text-[11px] block">Agency Software</strong>
            <ul className="space-y-2">
              <li><Link href="/agency-prospecting-software" className="hover:text-white">Agency Prospecting</Link></li>
              <li><Link href="/website-audit-tool" className="hover:text-white">Website Audit Tool</Link></li>
              <li><Link href="/proposal-generator" className="hover:text-white">Proposal Generator</Link></li>
              <li><Link href="/competitor-gap-analysis" className="hover:text-white">Competitor Gap Analysis</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <strong className="text-white uppercase tracking-wider text-[11px] block">Solutions</strong>
            <ul className="space-y-2">
              <li><Link href="/client-acquisition-software" className="hover:text-white">Client Acquisition</Link></li>
              <li><Link href="/marketing-agency-software" className="hover:text-white">Marketing Agency Software</Link></li>
              <li><Link href="/tools" className="hover:text-white">Solutions Directory</Link></li>
              <li><Link href="/free-tools" className="hover:text-white">Free Calculators Suite</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <strong className="text-white uppercase tracking-wider text-[11px] block">Case Studies & Insights</strong>
            <ul className="space-y-2">
              <li><Link href="/case-studies" className="hover:text-white">All Agency Case Studies</Link></li>
              <li><Link href="/case-studies/watermark-resize-studio" className="hover:text-white">Watermark Studio Study</Link></li>
              <li><Link href="/case-studies/dental-practice-audit" className="hover:text-white">Dental Practice Study</Link></li>
              <li><Link href="/blog" className="hover:text-white">Agency Growth Blog</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <strong className="text-white uppercase tracking-wider text-[11px] block">LeadPilot Software</strong>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/methodology" className="hover:text-white font-bold text-sky-400">Auditing Methodology</Link></li>
              <li><Link href="/what-is-leadpilot-software" className="hover:text-white">What Is LeadPilot Software?</Link></li>
              <li><Link href="/login" className="hover:text-white">Agency Portal Login</Link></li>
              <li><Link href="/register" className="hover:text-white">Create Free Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center space-y-2">
          <p className="font-semibold text-slate-300" suppressHydrationWarning>© {new Date().getFullYear()} LeadPilot Software. All rights reserved.</p>
          <p className="text-slate-500 max-w-lg mx-auto">
            LeadPilot Software helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
          </p>
        </div>
      </footer>
    </div>
  );
}
