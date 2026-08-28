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
  ExternalLink,
  Loader2,
  Sparkles,
  CreditCard,
  FileText,
  PhoneCall,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface SuggestedService {
  name: string;
  issue: string;
  estimatedFee: string;
  confidence: number;
}

interface Prospect {
  id: string;
  companyName: string;
  websiteUrl: string;
  problem: string;
  opportunity: string;
  proposedSolution: string;
  servicesSuggested: string; // JSON string
  potentialRevenue: number;
  closingProbability: number;
  problemSeverity: string;
  leadQuality: string;
  proposalStatus: string;
  executiveSummary: string;
  expectedResults: string;
  estimatedRoi: string;
  thirtyDayPlan: string;
  ninetyDayPlan: string;
  pricingRecommendation: string;
  coldEmail: string;
  linkedInMessage: string;
  discoveryScript: string;
  followUpSequence: string;
  meetingAgenda: string;
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
  const [activeTab, setActiveTab] = useState<'opportunities' | 'proposal' | 'outreach'>('opportunities');
  const [outreachSubTab, setOutreachSubTab] = useState<'email' | 'linkedin' | 'discovery' | 'followup' | 'agenda'>('email');
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
        throw new Error(data.error || 'Acquisition analysis failed. Verify domain.');
      }

      const newProspect = data.prospect;
      setActiveProspect(newProspect);
      setProspects(prev => [newProspect, ...prev]);
      setUrl('');
      await Promise.all([fetchStats(), fetchUserData()]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteProspect = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this client profile?')) return;

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
      if (data.url) window.location.href = data.url;
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
      if (!res.ok) throw new Error(data.error || 'Failed to open portal.');
      if (data.url) window.location.href = data.url;
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

  // Helper Calculations
  const totalRevenuePipeline = prospects.reduce((acc, p) => acc + p.potentialRevenue, 0);
  
  const avgClosingProbability = prospects.length > 0 
    ? Math.round(prospects.reduce((acc, p) => acc + p.closingProbability, 0) / prospects.length) 
    : 0;

  const proposalsReadyCount = prospects.filter(p => p.proposalStatus === 'Ready').length;

  const parseSuggestedServices = (jsonStr: string): SuggestedService[] => {
    try {
      return JSON.parse(jsonStr) || [];
    } catch {
      return [];
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return 'text-rose-700 bg-rose-50 border-rose-200';
    if (s === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-sky-700 bg-sky-50 border-sky-200';
  };

  const getQualityBadgeColor = (quality: string) => {
    const q = quality?.toLowerCase();
    if (q === 'hot') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (q === 'warm') return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <span className="text-sm font-medium text-slate-500">Loading LeadPilot Client Acquisition Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent">
            LeadPilot AI
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-600 border border-slate-200">
            <span>Platform:</span>
            <span className="text-sky-600 font-bold uppercase">{user.subscriptionTier}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-xs text-slate-500 font-medium">
              Analyses Quota: {user.analysesUsed} / {user.subscriptionTier === 'AGENCY' ? '∞' : user.analysesLimit}
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

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Metrics & Redesigned Workspaces */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Revenue & Pipeline Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg border border-emerald-100">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Revenue Pipeline</p>
                <p className="text-lg font-black text-emerald-600">${totalRevenuePipeline.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg border border-purple-100">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Proposals Ready</p>
                <p className="text-lg font-bold text-slate-900">{proposalsReadyCount}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-sky-50 text-sky-600 p-2.5 rounded-lg border border-sky-100">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Leads Scanned</p>
                <p className="text-lg font-bold text-slate-900">{stats.prospectsCount}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg border border-amber-100">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Close Rate</p>
                <p className="text-lg font-bold text-slate-900">{avgClosingProbability}%</p>
              </div>
            </div>
          </div>

          {/* Core Proposal Search Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-sky-500" />
              Build Client Proposal & Audit Report
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter any company homepage URL. The WebMCP crawling engine scans for design vulnerabilities, marketing deficiencies, missing chatbot widgets, and operations bottlenecks.
            </p>

            <form onSubmit={handleAnalyze} className="mt-4 flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. stripe.com or https://github.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 pl-3 pr-4 py-3 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm shadow-sm"
                disabled={analyzing}
              />
              <button
                type="submit"
                disabled={analyzing}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Proposal...
                  </>
                ) : (
                  <>
                    Generate Proposal
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

          {/* Interactive Workspace Panel */}
          {activeProspect ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              
              {/* Proposal Header Metadata */}
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

                {/* Revenue & Probability Badges */}
                <div className="flex gap-2 items-center flex-wrap">
                  <div className="px-3 py-1.5 rounded-lg border bg-emerald-50 border-emerald-200 text-xs font-bold flex flex-col items-center min-w-[85px]">
                    <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Est. Revenue</span>
                    <span className="text-sm mt-0.5 text-emerald-700 font-black">${activeProspect.potentialRevenue.toLocaleString()}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg border bg-amber-50 border-amber-200 text-xs font-bold flex flex-col items-center min-w-[70px]">
                    <span className="text-[9px] uppercase font-semibold text-slate-500 tracking-wider">Close Prob</span>
                    <span className="text-sm mt-0.5 text-amber-700 font-bold">{activeProspect.closingProbability}%</span>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${getSeverityBadgeColor(activeProspect.problemSeverity)}`}>
                    <span className="block text-[8px] uppercase text-slate-500 font-semibold">Severity</span>
                    <span>{activeProspect.problemSeverity}</span>
                  </div>
                  <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold ${getQualityBadgeColor(activeProspect.leadQuality)}`}>
                    <span className="block text-[8px] uppercase text-slate-500 font-semibold">Quality</span>
                    <span>{activeProspect.leadQuality}</span>
                  </div>
                </div>
              </div>

              {/* Main Workspace Tabs */}
              <div className="flex border-b border-slate-200 bg-white">
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'opportunities'
                      ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  Opportunities (Audit)
                </button>
                <button
                  onClick={() => setActiveTab('proposal')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'proposal'
                      ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Proposal Builder
                </button>
                <button
                  onClick={() => setActiveTab('outreach')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'outreach'
                      ? 'border-sky-600 text-sky-600 bg-sky-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Outreach Center
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 flex flex-col bg-white">
                
                {/* 1. Audit & Opportunities Tab */}
                {activeTab === 'opportunities' && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    {/* Problem / Opportunity detail blocks */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Identified Problems</h4>
                        <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed max-h-[140px] overflow-y-auto">
                          {activeProspect.problem}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Growth Opportunities</h4>
                        <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed max-h-[140px] overflow-y-auto">
                          {activeProspect.opportunity}
                        </p>
                      </div>
                    </div>

                    {/* Service Match Engine Results */}
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Service Match Recommendations</h4>
                      <div className="border border-slate-200 rounded-xl overflow-hidden flex-1 overflow-y-auto max-h-[220px]">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                              <th className="p-2.5">Recommended Service</th>
                              <th className="p-2.5">Target Defect</th>
                              <th className="p-2.5">Est. Retainer / Fee</th>
                              <th className="p-2.5 text-right">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parseSuggestedServices(activeProspect.servicesSuggested).map((service, index) => (
                              <tr key={index} className="hover:bg-slate-50/50">
                                <td className="p-2.5 font-bold text-slate-900">{service.name}</td>
                                <td className="p-2.5 text-slate-500 truncate max-w-[150px]">{service.issue}</td>
                                <td className="p-2.5 font-mono font-semibold text-sky-600">{service.estimatedFee}</td>
                                <td className="p-2.5 text-right">
                                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                                    service.confidence >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {service.confidence}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Proposal Builder Tab */}
                {activeTab === 'proposal' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="overflow-y-auto max-h-[360px] space-y-4 pr-1">
                      
                      {/* PDF Print Export Bar */}
                      <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl flex justify-between items-center">
                        <div>
                          <h4 className="text-xs font-bold text-sky-900">Proposal Document Ready</h4>
                          <p className="text-[10px] text-sky-700">Fully structured with Executive Summary, expected results, timelines, and costs.</p>
                        </div>
                        <a
                          href={`/proposal/${activeProspect.id}/print`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-colors"
                        >
                          📄 Export PDF
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      <div>
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Executive Summary</h4>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{activeProspect.executiveSummary}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expected Results</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.expectedResults}</p>
                        </div>
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated ROI</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.estimatedRoi}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">30-Day roadmap</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.thirtyDayPlan}</p>
                        </div>
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">90-Day expansion</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.ninetyDayPlan}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pricing Package Recommendations</h4>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100">{activeProspect.pricingRecommendation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Outreach Center Tab */}
                {activeTab === 'outreach' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Outreach Subtabs */}
                      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600 mb-3">
                        <button
                          onClick={() => setOutreachSubTab('email')}
                          className={`flex-1 py-1 px-2.5 rounded transition-all ${outreachSubTab === 'email' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Cold Email
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('linkedin')}
                          className={`flex-1 py-1 px-2.5 rounded transition-all ${outreachSubTab === 'linkedin' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          LinkedIn
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('discovery')}
                          className={`flex-1 py-1 px-2.5 rounded transition-all ${outreachSubTab === 'discovery' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Call Script
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('followup')}
                          className={`flex-1 py-1 px-2.5 rounded transition-all ${outreachSubTab === 'followup' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Follow-Ups
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('agenda')}
                          className={`flex-1 py-1 px-2.5 rounded transition-all ${outreachSubTab === 'agenda' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Meeting Agenda
                        </button>
                      </div>

                      {/* Content panel based on subtab */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          Generated Deliverable ({outreachSubTab})
                        </span>
                        
                        {/* Copy button */}
                        <button
                          onClick={() => {
                            let textToCopy = '';
                            if (outreachSubTab === 'email') textToCopy = activeProspect.coldEmail;
                            else if (outreachSubTab === 'linkedin') textToCopy = activeProspect.linkedInMessage;
                            else if (outreachSubTab === 'discovery') textToCopy = activeProspect.discoveryScript;
                            else if (outreachSubTab === 'followup') textToCopy = activeProspect.followUpSequence;
                            else if (outreachSubTab === 'agenda') textToCopy = activeProspect.meetingAgenda;
                            
                            copyToClipboard(textToCopy, outreachSubTab);
                          }}
                          className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded"
                        >
                          {copiedText === outreachSubTab ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy Script
                            </>
                          )}
                        </button>
                      </div>

                      {/* Text display panel */}
                      <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto h-[260px]">
                        {outreachSubTab === 'email' && activeProspect.coldEmail}
                        {outreachSubTab === 'linkedin' && activeProspect.linkedInMessage}
                        {outreachSubTab === 'discovery' && activeProspect.discoveryScript}
                        {outreachSubTab === 'followup' && activeProspect.followUpSequence}
                        {outreachSubTab === 'agenda' && activeProspect.meetingAgenda}
                      </pre>

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
                Enter a website URL above or select a past lead to load their Client Acquisition Proposal.
              </p>
            </div>
          )}

        </div>

        {/* Right Column: History List, Billing, Logs */}
        <div className="space-y-6">
          
          {/* Billing Plan Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-slate-500" />
              Billing & Subscription
            </h3>

            {user.subscriptionTier === 'FREE' ? (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-500">
                  You are currently on the <span className="font-bold">Free Plan</span> (10 monthly proposal scans). Upgrade to unlock the PDF exporter and extension hooks.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={billingLoading}
                    onClick={() => triggerStripeCheckout('PRO')}
                    className="flex-1 text-center bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    Pro ($29/mo)
                  </button>
                  <button
                    disabled={billingLoading}
                    onClick={() => triggerStripeCheckout('AGENCY')}
                    className="flex-1 text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    Agency ($79)
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

          {/* High-Value Prospects History list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <History className="h-4.5 w-4.5 text-slate-400" />
              High-Value Pipelines
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
                    <div className="overflow-hidden mr-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">{p.companyName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{p.websiteUrl}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-black text-emerald-600 font-mono">
                        ${p.potentialRevenue.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => handleDeleteProspect(p.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete profile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No prospects scanned yet.
                </div>
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[300px]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <BarChart3 className="h-4.5 w-4.5 text-slate-400" />
              Activity Feed
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
                  No activity log.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
