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
  Layers,
  ArrowUpRight,
  ShieldCheck,
  HelpCircle,
  Link as LinkIcon,
  X,
  Plus,
  AlertTriangle,
  Briefcase,
  AlertCircle,
  ThumbsDown,
  ThumbsUp
} from 'lucide-react';

interface VerifiedFact {
  fact: string;
  sourceUrl: string;
  confidence: number;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
  evidenceText?: string;
}

interface AIInsight {
  finding: string;
  evidence: string;
  reasoning: string;
  confidence: number;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
}

interface RecommendedService {
  serviceName: string;
  issue: string;
  impact: string;
  estimatedFee: string;
  estimatedValue: number;
  confidence: number;
  expectedOutcome: string;
  estimatedRoi: string;
  status: 'Verified' | 'Likely' | 'Uncertain' | 'Suppressed';
  explanation: string;
  evidenceList: string[];
}

interface ScorePoint {
  label: string;
  points: number;
}

interface ScoreDetail {
  score: number;
  explanation: string;
  breakdown: ScorePoint[];
  evidence: string[];
}

interface ScoreExplanations {
  opportunityScore: ScoreDetail;
  buyingSignalScore: ScoreDetail;
  techStack?: string[];
}

interface PricingAssumptions {
  assumptions: string[];
  pricingModel: string;
  disclaimer: string;
}

interface Prospect {
  id: string;
  companyName: string;
  websiteUrl: string;
  verifiedFacts: string; // JSON
  aiInferences: string; // JSON (AI Insights)
  buyingSignals: string; // JSON
  recommendations: string; // JSON (Opportunities & Solutions)
  scoreExplanations: string; // JSON
  opportunityScore: number;
  buyingSignalScore: number;
  potentialRevenue: number;
  closingProbability: number;
  problemSeverity: string;
  leadQuality: string;
  proposalStatus: string; // Ready, Blocked
  evidenceQuality: number;
  verificationPassRate: number;
  findingReliability: number;
  factsVerifiedCount: number;
  claimsRejectedCount: number;
  lowConfidenceCount: number;
  suppressedRecsCount: number;
  opportunityRange: string;
  revenueAssumptions: string; // JSON
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

interface ModalContent {
  title: string;
  explanation: string;
  breakdown: ScorePoint[];
  evidence: string[];
  status?: string;
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
  
  // Dashboard navigation tabs
  const [activeTab, setActiveTab] = useState<'opportunities' | 'proposal' | 'outreach' | 'vault' | 'valuation'>('opportunities');
  const [showCalcIndex, setShowCalcIndex] = useState<number | null>(null);
  
  // Subtabs
  const [auditSubTab, setAuditSubTab] = useState<'facts' | 'insights' | 'opportunities' | 'solutions'>('facts');
  const [outreachSubTab, setOutreachSubTab] = useState<'email' | 'linkedin' | 'followup' | 'discovery' | 'angle'>('email');
  const [billingLoading, setBillingLoading] = useState(false);
  const [syncingCrm, setSyncingCrm] = useState(false);
  const [crmSuccess, setCrmSuccess] = useState(false);
  const [campaignEmail, setCampaignEmail] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);

  // Evidence Modals
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeProspect) {
      const cleanDomain = activeProspect.websiteUrl.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
      setCampaignEmail(`info@${cleanDomain}`);
      setCampaignSubject(`Systems Optimization Audit & Roadmap for ${activeProspect.companyName}`);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
      setScheduledDate(tomorrow.toISOString().slice(0, 16));
    }
  }, [activeProspect]);

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
        throw new Error(data.error || 'Verification check failed. Verify domain.');
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

  const handleCrmSync = async () => {
    if (!activeProspect) return;
    setSyncingCrm(true);
    setCrmSuccess(false);
    try {
      const res = await fetch('/api/crm/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospectId: activeProspect.id }),
      });
      if (res.ok) {
        setCrmSuccess(true);
        setTimeout(() => setCrmSuccess(false), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to sync to CRM');
      }
    } catch (e) {
      alert('Failed to sync to CRM');
    } finally {
      setSyncingCrm(false);
    }
  };

  const handleSendCampaign = async (sendImmediately: boolean) => {
    if (!activeProspect) return;
    if (!campaignEmail) {
      alert('Recipient email is required.');
      return;
    }
    setSendingCampaign(true);
    try {
      const emailBody = outreachSubTab === 'email' ? activeProspect.coldEmail : activeProspect.followUpSequence;
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: activeProspect.id,
          recipientEmail: campaignEmail,
          subject: campaignSubject || 'Client Acquisition Pitch',
          body: emailBody,
          sendImmediately,
          scheduledTime: sendImmediately ? null : scheduledDate
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedProspect = data.prospect;
        setActiveProspect(updatedProspect);
        setProspects(prev => prev.map(p => p.id === updatedProspect.id ? updatedProspect : p));
      } else {
        alert(data.error || 'Failed to dispatch campaign.');
      }
    } catch (e) {
      alert('Network error occurred dispatching campaign.');
    } finally {
      setSendingCampaign(false);
    }
  };

  const handleResetCampaign = async () => {
    if (!activeProspect) return;
    try {
      const emailBody = outreachSubTab === 'email' ? activeProspect.coldEmail : activeProspect.followUpSequence;
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectId: activeProspect.id,
          recipientEmail: campaignEmail,
          subject: campaignSubject,
          body: emailBody,
          sendImmediately: false,
          scheduledTime: null
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedProspect = data.prospect;
        setActiveProspect(updatedProspect);
        setProspects(prev => prev.map(p => p.id === updatedProspect.id ? updatedProspect : p));
      }
    } catch (e) {}
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

  // Helper JSON Parsers
  const parseFacts = (jsonStr: string): VerifiedFact[] => {
    try { return JSON.parse(jsonStr) || []; } catch { return []; }
  };

  const parseInsights = (jsonStr: string): AIInsight[] => {
    try { return JSON.parse(jsonStr) || []; } catch { return []; }
  };

  const parseRecommendations = (jsonStr: string): RecommendedService[] => {
    try { return JSON.parse(jsonStr) || []; } catch { return []; }
  };

  const parseScoreExplanations = (jsonStr: string): ScoreExplanations | null => {
    try { return JSON.parse(jsonStr) || null; } catch { return null; }
  };

  const parseCampaign = (jsonStr: string | undefined): any => {
    try { return JSON.parse(jsonStr || "{}") || {}; } catch { return {}; }
  };

  const parsePricingAssumptions = (jsonStr: string): PricingAssumptions => {
    try { 
      return JSON.parse(jsonStr) || { assumptions: [], pricingModel: '', disclaimer: '' }; 
    } catch { 
      return { assumptions: [], pricingModel: '', disclaimer: '' }; 
    }
  };

  const parseSignals = (jsonStr: string): BuyingSignal[] => {
    try { return JSON.parse(jsonStr) || []; } catch { return []; }
  };

  const parseCompetitorGaps = (jsonStr: string | undefined): CompetitorGap[] => {
    if (!jsonStr) return [];
    try { return JSON.parse(jsonStr) || []; } catch { return []; }
  };

  // Trigger modal drawer
  const openShowWhy = (title: string, explanation: string, breakdown: ScorePoint[], evidence: string[], status?: string) => {
    setModalContent({ title, explanation, breakdown, evidence, status });
    setShowWhyModal(true);
  };

  // Status Badge Colors
  const getStatusBadgeClass = (status: string) => {
    const s = status?.toUpperCase();
    if (s === 'VERIFIED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'LIKELY') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (s === 'UNCERTAIN') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-750 border-rose-200'; // SUPPRESSED
  };

  // Pipeline metrics
  const totalRevenuePipeline = prospects.reduce((acc, p) => acc + p.potentialRevenue, 0);
  const proposalsReadyCount = prospects.filter(p => p.proposalStatus === 'Ready').length;
  const totalVerifiedOpps = prospects.reduce((acc, p) => acc + parseRecommendations(p.recommendations).length, 0);
  const meetingsGeneratedCount = activities.filter(a => a.action === 'DELETED_PROSPECT' || a.action === 'SUBSCRIBED').length + prospects.length;

  // New global dashboard metrics calculations
  const parsedRanges = prospects.map(p => {
    const range = p.opportunityRange || "$0 - $0";
    const parts = range.replace(/\$/g, '').replace(/,/g, '').split('-');
    const min = parseInt(parts[0]?.trim() || '0') || 0;
    const max = parseInt(parts[1]?.trim() || parts[0]?.trim() || '0') || 0;
    return { min, max };
  });
  const totalMin = parsedRanges.reduce((acc, r) => acc + r.min, 0);
  const totalMax = parsedRanges.reduce((acc, r) => acc + r.max, 0);
  const totalOpportunityValueRange = totalMin === 0 && totalMax === 0 ? "$0" : `$${totalMin.toLocaleString()} - $${totalMax.toLocaleString()}`;

  const avgEvidenceConfidence = prospects.length > 0 
    ? Math.round(prospects.reduce((acc, p) => acc + p.findingReliability, 0) / prospects.length) 
    : 100;

  const getSeverityBadgeColor = (severity: string) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return 'text-rose-700 bg-rose-50 border-rose-200';
    if (s === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-sky-700 bg-sky-50 border-sky-200';
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
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      
      {/* ---------------- SECTION 7: SHOW ME WHY MODAL DRAWER ---------------- */}
      {showWhyModal && modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-black text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Evidence Verification audit
                </h3>
                <button 
                  onClick={() => setShowWhyModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Verification Target</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{modalContent.title}</p>
                  </div>
                  {modalContent.status && (
                    <span className={`px-2.5 py-1 text-[10px] font-bold border rounded-full uppercase ${getStatusBadgeClass(modalContent.status)}`}>
                      {modalContent.status}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Auditor Logic Reasoning</span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {modalContent.explanation}
                  </p>
                </div>

                {modalContent.breakdown && modalContent.breakdown.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mathematical Breakdown</span>
                    <div className="mt-2 space-y-1.5">
                      {modalContent.breakdown.map((pt, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-150 text-xs">
                          <span className="text-slate-700 font-semibold">{pt.label}</span>
                          <span className="font-mono font-bold text-emerald-600">+{pt.points} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verifiable Quotes / Supporting text</span>
                  <ul className="mt-2 space-y-2">
                    {modalContent.evidence && modalContent.evidence.length > 0 ? (
                      modalContent.evidence.map((quote, idx) => (
                        <li key={idx} className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border-l-4 border-emerald-500 italic leading-relaxed">
                          "{quote}"
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-slate-400 italic">No quotes or facts verified.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl mt-8 transition-colors uppercase tracking-wider"
            >
              Close Verification Audit
            </button>
          </div>
        </div>
      )}

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
              Quota Used: {user.analysesUsed} / {user.subscriptionTier === 'AGENCY' ? '∞' : user.analysesLimit}
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
        
        {/* Left Column: Stats & Workspace */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Agency Revenue Dashboard stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Companies Analyzed</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{prospects.length}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verified Opportunities</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{totalVerifiedOpps}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reports Generated</span>
              <p className="text-2xl font-black text-sky-600 mt-1">{prospects.length}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Opportunity Value Range</span>
              <p className="text-sm font-black text-emerald-600 mt-2 truncate" title={totalOpportunityValueRange}>{totalOpportunityValueRange}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Evidence Confidence</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{avgEvidenceConfidence}%</p>
            </div>
          </div>

          {/* Proposal Scraper trigger form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-sky-500" />
              Build Client Solution & Proposal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter any company URL. The system gathers facts, runs the double-agent verification check, and drafts compliant proposals.
            </p>

            <form onSubmit={handleAnalyze} className="mt-4 flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. stripe.com or https://company.com"
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
                    Running auditor checks...
                  </>
                ) : (
                  <>
                    Analyze Website
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

          {/* Core proposal workspace */}
          {activeProspect ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              
              {/* Trust Dashboard Header metrics (Evidence Quality, etc.) */}
              <div className="p-4 bg-slate-900 text-white border-b border-slate-800 grid grid-cols-3 md:grid-cols-6 gap-4 items-center">
                <div className="col-span-3 md:col-span-2">
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Audited Client Profile</span>
                  <h4 className="text-xs font-black truncate">{activeProspect.companyName}</h4>
                </div>
                
                <div className="text-center">
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Evidence Quality</span>
                  <span className="text-xs font-black text-emerald-400">{activeProspect.evidenceQuality}%</span>
                </div>

                <div className="text-center border-x border-slate-800">
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Pass Rate</span>
                  <span className="text-xs font-black text-sky-400">{activeProspect.verificationPassRate}%</span>
                </div>

                <div className="text-center mr-2">
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Reliability</span>
                  <span className="text-xs font-black text-indigo-400">{activeProspect.findingReliability}%</span>
                </div>

                <div className="col-span-3 md:col-span-1 text-center bg-slate-800 py-1.5 rounded-lg border border-slate-700 text-[10px] font-bold">
                  {activeProspect.proposalStatus === 'Speculative' ? (
                    <span className="text-amber-400 flex items-center justify-center gap-0.5 uppercase">
                      ⚠️ SPECULATIVE
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center justify-center gap-0.5 uppercase">
                      ✓ READY
                    </span>
                  )}
                </div>
              </div>

              {/* Suppressed / audit counts sub-header */}
              <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                <span>Facts Verified: <strong className="text-emerald-600">{activeProspect.factsVerifiedCount}</strong></span>
                <span>Claims Rejected: <strong className="text-rose-600">{activeProspect.claimsRejectedCount}</strong></span>
                <span>Low Confidence suppressed: <strong className="text-amber-600">{activeProspect.suppressedRecsCount}</strong></span>
                <span>Opportunity Range: <strong className="text-slate-700 font-mono">{activeProspect.opportunityRange}</strong></span>
              </div>

              {/* Tech Stack Row */}
              {parseScoreExplanations(activeProspect.scoreExplanations)?.techStack && parseScoreExplanations(activeProspect.scoreExplanations)!.techStack!.length > 0 && (
                <div className="px-6 py-2.5 bg-slate-100/50 border-b border-slate-200 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Audited Tech Stack:</span>
                  {parseScoreExplanations(activeProspect.scoreExplanations)?.techStack?.map((tech: string, idx: number) => (
                    <span key={idx} className="bg-white border border-slate-250 text-slate-700 text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                      💻 {tech}
                    </span>
                  ))}
                </div>
              )}

              {/* SPECULATIVE CAVEAT BANNER IF EVIDENCE IS LOW */}
              {activeProspect.proposalStatus === 'Speculative' && (
                <div className="m-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-amber-950 text-xs flex gap-3 items-start shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-sm uppercase">Speculative Proposal Draft</h4>
                    <p className="mt-1 leading-relaxed text-amber-800">
                      Our system flagged this profile as speculative due to limited direct text evidence on the audited pages (Verification Pass Rate: {activeProspect.verificationPassRate}%).
                    </p>
                    <p className="mt-2 font-bold text-amber-900">
                      💡 Consultative Tip: You can export and use this proposal freely, but we recommend cross-checking these suggestions during your discovery meeting.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-white">
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'opportunities' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  Audited Solutions
                </button>
                <button
                  onClick={() => setActiveTab('proposal')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'proposal' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Proposal Generator
                </button>
                <button
                  onClick={() => setActiveTab('outreach')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'outreach' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  Outreach Center
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'vault' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Evidence Vault
                </button>
                <button
                  onClick={() => setActiveTab('valuation')}
                  className={`flex-1 py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'valuation' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Opportunity Valuation
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 flex-1 flex flex-col bg-white">
                
                {/* 1. Audited Solutions (Opportunity Tabs) */}
                {activeTab === 'opportunities' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
                      <button
                        onClick={() => setAuditSubTab('facts')}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                          auditSubTab === 'facts' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Verified Facts
                      </button>
                      <button
                        onClick={() => setAuditSubTab('insights')}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                          auditSubTab === 'insights' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        AI Insights
                      </button>
                      <button
                        onClick={() => setAuditSubTab('opportunities')}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                          auditSubTab === 'opportunities' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Opportunities
                      </button>
                      <button
                        onClick={() => setAuditSubTab('solutions')}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                          auditSubTab === 'solutions' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Solution Builder
                      </button>
                      <button
                        onClick={() => setAuditSubTab('competitors')}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                          auditSubTab === 'competitors' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Competitor Gaps
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[300px] pr-1">
                      
                      {/* Verified Facts */}
                      {auditSubTab === 'facts' && (
                        <div className="space-y-3">
                          {parseFacts(activeProspect.verifiedFacts).map((fact, idx) => (
                            <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm text-xs flex justify-between items-start">
                              <div className="space-y-1">
                                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                                  <span className="text-emerald-500">✓</span>
                                  {fact.fact}
                                </p>
                                {fact.evidenceText && (
                                  <blockquote className="mt-1 border-l-2 border-slate-350 pl-2 text-slate-500 italic">
                                    "{fact.evidenceText}"
                                  </blockquote>
                                )}
                                <a href={fact.sourceUrl} target="_blank" rel="noreferrer" className="block text-[10px] text-sky-600 hover:underline truncate max-w-[320px]">
                                  Source: {fact.sourceUrl}
                                </a>
                              </div>
                              <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase ${getStatusBadgeClass(fact.status)}`}>
                                {fact.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI Insights */}
                      {auditSubTab === 'insights' && (
                        <div className="space-y-3">
                          {parseInsights(activeProspect.aiInferences).map((inf, idx) => (
                            <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-black text-slate-900 text-sm">Finding: {inf.finding}</h4>
                                <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase ${getStatusBadgeClass(inf.status)}`}>
                                  {inf.status}
                                </span>
                              </div>
                              <p className="text-slate-600"><strong>Evidence:</strong> "{inf.evidence}"</p>
                              <p className="text-slate-600"><strong>Reasoning:</strong> {inf.reasoning}</p>
                              <div className="text-[10px] text-slate-400 font-bold">Confidence: {inf.confidence}%</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Opportunities */}
                      {auditSubTab === 'opportunities' && (
                        <div className="space-y-3">
                          {parseRecommendations(activeProspect.recommendations).map((rec, idx) => (
                            <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 text-sm">Opportunity: {rec.serviceName}</h4>
                                <div className="flex gap-1.5 items-center">
                                  <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase ${
                                    rec.priority === 'Very High Priority' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    rec.priority === 'High Priority' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                    rec.priority === 'Strong' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    rec.priority === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {rec.priority || 'Strong'}
                                  </span>
                                  <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase ${getStatusBadgeClass(rec.status)}`}>
                                    {rec.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-600"><strong>Issue Found:</strong> {rec.issue}</p>
                              {rec.evidenceList && rec.evidenceList.length > 0 && (
                                <blockquote className="mt-1 bg-slate-50 p-2 rounded border border-slate-150 italic text-[11px] text-slate-500 leading-relaxed">
                                  <strong>Verifiable Evidence Quote:</strong> "{rec.evidenceList[0]}"
                                </blockquote>
                              )}
                              <p className="text-slate-600"><strong>Impact:</strong> {rec.impact}</p>
                              {rec.calculation && (
                                <div className="mt-1.5 p-2 bg-emerald-50/50 border border-emerald-100 rounded text-[11px] text-emerald-800 leading-normal">
                                  <strong>Pricing Calculation Formula:</strong> {rec.calculation}
                                </div>
                              )}
                              {rec.calculationDetails && (
                                <div className="p-2 bg-slate-50 border border-slate-150 rounded text-[10px] text-slate-400 leading-normal">
                                  <strong>Opportunity Score Math:</strong> {rec.calculationDetails}
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="font-bold text-slate-500 uppercase text-[9px]">Revenue Potential</span>
                                <span className="font-mono font-black text-emerald-600">{rec.estimatedFee}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Solution Builder */}
                      {auditSubTab === 'solutions' && (
                        <div className="space-y-3">
                          {parseRecommendations(activeProspect.recommendations).map((rec, idx) => (
                            <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm text-xs space-y-2">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 text-sm">Solution: {rec.serviceName}</h4>
                                <div className="flex gap-1.5 items-center">
                                  <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase ${
                                    rec.priority === 'Very High Priority' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    rec.priority === 'High Priority' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                    rec.priority === 'Strong' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                    rec.priority === 'Moderate' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}>
                                    {rec.priority || 'Strong'}
                                  </span>
                                  <span className={`text-[9px] font-bold border rounded-full px-2 py-0.5 uppercase ${getStatusBadgeClass(rec.status)}`}>
                                    {rec.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-600"><strong>Problem Found:</strong> {rec.issue}</p>
                              {rec.evidenceList && rec.evidenceList.length > 0 && (
                                <blockquote className="mt-1 bg-slate-50 p-2 rounded border border-slate-150 italic text-[11px] text-slate-500 leading-relaxed">
                                  <strong>Verifiable Evidence Quote:</strong> "{rec.evidenceList[0]}"
                                </blockquote>
                              )}
                              <p className="text-slate-600"><strong>Expected Outcome:</strong> {rec.expectedOutcome}</p>
                              <p className="text-slate-600"><strong>Estimated ROI:</strong> {rec.estimatedRoi}</p>
                              {rec.calculation && (
                                <div className="mt-1.5 p-2 bg-emerald-50/50 border border-emerald-100 rounded text-[11px] text-emerald-800 leading-normal">
                                  <strong>Pricing Calculation Formula:</strong> {rec.calculation}
                                </div>
                              )}
                              {rec.calculationDetails && (
                                <div className="p-2 bg-slate-50 border border-slate-150 rounded text-[10px] text-slate-400 leading-normal">
                                  <strong>Opportunity Score Math:</strong> {rec.calculationDetails}
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                <span className="font-bold text-slate-500 uppercase text-[9px]">Estimated Project Value</span>
                                <span className="font-mono font-black text-emerald-600">${(rec.estimatedValue || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Competitor Gap Snapshot */}
                      {auditSubTab === 'competitors' && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-normal">
                            👉 <strong>Feature Benchmark Snapshot:</strong> Comparing observable features on <strong>{activeProspect.companyName}</strong> against 2 to 5 standard competitors in their industry.
                          </div>
                          
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                                  <th className="p-3">Observable Web Feature</th>
                                  <th className="p-3">Prospect Status</th>
                                  <th className="p-3">Competitors Status</th>
                                  <th className="p-3 text-right">Confidence</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 bg-white">
                                {parseCompetitorGaps(activeProspect.competitorGaps).length > 0 ? (
                                  parseCompetitorGaps(activeProspect.competitorGaps).map((gap: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="p-3 font-bold text-slate-800">{gap.featureName}</td>
                                      <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          gap.prospectStatus === 'Detected' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                        }`}>
                                          {gap.prospectStatus}
                                        </span>
                                      </td>
                                      <td className="p-3 text-slate-600 font-medium">{gap.competitorStatus}</td>
                                      <td className="p-3 text-right font-mono text-slate-400">{gap.confidence || 100}%</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-400 italic">
                                      No competitor benchmarks recorded for this prospect. Please run a new audit scan to compile competitor parameters.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}

                {/* 2. Proposal Generator */}
                {activeTab === 'proposal' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="overflow-y-auto max-h-[360px] space-y-4 pr-1">
                      
                      {/* PDF Print Export Bar */}
                      <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${
                        activeProspect.proposalStatus === 'Speculative' 
                          ? 'bg-amber-50 border-amber-200' 
                          : 'bg-sky-50 border-sky-100'
                      }`}>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Proposal Exporter & Integrations</h4>
                          <p className="text-[10px] text-slate-500">
                            {activeProspect.proposalStatus === 'Speculative' 
                              ? 'Export caution-stamped consultative proposal.' 
                              : 'Print client-ready verified proposals or sync to CRM.'}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            disabled={syncingCrm}
                            onClick={handleCrmSync}
                            className={`font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors border ${
                              crmSuccess 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {syncingCrm ? '⏳ Syncing...' : crmSuccess ? '✓ Synced to CRM' : '🔗 Sync to CRM'}
                          </button>

                          <a
                            href={`/proposal/${activeProspect.id}/print`}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-sm transition-colors ${
                              activeProspect.proposalStatus === 'Speculative'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-sky-600 hover:bg-sky-700 text-white'
                            }`}
                          >
                            📄 Open PDF Proposal
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Executive Summary</h4>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{activeProspect.executiveSummary}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expected Outcomes</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.expectedResults}</p>
                        </div>
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated ROI</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.estimatedRoi}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">30-Day Action Plan</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.thirtyDayPlan}</p>
                        </div>
                        <div>
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">90-Day Action Plan</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-2.5 rounded border border-slate-100">{activeProspect.ninetyDayPlan}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cost Estimate & Recommendations</h4>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100">{activeProspect.pricingRecommendation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Outreach Center */}
                {activeTab === 'outreach' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Subtabs selection */}
                      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600 mb-3">
                        <button
                          onClick={() => setOutreachSubTab('email')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'email' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Cold Email
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('linkedin')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'linkedin' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          LinkedIn
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('followup')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'followup' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Follow-Up Email
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('discovery')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'discovery' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Discovery Questions
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('angle')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'angle' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Sales Angle
                        </button>
                      </div>

                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                          Deliverable: {outreachSubTab === 'discovery' ? 'Discovery Questions' : outreachSubTab === 'angle' ? 'Sales Angle' : outreachSubTab}
                        </span>
                        
                        <button
                          onClick={() => {
                            let text = '';
                            if (outreachSubTab === 'email') text = activeProspect.coldEmail;
                            else if (outreachSubTab === 'linkedin') text = activeProspect.linkedInMessage;
                            else if (outreachSubTab === 'followup') text = activeProspect.followUpSequence;
                            else if (outreachSubTab === 'discovery') text = activeProspect.discoveryScript;
                            else if (outreachSubTab === 'angle') text = activeProspect.meetingAgenda;
                            copyToClipboard(text, outreachSubTab);
                          }}
                          className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded"
                        >
                          {copiedText === outreachSubTab ? (
                            <>
                              <Check className="h-3 w-3" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy script
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs md:text-sm font-mono whitespace-pre-wrap leading-relaxed overflow-y-auto h-[180px]">
                        {outreachSubTab === 'email' && activeProspect.coldEmail}
                        {outreachSubTab === 'linkedin' && activeProspect.linkedInMessage}
                        {outreachSubTab === 'followup' && activeProspect.followUpSequence}
                        {outreachSubTab === 'discovery' && activeProspect.discoveryScript}
                        {outreachSubTab === 'angle' && activeProspect.meetingAgenda}
                      </pre>

                      {/* Outbound Campaign Manager */}
                      {(outreachSubTab === 'email' || outreachSubTab === 'followup') && (() => {
                        const activeCampaign = parseCampaign(activeProspect.outreachCampaign);
                        return (
                          <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50 text-xs space-y-3">
                            <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-200 pb-1.5 flex justify-between items-center">
                              <span>Outbound Pitch Scheduler</span>
                              {activeCampaign?.status && (
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  activeCampaign.status === 'Sent' ? 'bg-emerald-100 text-emerald-800' :
                                  activeCampaign.status === 'Scheduled' ? 'bg-sky-100 text-sky-800 animate-pulse' :
                                  'bg-rose-100 text-rose-800'
                                }`}>
                                  {activeCampaign.status}
                                </span>
                              )}
                            </h5>

                            {activeCampaign?.status && activeCampaign.status !== 'Draft' ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div>
                                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Recipient</span>
                                    <span className="text-slate-700 font-bold">{activeCampaign.recipientEmail}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block uppercase font-bold text-[8px]">Subject</span>
                                    <span className="text-slate-700 truncate block font-bold">{activeCampaign.subject}</span>
                                  </div>
                                </div>

                                <div className="mt-2 space-y-1 bg-white p-2 rounded border border-slate-150 max-h-[80px] overflow-y-auto font-mono text-[9px] text-slate-500">
                                  <span className="font-bold text-[8px] text-slate-400 uppercase block mb-1">Execution Logs:</span>
                                  {activeCampaign.logs?.map((l: any, idx: number) => (
                                    <div key={idx} className="leading-tight">
                                      [{new Date(l.timestamp).toLocaleTimeString()}] {l.event}
                                    </div>
                                  ))}
                                </div>

                                <button
                                  onClick={handleResetCampaign}
                                  className="text-[10px] text-sky-600 hover:text-sky-700 font-bold"
                                >
                                  🔄 Schedule another pitch
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Recipient Email</label>
                                    <input
                                      type="email"
                                      value={campaignEmail}
                                      onChange={(e) => setCampaignEmail(e.target.value)}
                                      placeholder="e.g. info@company.com"
                                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Email Subject</label>
                                    <input
                                      type="text"
                                      value={campaignSubject}
                                      onChange={(e) => setCampaignSubject(e.target.value)}
                                      placeholder="e.g. System Audit Roadmap"
                                      className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 pt-1">
                                  <div>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Schedule Delay</label>
                                    <input
                                      type="datetime-local"
                                      value={scheduledDate}
                                      onChange={(e) => setScheduledDate(e.target.value)}
                                      className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-600 font-sans"
                                    />
                                  </div>
                                  <div className="flex gap-2 w-full md:w-auto">
                                    <button
                                      disabled={sendingCampaign}
                                      onClick={() => handleSendCampaign(false)}
                                      className="flex-1 md:flex-none text-center bg-white hover:bg-slate-100 border border-slate-250 font-bold text-[10px] text-slate-700 py-1.5 px-3 rounded-lg shadow-sm"
                                    >
                                      📅 Schedule
                                    </button>
                                    <button
                                      disabled={sendingCampaign}
                                      onClick={() => handleSendCampaign(true)}
                                      className="flex-1 md:flex-none text-center bg-sky-600 hover:bg-sky-700 font-bold text-[10px] text-white py-1.5 px-3.5 rounded-lg shadow-sm"
                                    >
                                      {sendingCampaign ? '⏳ Sending...' : '🚀 Send Now'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 4. Evidence Vault */}
                {activeTab === 'vault' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Evidence Citations Vault</h4>
                    <p className="text-[11px] text-slate-400">Verifiable quotes, job releases, and content signals tracked by the verification checks.</p>
                    
                    <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1">
                      {parseSignals(activeProspect.buyingSignals).map((sig, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                            <span className="font-bold text-sky-700 uppercase tracking-wide text-[9px] bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                              Signal: {sig.signal}
                            </span>
                            <span className="text-[9px] text-slate-400">Audited: {sig.dateDiscovered}</span>
                          </div>
                          
                          <blockquote className="border-l-2 border-slate-400 pl-2 text-slate-600 italic">
                            "{sig.sourceText}"
                          </blockquote>

                          <a href={sig.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-sky-600 flex items-center gap-0.5 hover:underline pt-1 truncate">
                            <LinkIcon className="h-3 w-3" />
                            Source page: {sig.sourceUrl}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Safe Opportunity Valuation Engine */}
                {activeTab === 'valuation' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                      <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Service Opportunity Range</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Total Range: {activeProspect.opportunityRange}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Left: Valuations range list */}
                      <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                        {parseRecommendations(activeProspect.recommendations).map((rec, idx) => {
                          const fee = rec.estimatedFee || "$0";
                          const parts = fee.replace(/\$/g, '').replace(/,/g, '').split('-');
                          const min = parseInt(parts[0]?.trim() || '0') || 0;
                          const max = parseInt(parts[1]?.trim() || parts[0]?.trim() || '0') || 0;
                          const confMultiplier = (rec.confidence || 100) / 100;
                          const weightedMin = Math.round(min * confMultiplier);
                          const weightedMax = Math.round(max * confMultiplier);
                          const weightedRange = `$${weightedMin.toLocaleString()} - $${weightedMax.toLocaleString()}`;

                          return (
                            <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Service Type</span>
                                  <strong className="text-slate-800 text-sm">{rec.serviceName}</strong>
                                </div>
                                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                                  Conf: {rec.confidence}%
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded border border-slate-100">
                                <div>
                                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Estimated Range</span>
                                  <span className="text-slate-700 font-bold">{rec.estimatedFee}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block uppercase font-bold text-[8px]">Weighted Range</span>
                                  <span className="text-emerald-700 font-bold">{weightedRange}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => setShowCalcIndex(showCalcIndex === idx ? null : idx)}
                                  className="text-[9px] font-bold text-sky-600 hover:text-sky-700"
                                >
                                  {showCalcIndex === idx ? '✕ Hide Calculation' : '➕ Show Calculation'}
                                </button>
                              </div>

                              {showCalcIndex === idx && (
                                <div className="p-2.5 bg-slate-50 border border-slate-150 rounded text-[10px] text-slate-500 font-sans space-y-1">
                                  <p><strong>Pricing Formula:</strong> {rec.calculation}</p>
                                  <p><strong>Opportunity Priority score:</strong> {rec.priority} ({rec.priorityScore || 80}%)</p>
                                  <p className="text-[9px] text-slate-400"><strong>Calculated Weight:</strong> Raw Range * {confMultiplier} confidence multiplier = {weightedRange}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Right: Pricing Assumptions & Safe Valuation Disclaimer */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-4 max-h-[220px] overflow-y-auto">
                        <div>
                          <span className="font-bold text-slate-900 block text-[9px] uppercase tracking-wider">Valuation Disclaimer</span>
                          <p className="text-[10px] text-slate-500 leading-relaxed italic mt-1 bg-amber-50/50 p-2.5 border border-amber-200/65 rounded-lg text-amber-900">
                            Opportunity values are illustrative estimates based on detected issues and predefined service pricing models. They are not guarantees of revenue, project awards, or business outcomes.
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-[9px] uppercase tracking-wider">Model Assumptions</span>
                          <ul className="list-disc pl-4 mt-1.5 text-[10px] text-slate-600 space-y-1.5">
                            {parsePricingAssumptions(activeProspect.revenueAssumptions).assumptions.map((asm, idx) => (
                              <li key={idx}>{asm}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-[9px] uppercase tracking-wider">Pricing Model</span>
                          <p className="text-[10px] text-slate-600 leading-normal mt-1">
                            {parsePricingAssumptions(activeProspect.revenueAssumptions).pricingModel}
                          </p>
                        </div>
                      </div>
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

        {/* Right Column: History, Billing, Logs */}
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

          {/* Client Opportunity Ranges History list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[350px]">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <History className="h-4.5 w-4.5 text-slate-400" />
              Client Opportunity Ranges
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
                      <span className="text-[9px] font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        {p.opportunityRange || 'N/A'}
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
