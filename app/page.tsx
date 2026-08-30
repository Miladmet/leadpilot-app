import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </span>
          <span className="bg-sky-100 text-sky-700 text-xs px-2.5 py-0.5 rounded-full font-bold">Agency Suite</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white text-sm px-4 py-2 rounded-lg font-bold transition-colors shadow-sm"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Brand Principles Banner */}
        <div className="bg-slate-900 text-slate-300 py-2.5 px-4 text-center text-xs font-semibold overflow-x-auto whitespace-nowrap">
          <div className="max-w-6xl mx-auto flex justify-center items-center gap-4 sm:gap-6">
            <span>● Trust before AI</span>
            <span className="text-slate-600">•</span>
            <span>● Evidence before recommendations</span>
            <span className="text-slate-600">•</span>
            <span>● Opportunities before outreach</span>
            <span className="text-slate-600">•</span>
            <span>● Solutions before proposals</span>
            <span className="text-slate-600">•</span>
            <span>● Transparency before automation</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-block bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
            Evidence-Backed Agency Acceleration
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            Find Opportunities. Generate Proposals. <br className="hidden md:inline" />
            <span className="text-sky-600">Win Clients.</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed">
            LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-lg transition-all"
            >
              Start Building Proposals Free
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-slate-500 flex justify-center items-center gap-2">
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ 10 free scans per month</span>
            <span>•</span>
            <span>✓ Results in under 60 seconds</span>
          </div>
        </section>

        {/* Value Pillars */}
        <section className="bg-slate-100 py-16 px-6 border-y border-slate-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Core Capabilities</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Everything Agencies Need to Close Deals</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Pillar 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-2xl font-bold">
                  🔍
                </div>
                <h3 className="text-xl font-black text-slate-900">1. Find Opportunities</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Identify high-value business opportunities through multi-page website analysis, competitor gap detection, and evidence verification.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                  📄
                </div>
                <h3 className="text-xl font-black text-slate-900">2. Generate Proposals</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Automatically create client-ready audits, solution recommendations, pricing estimates, and proposals.
                </p>
              </div>

              {/* Pillar 3 */}
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

        {/* Why LeadPilot Section */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Why LeadPilot</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 leading-tight">
                Most AI tools generate generic recommendations.
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed font-medium">
                LeadPilot replaces generic AI guessing with an auditable double-agent verification engine that cites exact public evidence before proposing solutions.
              </p>

              <div className="mt-8 p-4 bg-sky-50 border border-sky-200 rounded-xl">
                <span className="text-xs font-bold text-sky-800 uppercase block tracking-wider mb-1">Our Mission</span>
                <p className="text-xs text-sky-900 leading-relaxed font-medium">
                  LeadPilot's mission is to help agencies identify real opportunities, build trusted recommendations, and win more clients using transparent, evidence-backed analysis.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400 block">The LeadPilot Standard</span>
              <h3 className="text-xl font-bold text-white">How LeadPilot Works:</h3>
              <ul className="space-y-2.5 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Collects evidence</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Verifies findings</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Identifies opportunities</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Recommends services</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Calculates opportunities transparently</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Generates proposals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">✅</span>
                  <span>Creates outreach</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 60-Second Success Metric Workflow */}
        <section className="bg-slate-900 text-white py-16 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block">Success Metric</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2">
                From Raw URL to Proposal in Under 60 Seconds
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
                LeadPilot empowers agencies to move from initial discovery to client-ready proposals in five streamlined steps.
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
                <strong className="block text-xs text-white">Review Services</strong>
                <p className="text-[11px] text-slate-400">Targeted pitches</p>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">4</span>
                <strong className="block text-xs text-white">Generate Proposal</strong>
                <p className="text-[11px] text-slate-400">Exportable PDF audit</p>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl space-y-2 col-span-2 sm:col-span-1">
                <span className="w-6 h-6 rounded-full bg-sky-500 text-white text-xs font-black flex items-center justify-center mx-auto">5</span>
                <strong className="block text-xs text-white">Create Outreach</strong>
                <p className="text-[11px] text-slate-400">Multi-touch sequences</p>
              </div>
            </div>
          </div>
        </section>

        {/* Chrome Extension Showcase */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white p-8 md:p-12 rounded-3xl border border-sky-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-3">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Chrome Extension
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white">
                From website to winning proposal in under 60 seconds.
              </h3>
              <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                Analyze prospects while browsing client sites. Instant opportunity detection, verified quotes, and 1-click proposal exports right inside your browser.
              </p>
            </div>
            <Link
              href="/register"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm px-6 py-3.5 rounded-xl shadow transition-all shrink-0 cursor-pointer"
            >
              Get Extension Access
            </Link>
          </div>
        </section>

        {/* Pricing Plan */}
        <section className="py-16 px-6 max-w-5xl mx-auto border-t border-slate-200">
          <h2 className="text-3xl md:text-4xl font-black text-center text-slate-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-center mt-2 max-w-md mx-auto text-sm">
            Choose the package that matches your agency volume. Change plans at any time.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-8 items-stretch">
            {/* Free */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Free</h3>
                <p className="text-slate-500 text-sm mt-1">For freelancers starting out</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2">✔ 10 proposals per month</li>
                  <li className="flex items-center gap-2">✔ AI Opportunity Scans</li>
                  <li className="flex items-center gap-2">✔ Outreach + Scripts generation</li>
                  <li className="flex items-center gap-2">✔ Solution Sandbox access</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-2xl border-2 border-sky-600 shadow-md flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sky-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Popular
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-950">Pro</h3>
                <p className="text-slate-500 text-sm mt-1">For active agencies & consultants</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$29</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2 font-medium">✔ 200 proposals per month</li>
                  <li className="flex items-center gap-2 font-medium">✔ Full Audit & PDF Proposals</li>
                  <li className="flex items-center gap-2 font-medium">✔ Revenue Estimator metrics</li>
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
      <footer className="py-10 bg-slate-900 text-slate-400 text-center text-xs border-t border-slate-800 space-y-2">
        <p className="font-semibold text-slate-300">© {new Date().getFullYear()} LeadPilot AI. All rights reserved.</p>
        <p className="text-slate-500 max-w-lg mx-auto">
          LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
        </p>
      </footer>
    </div>
  );
}
