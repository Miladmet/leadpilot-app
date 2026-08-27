'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Search, 
  History, 
  Mail, 
  Linkedin, 
  Award, 
  User as UserIcon, 
  LogOut, 
  Trash2, 
  Copy, 
  Check, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  Sparkles,
  CreditCard
} from 'lucide-react';

interface Prospect {
  id: string;
  companyName: string;
  websiteUrl: string;
  summary: string;
  painPoints: string; // JSON string of array
  opportunityScore: number;
  buyingSignalScore: number;
  coldEmail: string;
  linkedInMessage: string;
  salesAngle: string;
  cta: string;
  createdAt: string;
}

interface Activity {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

interface Stats {
  prospectsCount: number;
  outreachCount: number;
  avgOppScore: number;
  avgBuyScore: number;
}

interface User {
  id: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  analysesLimit: number;
  analysesUsed: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({ prospectsCount: 0, outreachCount: 0, avgOppScore: 0, avgBuyScore: 0 });
  
  const [url, setUrl] = useState('');
  const [activeProspect, setActiveProspect] = useState<Prospect | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'email' | 'linkedin' | 'angle' | 'details'>('email');
  const [billingLoading, setBillingLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);

      // Fetch dashboard metrics and prospects list
      await Promise.all([fetchStats(), fetchProspects()]);
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProspects = async () => {
    try {
      const res = await fetch('/api/prospects');
      if (res.ok) {
        const data = await res.json();
        setProspects(data.prospects);
        if (data.prospects.length > 0 && !activeProspect) {
          setActiveProspect(data.prospects[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching prospects:', err);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setAnalyzing(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed. Please check the URL.');
      }

      const newProspect = data.prospect;
      setActiveProspect(newProspect);
      setProspects(prev => [newProspect, ...prev]);
      setUrl('');
      
      // Refresh statistics and user limits
      await Promise.all([fetchStats(), fetchUserData()]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteProspect = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prospect?')) return;

    try {
      const res = await fetch(`/api/prospects?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setProspects(prev => prev.filter(p => p.id !== id));
        if (activeProspect?.id === id) {
          setActiveProspect(prospects.find(p => p.id !== id) || null);
        }
        await fetchStats();
      }
    } catch (err) {
      console.error('Error deleting prospect:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const triggerStripeCheckout = async (tier: 'PRO' | 'AGENCY') => {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/subscribe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate checkout.');
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBillingLoading(false);
    }
  };

  const triggerStripePortal = async () => {
    setBillingLoading(true);
    try {
      const res = await fetch('/api/subscribe/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open billing portal.');
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBillingLoading(false);
    }
  };

  const copyToClipboard = (text: string, elementId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(elementId);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  // Decode JSON array safely
  const parsePainPoints = (jsonStr: string): string[] => {
    try {
      return JSON.parse(jsonStr) || [];
    } catch {
      return [];
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <span className="text-sm font-medium text-slate-500">Loading LeadPilot dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
            <span>Tier:</span>
            <span className="text-sky-600 font-bold uppercase">{user.subscriptionTier}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Usage Meter */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-xs text-slate-500 font-medium">
              Analyses: {user.analysesUsed} / {user.subscriptionTier === 'AGENCY' ? '∞' : user.analysesLimit}
            </span>
            <div className="w-36 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-sky-600 h-1.5 rounded-full" 
                style={{ width: `${user.subscriptionTier === 'AGENCY' ? 100 : Math.min((user.analysesUsed / user.analysesLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4 flex items-center gap-3">
            <span className="text-sm text-slate-700 font-semibold flex items-center gap-1">
              <UserIcon className="h-4 w-4 text-slate-400" />
              {user.email}
            </span>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main SaaS panel */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Analysis & Core Work */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Dashboard Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg border border-sky-100">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Analyzed</p>
                <p className="text-xl font-bold text-slate-900">{stats.prospectsCount}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg border border-purple-100">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Outreach Ready</p>
                <p className="text-xl font-bold text-slate-900">{stats.outreachCount}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Avg Opp Score</p>
                <p className="text-xl font-bold text-slate-900">{stats.avgOppScore}/100</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg border border-indigo-100">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Avg Buying Sign</p>
                <p className="text-xl font-bold text-slate-900">{stats.avgBuyScore}/100</p>
              </div>
            </div>
          </div>

          {/* Web Analysis Search Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-sky-500" />
              Analyze New Company Website
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide any company homepage domain. The WebMCP crawling engine will research the homepage, about pages, contact endpoints, and services to compile sales angles.
            </p>

            <form onSubmit={handleAnalyze} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  placeholder="e.g. stripe.com or https://stripe.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-3 pr-10 py-3 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm shadow-sm"
                  disabled={analyzing}
                />
              </div>
              <button
                type="submit"
                disabled={analyzing}
                className="bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Research Lead
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Analysis Active Card: ChatGPT style tabs */}
          {activeProspect ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              {/* Card Header info */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {activeProspect.companyName}
                    <a 
                      href={activeProspect.websiteUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-slate-400 hover:text-slate-600 transition-colors inline-block"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeProspect.websiteUrl}</p>
                </div>

                <div className="flex gap-2">
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center min-w-[70px] ${getScoreColor(activeProspect.opportunityScore)}`}>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Opp Score</span>
                    <span className="text-sm mt-0.5">{activeProspect.opportunityScore}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center min-w-[70px] ${getScoreColor(activeProspect.buyingSignalScore)}`}>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Buying Sig</span>
                    <span className="text-sm mt-0.5">{activeProspect.buyingSignalScore}</span>
                  </div>
                </div>
              </div>

              {/* Tabs buttons */}
              <div className="flex border-b border-slate-200 bg-white">
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'email'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Cold Email
                </button>
                <button
                  onClick={() => setActiveTab('linkedin')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'linkedin'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Pitch
                </button>
                <button
                  onClick={() => setActiveTab('angle')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'angle'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Sales Angle & CTA
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'details'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Award className="h-4 w-4" />
                  Company Summary
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 flex flex-col bg-white">
                
                {/* Email Tab */}
                {activeTab === 'email' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500 font-semibold">Generated Cold Email Pitch</span>
                        <button
                          onClick={() => copyToClipboard(activeProspect.coldEmail, 'email')}
                          className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded"
                        >
                          {copiedText === 'email' ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Email
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed min-h-[220px]">
                        {activeProspect.coldEmail}
                      </pre>
                    </div>
                  </div>
                )}

                {/* LinkedIn Tab */}
                {activeTab === 'linkedin' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-500 font-semibold">LinkedIn connection message (under 300 characters)</span>
                        <button
                          onClick={() => copyToClipboard(activeProspect.linkedInMessage, 'linkedin')}
                          className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded"
                        >
                          {copiedText === 'linkedin' ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Message
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed min-h-[120px]">
                        {activeProspect.linkedInMessage}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Sales Angle Tab */}
                {activeTab === 'angle' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Suggested Sales Angle</h4>
                      <p className="mt-1.5 p-3.5 bg-sky-50 text-slate-800 rounded-xl border border-sky-100 text-sm font-medium">
                        {activeProspect.salesAngle}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Recommended CTA</h4>
                      <p className="mt-1.5 p-3.5 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 text-sm font-mono">
                        {activeProspect.cta}
                      </p>
                    </div>
                  </div>
                )}

                {/* Summary / Pain points Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Research Summary</h4>
                      <p className="mt-1.5 text-slate-700 text-sm leading-relaxed">
                        {activeProspect.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Identified Pain Points</h4>
                      <ul className="mt-2 space-y-2">
                        {parsePainPoints(activeProspect.painPoints).map((point, index) => (
                          <li key={index} className="flex gap-2.5 items-start text-sm text-slate-700">
                            <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm flex-1 flex flex-col justify-center items-center">
              <Search className="h-12 w-12 text-slate-300 stroke-1 mb-4" />
              <p className="font-bold text-slate-800 text-sm">No analysis active</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Analyze a company homepage URL using the input above or select a past lead from the history panel to view sales outreach templates.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: History, Billing, Actions */}
        <div className="space-y-6">
          
          {/* Billing Plan Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-slate-500" />
              Billing & Subscriptions
            </h3>

            {user.subscriptionTier === 'FREE' ? (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-500">
                  You are currently on the <span className="font-bold">Free Plan</span> (10 monthly searches). Upgrade for larger quota and extension access.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={billingLoading}
                    onClick={() => triggerStripeCheckout('PRO')}
                    className="flex-1 text-center bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    Upgrade Pro ($29)
                  </button>
                  <button
                    disabled={billingLoading}
                    onClick={() => triggerStripeCheckout('AGENCY')}
                    className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    Upgrade Agency ($79)
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Active Plan:</span>
                  <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold uppercase">{user.subscriptionTier}</span>
                </div>
                <button
                  disabled={billingLoading}
                  onClick={triggerStripePortal}
                  className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs py-2 rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1"
                >
                  {billingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Manage Subscription
                </button>
              </div>
            )}
          </div>

          {/* Prospects History list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <History className="h-4.5 w-4.5 text-slate-400" />
              Prospects History
            </h3>

            <div className="mt-2 divide-y divide-slate-100 overflow-y-auto flex-1 pr-1 space-y-1">
              {prospects.length > 0 ? (
                prospects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActiveProspect(p)}
                    className={`p-2.5 rounded-lg flex justify-between items-center cursor-pointer transition-colors group ${
                      activeProspect?.id === p.id 
                        ? 'bg-sky-50 border border-sky-100' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.companyName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.websiteUrl}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        p.opportunityScore >= 70 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.opportunityScore}
                      </span>
                      <button
                        onClick={(e) => handleDeleteProspect(p.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No prospects analyzed yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent activities audit trail */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[300px]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <BarChart3 className="h-4.5 w-4.5 text-slate-400" />
              Recent Activity Feed
            </h3>

            <div className="mt-3 overflow-y-auto flex-1 pr-1 space-y-3">
              {activities.length > 0 ? (
                activities.map((a) => (
                  <div key={a.id} className="flex gap-2.5 text-xs">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">{a.action.replace('_', ' ')}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{a.details}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No logs recorded.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
