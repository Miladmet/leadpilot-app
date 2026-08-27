import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </span>
          <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded font-semibold">MVP</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-slate-600 hover:text-slate-900 font-medium">
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 px-6 max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight tracking-tight">
            Turn Any Company Website Into A <br className="hidden md:inline" />
            <span className="text-sky-600">Personalized Sales Email</span> In 60 Seconds
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            Stop wasting hours researching leads. Analyze websites, get deep business insights, opportunity scores, and tailored sales outreach instantly.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 py-4 rounded-xl font-semibold shadow-lg transition-all"
            >
              Start Generating for Free
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-slate-500 flex justify-center items-center gap-2">
            <span>✓ No credit card required</span>
            <span>•</span>
            <span>✓ 10 free analyses per month</span>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-100 py-16 px-6 border-y border-slate-200">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-slate-950">WebMCP Scraper</h3>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                Our agent climbs home, about, and service pages to extract rich details about what the prospect sells.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-slate-950">Lead & Buying Score</h3>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                Instantly see if a prospect is active or scaling. Focus exclusively on leads with the highest buying intent.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-3xl mb-3">✍</div>
              <h3 className="text-lg font-bold text-slate-950">Outreach in Seconds</h3>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                Generate high-conversion cold emails and short, professional LinkedIn templates with custom pain-point hooks.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Plan */}
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-600 text-center mt-2 max-w-md mx-auto">
            Choose the package that matches your outreach volume. Change plans at any time.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-8 items-stretch">
            {/* Free */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Free</h3>
                <p className="text-slate-500 text-sm mt-1">For freelancers starting out</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$0</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2">✔ 10 analyses per month</li>
                  <li className="flex items-center gap-2">✔ Full WebMCP research</li>
                  <li className="flex items-center gap-2">✔ Email + LinkedIn generation</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 rounded-lg transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white p-8 rounded-xl border-2 border-sky-600 shadow-md flex flex-col justify-between relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sky-600 text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Popular
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-950">Pro</h3>
                <p className="text-slate-500 text-sm mt-1">For active sales pros & recruiters</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$29</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2 font-medium">✔ 200 analyses per month</li>
                  <li className="flex items-center gap-2">✔ Full WebMCP research</li>
                  <li className="flex items-center gap-2">✔ Email + LinkedIn generation</li>
                  <li className="flex items-center gap-2">✔ Access to Chrome Extension</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Start 7-Day Trial
              </Link>
            </div>

            {/* Agency */}
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">Agency</h3>
                <p className="text-slate-500 text-sm mt-1">For B2B growth agencies</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-black">$79</span>
                  <span className="text-slate-500 text-sm ml-2">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2 font-medium">✔ Unlimited analyses</li>
                  <li className="flex items-center gap-2 font-medium">✔ Multi-user seats</li>
                  <li className="flex items-center gap-2">✔ Priority API response</li>
                  <li className="flex items-center gap-2">✔ Full CRM integrations coming soon</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Start Agency Tier
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-center text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} LeadPilot AI. All rights reserved.</p>
        <p className="mt-1 text-slate-500">Built to help sales professionals book more meetings.</p>
      </footer>
    </div>
  );
}
