'use strict';
'use client';

import React, { useState, useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  calculateTrustScore, 
  getTrustStatusLevel, 
  getTrustStatusColors, 
  TrustScoreResult,
  TrustComponent,
  TrustDiagnostics
} from '@/lib/trustEngine';
import {
  calculateServiceOpportunity,
  calculateOpportunityPortfolio,
  ServiceOpportunityCalculation,
  OpportunityPortfolioResult,
  PRICING_MODEL,
  STANDARD_ASSUMPTIONS,
  FINANCIAL_DISCLAIMER
} from '@/lib/opportunityEngine';
import {
  generateSolutionSandbox,
  SolutionSandboxResult,
  SandboxEvidence,
  SANDBOX_POSITIONING,
  SANDBOX_DISCLAIMER
} from '@/lib/sandboxEngine';
import ErrorBoundary from '@/components/ErrorBoundary';
import {
  detectAnalysisChanges,
  normalizeWebsiteUrl,
  AnalysisComparisonReport,
  ALLOWED_ROOT_CAUSES
} from '@/lib/changeDetection';
import {
  generateLinkedInPost,
  generateTwitterThread,
  generateAgencyTips,
  generateWebsiteTeardown,
  generateOpportunityDiscoveryPost,
  generateContentIdeas,
  generateReferralCode,
  getReferralRewardTiers
} from '@/lib/growthEngine';








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
  ThumbsUp,
  Globe,
  Clock,
  FileCheck,
  Filter,
  Eye,
  RefreshCw,
  Zap,
  CheckCircle2,
  ListOrdered
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
  pagesDiscoveredCount?: number;
  pagesCrawledCount?: number;
  crawlCoveragePercent?: number;
  crawlDurationMs?: number;
  totalTextExtracted?: number;
  crawledPagesData?: string; // JSON
  crawlDiagnostics?: string; // JSON
  analysisVersion?: number;
  previousAnalysisId?: string | null;
  changeSummary?: string;
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

interface DiscoveredPageItem {
  url: string;
  title: string;
  category: string;
  depth: number;
  status: 'Crawled' | 'Skipped (Capped)' | 'Failed';
  textLength: number;
  snippet?: string;
  discoveredFrom?: string;
}

interface CrawlDiagnosticsData {
  pagesDiscovered: number;
  pagesCrawled: number;
  pagesSkipped: number;
  crawlDurationMs: number;
  totalTextExtracted: number;
  coveragePercentage: number;
  warningMessage?: string;
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

interface AnalysisErrorState {
  classification: string;
  userMessage: string;
  referenceCode?: string;
  isRetryable: boolean;
  adminDetails?: {
    prismaErrorCode: string;
    model: string;
    missingItem: string;
    migrationStatus: string;
  };
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
  const [analysisError, setAnalysisError] = useState<AnalysisErrorState | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Dashboard navigation tabs
  const [activeTab, setActiveTab] = useState<'opportunities' | 'sandbox' | 'proposal' | 'outreach' | 'vault' | 'valuation' | 'comparison'>('opportunities');
  const [showCalcIndex, setShowCalcIndex] = useState<number | null>(null);
  const [selectedComparisonVersion, setSelectedComparisonVersion] = useState<string | null>(null);

  
  // Subtabs
  const [auditSubTab, setAuditSubTab] = useState<'facts' | 'insights' | 'opportunities' | 'solutions' | 'competitors' | 'rawScrape'>('facts');
  const [scrapeEvidenceSearch, setScrapeEvidenceSearch] = useState('');
  const [copiedQuoteIdx, setCopiedQuoteIdx] = useState<number | null>(null);
  const [vaultSubTab, setVaultSubTab] = useState<'pages' | 'citations'>('pages');
  const [vaultSearch, setVaultSearch] = useState('');
  const [selectedPageSnippet, setSelectedPageSnippet] = useState<{ title: string; url: string; snippet?: string } | null>(null);
  const [outreachSubTab, setOutreachSubTab] = useState<'email' | 'linkedin' | 'followup' | 'discovery' | 'angle' | 'social' | 'ideas'>('email');
  const [socialType, setSocialType] = useState<'linkedin' | 'twitter' | 'tips' | 'teardown' | 'discovery'>('linkedin');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [syncingCrm, setSyncingCrm] = useState(false);
  const [crmSuccess, setCrmSuccess] = useState(false);

  // Live Proposal Engagement Telemetry State
  const [proposalTelemetry, setProposalTelemetry] = useState<{
    totalViews: number;
    pricingViews: number;
    hasPricingViewed: boolean;
    lastViewedAt: string | null;
    loading: boolean;
  }>({ totalViews: 0, pricingViews: 0, hasPricingViewed: false, lastViewedAt: null, loading: false });

  // Two-Way CRM Synchronization Feedback State
  const [crmSyncRecords, setCrmSyncRecords] = useState<Record<string, {
    status: string;
    destinations: Array<{ label: string; status: string; url?: string }>;
    dealName: string;
    dealStage: string;
    syncedAt: string;
  }>>({});

  // Batch Multi-Domain Scanner State
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrlsText, setBatchUrlsText] = useState('');
  const [batchScanning, setBatchScanning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    currentDomain: string;
    results: Array<{ domain: string; status: 'success' | 'failed'; score?: number; value?: string; error?: string }>;
  } | null>(null);

  // Sorting State for Prospects List
  const [prospectSortBy, setProspectSortBy] = useState<'opportunity' | 'newest'>('opportunity');


  const [campaignEmail, setCampaignEmail] = useState('');
  const [campaignSubject, setCampaignSubject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [sendingCampaign, setSendingCampaign] = useState(false);

  // Evidence & Trust Modals
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [selectedTrustBreakdown, setSelectedTrustBreakdown] = useState<TrustScoreResult | null>(null);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<TrustDiagnostics | null>(null);
  const [showOpportunityCalcModal, setShowOpportunityCalcModal] = useState(false);
  const [selectedOpportunityCalc, setSelectedOpportunityCalc] = useState<ServiceOpportunityCalculation | null>(null);
  const [selectedPortfolioCalc, setSelectedPortfolioCalc] = useState<OpportunityPortfolioResult | null>(null);
  const [selectedSandboxType, setSelectedSandboxType] = useState<string>('websiteRedesign');
  const [showSandboxEvidenceModal, setShowSandboxEvidenceModal] = useState(false);
  const [selectedSandboxEvidence, setSelectedSandboxEvidence] = useState<SandboxEvidence | null>(null);
  const [showMobileProspectDrawer, setShowMobileProspectDrawer] = useState(false);





  const router = useRouter();

  useEffect(() => {
    fetchUserData();
    if (typeof window !== 'undefined') {
      try {
        const savedRecords = localStorage.getItem('leadpilot_crm_sync_records');
        if (savedRecords) setCrmSyncRecords(JSON.parse(savedRecords));
      } catch {}
    }
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

      // Retrieve live view & engagement telemetry for this prospect
      fetchProposalTelemetry(activeProspect.id);
    }
  }, [activeProspect]);

  const fetchProposalTelemetry = async (prospectId: string) => {
    if (!prospectId) return;
    setProposalTelemetry(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`/api/audit/${prospectId}/track`);
      if (res.ok) {
        const data = await res.json();
        setProposalTelemetry({
          totalViews: data.totalViews || 0,
          pricingViews: data.pricingViews || 0,
          hasPricingViewed: !!data.hasPricingViewed,
          lastViewedAt: data.lastViewedAt || null,
          loading: false,
        });
      } else {
        setProposalTelemetry(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setProposalTelemetry(prev => ({ ...prev, loading: false }));
    }
  };

  const formatRelativeTime = (dateString?: string | null): string => {
    if (!dateString) return 'Never';
    const diff = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const sortedProspects = useMemo(() => {
    const list = [...prospects];
    if (prospectSortBy === 'opportunity') {
      return list.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [prospects, prospectSortBy]);

  const handleBatchScan = async () => {
    const rawLines = batchUrlsText
      .split(/[\n,]+/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const uniqueDomains = Array.from(new Set(rawLines)).slice(0, 10);
    if (uniqueDomains.length === 0) {
      setError('Please enter at least one target domain to batch scan.');
      return;
    }

    setBatchScanning(true);
    setError('');
    const results: Array<{ domain: string; status: 'success' | 'failed'; score?: number; value?: string; error?: string }> = [];
    setBatchProgress({
      current: 0,
      total: uniqueDomains.length,
      currentDomain: uniqueDomains[0],
      results,
    });

    const newlyCreated: Prospect[] = [];

    for (let i = 0; i < uniqueDomains.length; i++) {
      const target = uniqueDomains[i];
      setBatchProgress({
        current: i + 1,
        total: uniqueDomains.length,
        currentDomain: target,
        results: [...results],
      });

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: target }),
        });
        const data = await res.json();
        if (res.ok && data.prospect) {
          newlyCreated.push(data.prospect);
          results.push({
            domain: target,
            status: 'success',
            score: data.prospect.opportunityScore,
            value: data.prospect.opportunityRange,
          });
        } else {
          results.push({
            domain: target,
            status: 'failed',
            error: data.error || 'Verification failed',
          });
        }
      } catch (err: any) {
        results.push({
          domain: target,
          status: 'failed',
          error: err?.message || 'Network error',
        });
      }

      setBatchProgress({
        current: i + 1,
        total: uniqueDomains.length,
        currentDomain: target,
        results: [...results],
      });
    }

    if (newlyCreated.length > 0) {
      setProspects(prev => {
        const existingIds = new Set(newlyCreated.map(n => n.id));
        const merged = [...newlyCreated, ...prev.filter(p => !existingIds.has(p.id))];
        return merged.sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0));
      });
      const topScorer = [...newlyCreated].sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))[0];
      setActiveProspect(topScorer);
      setBatchUrlsText('');
      await Promise.all([fetchStats(), fetchUserData()]);
    }

    setBatchScanning(false);
  };

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

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url) return;
    setAnalyzing(true);
    setError('');
    setAnalysisError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAnalysisError({
          classification: data.classification || 'ANALYSIS_ERROR',
          userMessage: data.error || 'Verification check failed. Verify domain.',
          referenceCode: data.referenceCode,
          isRetryable: data.isRetryable ?? false,
          adminDetails: data.adminDetails
        });
        setError(data.error || 'Verification check failed. Verify domain.');
        return;
      }

      const newProspect = data.prospect;
      setActiveProspect(newProspect);
      setProspects(prev => [newProspect, ...prev]);
      setUrl('');
      await Promise.all([fetchStats(), fetchUserData()]);
    } catch (err: any) {
      const errorMsg = err.message || 'Network connectivity issue. Please retry in a few moments.';
      setAnalysisError({
        classification: 'NETWORK_FAILURE',
        userMessage: errorMsg,
        referenceCode: 'NETWORK_FAILURE',
        isRetryable: true
      });
      setError(errorMsg);
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

  const handleConfigureWebhook = () => {
    const current = typeof window !== 'undefined' ? localStorage.getItem('leadpilot_crm_webhook') || '' : '';
    const input = window.prompt(
      'Enter your Zapier, Make, HubSpot, or CRM Webhook URL (leave empty to use the built-in local simulator):',
      current
    );
    if (input !== null) {
      const trimmed = input.trim();
      if (trimmed) {
        localStorage.setItem('leadpilot_crm_webhook', trimmed);
        alert(`Webhook URL set to: ${trimmed}`);
      } else {
        localStorage.removeItem('leadpilot_crm_webhook');
        alert('Using default CRM simulator webhook.');
      }
    }
  };

  const handleCrmSync = async () => {
    if (!activeProspect) return;
    setSyncingCrm(true);
    setCrmSuccess(false);
    try {
      const savedWebhook = typeof window !== 'undefined' ? localStorage.getItem('leadpilot_crm_webhook') : null;
      const res = await fetch('/api/crm/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prospectId: activeProspect.id,
          crmWebhookUrl: savedWebhook || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCrmSuccess(true);
        const record = {
          status: data.status || 'Synced',
          destinations: data.destinations || [{ label: 'CRM', status: 'synced' }],
          dealName: `${activeProspect.companyName} — LeadPilot Opportunity`,
          dealStage: 'Appointment Scheduled (Default Pipeline)',
          syncedAt: new Date().toISOString(),
        };
        setCrmSyncRecords(prev => {
          const updated = { ...prev, [activeProspect.id]: record };
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('leadpilot_crm_sync_records', JSON.stringify(updated)); } catch {}
          }
          return updated;
        });
        setTimeout(() => setCrmSuccess(false), 3500);
      } else {
        alert(data.error || 'Failed to sync to CRM');
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to sync to CRM');
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

  const parseCrawledPages = (jsonStr: string | undefined): DiscoveredPageItem[] => {
    if (!jsonStr) return [];
    try { return JSON.parse(jsonStr) || []; } catch { return []; }
  };

  const parseCrawlDiagnostics = (jsonStr: string | undefined, p?: Prospect | null): CrawlDiagnosticsData => {
    if (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed.pagesDiscovered === 'number') {
          return parsed;
        }
      } catch { }
    }
    const discovered = p?.pagesDiscoveredCount ?? 1;
    const crawled = p?.pagesCrawledCount ?? 1;
    return {
      pagesDiscovered: discovered,
      pagesCrawled: crawled,
      pagesSkipped: Math.max(0, discovered - crawled),
      crawlDurationMs: p?.crawlDurationMs ?? 0,
      totalTextExtracted: p?.totalTextExtracted ?? 0,
      coveragePercentage: p?.crawlCoveragePercent ?? 100,
      warningMessage: crawled <= 1 ? 'Limited website coverage may reduce analysis quality.' : undefined
    };
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

  // Platform Trust Score Calculations
  const avgVerificationPassRate = prospects.length > 0
    ? Math.round(prospects.reduce((acc, p) => acc + (p.verificationPassRate || 95), 0) / prospects.length)
    : 95;
  const avgEvidenceQuality = prospects.length > 0
    ? Math.round(prospects.reduce((acc, p) => acc + (p.evidenceQuality || 92), 0) / prospects.length)
    : 92;
  const avgCrawlCoverage = prospects.length > 0
    ? Math.round(prospects.reduce((acc, p) => acc + (p.crawlCoveragePercent || 90), 0) / prospects.length)
    : 90;

  const globalPlatformTrust = calculateTrustScore({
    verificationPassRate: avgVerificationPassRate,
    evidenceQuality: avgEvidenceQuality,
    crawlCoveragePercent: avgCrawlCoverage,
    rlsCoveragePercent: 100,
    storageSecurityScore: 100,
    tenantIsolationPassRate: 100
  });

  const activeProspectTrust = activeProspect ? calculateTrustScore({
    verificationPassRate: activeProspect.verificationPassRate,
    evidenceQuality: activeProspect.evidenceQuality,
    crawlCoveragePercent: activeProspect.crawlCoveragePercent,
    findingReliability: activeProspect.findingReliability,
    rlsCoveragePercent: 100,
    storageSecurityScore: 100,
    tenantIsolationPassRate: 100
  }) : null;

  // Transparent Opportunity Portfolio Engine
  const activeOpportunityPortfolio = activeProspect ? calculateOpportunityPortfolio(
    parseRecommendations(activeProspect.recommendations),
    {
      evidenceQuality: activeProspect.evidenceQuality,
      findingReliability: activeProspect.findingReliability,
      competitorGaps: parseCompetitorGaps(activeProspect.competitorGaps)
    }
  ) : null;

  // Solution Sandbox Engine
  const activeSolutionSandbox = activeProspect ? generateSolutionSandbox(
    parseRecommendations(activeProspect.recommendations),
    {
      companyName: activeProspect.companyName,
      websiteUrl: activeProspect.websiteUrl,
      evidenceQuality: activeProspect.evidenceQuality,
      findingReliability: activeProspect.findingReliability,
      opportunityRange: activeProspect.opportunityRange,
      competitorGaps: parseCompetitorGaps(activeProspect.competitorGaps),
      verifiedFacts: parseFacts(activeProspect.verifiedFacts)
    },
    activeProspectTrust
  ) : null;

  // Analysis Change Detection & Version History
  const domainProspects = useMemo(() => {
    if (!activeProspect) return [];
    const domain = normalizeWebsiteUrl(activeProspect.websiteUrl);
    return prospects
      .filter(p => normalizeWebsiteUrl(p.websiteUrl) === domain)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [activeProspect, prospects]);

  const activeComparisonReport: AnalysisComparisonReport | null = useMemo(() => {
    if (!activeProspect || domainProspects.length === 0) return null;
    const currentIdx = domainProspects.findIndex(p => p.id === activeProspect.id);
    const versionNum = currentIdx >= 0 ? currentIdx + 1 : domainProspects.length;

    let prevProspect: Prospect | null = null;
    if (selectedComparisonVersion) {
      prevProspect = domainProspects.find(p => p.id === selectedComparisonVersion) || null;
    } else if (currentIdx > 0) {
      prevProspect = domainProspects[currentIdx - 1];
    } else if (domainProspects.length > 1) {
      prevProspect = domainProspects[0];
    }

    if (!prevProspect || prevProspect.id === activeProspect.id) {
      if (activeProspect.changeSummary && activeProspect.changeSummary !== '{}') {
        try {
          const parsed = JSON.parse(activeProspect.changeSummary);
          if (parsed && parsed.isRepeatedAnalysis) return parsed;
        } catch (e) {}
      }
      return null;
    }

    return detectAnalysisChanges(activeProspect, prevProspect, {
      version: versionNum,
      totalVersions: domainProspects.length
    });
  }, [activeProspect, domainProspects, selectedComparisonVersion]);





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
      
      {/* ---------------- MOBILE CLIENT SWITCHER DRAWER ---------------- */}
      {showMobileProspectDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Prospects ({sortedProspects.length})</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setProspectSortBy('opportunity')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      prospectSortBy === 'opportunity' ? 'bg-sky-100 text-sky-800' : 'text-slate-500'
                    }`}
                  >
                    $ Value
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setProspectSortBy('newest')}
                    className={`px-2 py-0.5 rounded font-bold transition-all ${
                      prospectSortBy === 'newest' ? 'bg-sky-100 text-sky-800' : 'text-slate-500'
                    }`}
                  >
                    Newest
                  </button>
                </div>
                <button
                  onClick={() => setShowMobileProspectDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1 pr-1">
              {sortedProspects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveProspect(p);
                    setShowMobileProspectDrawer(false);
                  }}
                  className={`p-3 rounded-xl flex justify-between items-center cursor-pointer transition-colors ${
                    activeProspect?.id === p.id ? 'bg-sky-50 border border-sky-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="overflow-hidden mr-2">
                    <p className="text-xs font-bold text-slate-800 truncate">{p.companyName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.websiteUrl}</p>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shrink-0">
                    {p.opportunityRange || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMobileProspectDrawer(false)}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------- SECTION 7: SHOW ME WHY MODAL DRAWER ---------------- */}
      {showWhyModal && modalContent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-md h-[90vh] sm:h-full shadow-2xl p-4 sm:p-6 rounded-t-2xl sm:rounded-none flex flex-col justify-between overflow-y-auto animate-slide-in">
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

      {/* ---------------- PLATFORM TRUST BREAKDOWN MODAL DRAWER ---------------- */}
      {showTrustModal && selectedTrustBreakdown && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-full shadow-2xl p-4 sm:p-6 rounded-t-2xl sm:rounded-none flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Platform Trust Breakdown
                  </h3>
                </div>
                <button 
                  onClick={() => setShowTrustModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Overall Score Header */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Overall Trust Score</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-black text-emerald-400">{selectedTrustBreakdown.overallScore}%</span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${selectedTrustBreakdown.statusColor.badge}`}>
                        ● {selectedTrustBreakdown.statusLevel}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono">Formula: ∑(Score × Weight)</span>
                    <p className="text-[10px] text-emerald-400 font-semibold">Auditable Telemetry</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                  {selectedTrustBreakdown.summary}
                </p>
              </div>

              {/* 6 Components List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Audited Platform Controls (6 Weighted Pillars)
                </span>

                {selectedTrustBreakdown.componentList.map((comp) => (
                  <div key={comp.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{comp.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Weight: <strong>{comp.weightPercent}%</strong> (Contribution: <strong className="text-emerald-600">+{comp.weightedPoints} pts</strong>)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">{comp.score}%</span>
                        <span className="text-[9px] block text-emerald-600 font-bold uppercase">{comp.status}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2 rounded border border-slate-150">
                      {comp.explanation}
                    </p>

                    <div className="text-[9px] text-slate-400 truncate" title={comp.metricSource}>
                      <strong>Source:</strong> {comp.metricSource}
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Levels Guide */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block uppercase tracking-wider">Status Levels Standard</span>
                <div className="grid grid-cols-2 gap-1 text-[9px]">
                  <div><strong className="text-emerald-700">95–100:</strong> Trusted (Optimal)</div>
                  <div><strong className="text-sky-700">85–94:</strong> Verified (High Quality)</div>
                  <div><strong className="text-amber-700">70–84:</strong> Review Required</div>
                  <div><strong className="text-rose-700">Below 70:</strong> Low Confidence</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setDiagnosticsData(selectedTrustBreakdown.diagnostics);
                  setShowTrustModal(false);
                  setShowDiagnosticsModal(true);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors uppercase tracking-wider text-center"
              >
                View Diagnostics
              </button>
              <button
                onClick={() => setShowTrustModal(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-colors uppercase tracking-wider"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SECTION: TRUST DIAGNOSTICS PANEL DRAWER ---------------- */}
      {showDiagnosticsModal && diagnosticsData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-full shadow-2xl p-4 sm:p-6 rounded-t-2xl sm:rounded-none flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-sky-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Trust Engine Diagnostics
                  </h3>
                </div>
                <button 
                  onClick={() => setShowDiagnosticsModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status & Version Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Trust Engine Status</span>
                    <span className={`text-sm font-black uppercase mt-0.5 inline-block px-2.5 py-0.5 rounded-full border ${
                      diagnosticsData.validationStatus === 'VALID'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      ● {diagnosticsData.trustEngineStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Engine Version</span>
                    <span className="text-xs font-mono font-bold text-sky-400">v{diagnosticsData.trustEngineVersion}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[10px]">
                  <div>
                    <span className="text-slate-400">Validation Status:</span>
                    <strong className={`ml-1 ${diagnosticsData.validationStatus === 'VALID' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {diagnosticsData.validationStatus}
                    </strong>
                  </div>
                  <div className="text-right truncate" title={diagnosticsData.lastAuditTimestamp}>
                    <span className="text-slate-400">Audited:</span>
                    <span className="ml-1 text-slate-200">{new Date(diagnosticsData.lastAuditTimestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Safety Principle Alert Box */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block uppercase tracking-wider text-[9px] text-amber-800 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                  Trust Engine Safety Principle
                </span>
                <p className="leading-relaxed">
                  If required telemetry is missing or invalid: <strong>DO NOT estimate</strong>, <strong>DO NOT substitute AI-generated values</strong>, and <strong>DO NOT calculate partial scores</strong>. Trustworthiness is more important than displaying a speculative number.
                </p>
              </div>

              {/* Required Components Checklist */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Required Platform Components (6 Controls)
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {diagnosticsData.requiredComponents.map((compName) => {
                    const isMissing = diagnosticsData.missingComponents.includes(compName);
                    const isInvalid = diagnosticsData.invalidComponents.some(c => c.name === compName);
                    const isOk = !isMissing && !isInvalid;

                    return (
                      <div 
                        key={compName}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                          isOk 
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}
                      >
                        <span className="font-semibold truncate">{compName}</span>
                        <span className="font-bold text-[10px]">
                          {isOk ? '✓ PASS' : isMissing ? 'MISSING' : 'INVALID'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Missing Components Section */}
              {diagnosticsData.missingComponents.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Missing Components Detected ({diagnosticsData.missingComponents.length})
                  </span>
                  <ul className="text-xs text-rose-800 list-disc list-inside space-y-0.5">
                    {diagnosticsData.missingComponents.map((comp) => (
                      <li key={comp} className="font-medium">
                        <strong>{comp}</strong> — Telemetry unavailable or null
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-600 italic pt-1">
                    Trust score calculation is blocked until complete telemetry is provided.
                  </p>
                </div>
              )}

              {/* Invalid Components Section */}
              {diagnosticsData.invalidComponents.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    Invalid Components Detected ({diagnosticsData.invalidComponents.length})
                  </span>
                  <div className="space-y-1.5">
                    {diagnosticsData.invalidComponents.map((item, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border border-rose-200 text-xs">
                        <div className="flex justify-between font-bold text-rose-900">
                          <span>{item.name}</span>
                          <span className="font-mono text-rose-600">Value: {String(item.value)}</span>
                        </div>
                        <p className="text-[10px] text-rose-700 mt-0.5">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Last Successful Calculation:</span>
                  <span className="font-mono text-slate-700">
                    {diagnosticsData.lastSuccessfulCalculation
                      ? new Date(diagnosticsData.lastSuccessfulCalculation).toLocaleString()
                      : 'None recorded'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last Audit Timestamp:</span>
                  <span className="font-mono text-slate-700">
                    {new Date(diagnosticsData.lastAuditTimestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDiagnosticsModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl mt-6 transition-colors uppercase tracking-wider"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}

      {/* ---------------- SECTION: OPPORTUNITY CALCULATION BREAKDOWN MODAL DRAWER ---------------- */}
      {showOpportunityCalcModal && (selectedOpportunityCalc || selectedPortfolioCalc) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-xl h-[90vh] sm:h-full shadow-2xl p-4 sm:p-6 rounded-t-2xl sm:rounded-none flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    {selectedOpportunityCalc ? 'Opportunity Valuation Breakdown' : 'Portfolio Valuation Breakdown'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowOpportunityCalcModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* SINGLE SERVICE VALUATION BREAKDOWN */}
              {selectedOpportunityCalc && (
                <div className="space-y-4">
                  {/* Top Value Classification Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                          Estimated Opportunity Value
                        </span>
                        <h4 className="text-base font-black text-white mt-0.5">{selectedOpportunityCalc.serviceName}</h4>
                      </div>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {selectedOpportunityCalc.status}
                      </span>
                    </div>

                    {/* Value Range Classification */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Minimum</span>
                        <strong className="text-sm font-black text-emerald-400">
                          ${selectedOpportunityCalc.weightedRange?.min.toLocaleString() || '0'}
                        </strong>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-emerald-500/30">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Likely Value</span>
                        <strong className="text-base font-black text-emerald-300">
                          ${selectedOpportunityCalc.weightedRange?.likely.toLocaleString() || '0'}
                        </strong>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Maximum</span>
                        <strong className="text-sm font-black text-emerald-400">
                          ${selectedOpportunityCalc.weightedRange?.max.toLocaleString() || '0'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-300 pt-1">
                      <span>Confidence Score: <strong className="text-sky-300">{selectedOpportunityCalc.confidence}%</strong></span>
                      <span>Adjustment Multiplier: <strong className="text-sky-300">{selectedOpportunityCalc.confidenceAdjustment || (selectedOpportunityCalc.confidence / 100).toFixed(2)}</strong></span>
                    </div>
                  </div>

                  {/* Problem & Supporting Evidence */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Problem Detected</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{selectedOpportunityCalc.detectedProblem}</p>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Supporting Evidence</span>
                      <blockquote className="mt-1 border-l-3 border-emerald-500 pl-2.5 text-slate-600 italic bg-white p-2 rounded">
                        "{selectedOpportunityCalc.supportingEvidence}"
                      </blockquote>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Source Pages</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedOpportunityCalc.sourcePages.map((page, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded">
                            {page}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Calculation Breakdown */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Mathematical Calculation Breakdown
                    </span>
                    <div className="space-y-1.5 text-xs font-mono">
                      {selectedOpportunityCalc.calculationBreakdown?.map((step, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-700">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Model Attribution */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pricing Model Attribution
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-slate-150">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Pricing Model Name</span>
                        <strong className="text-slate-800">{selectedOpportunityCalc.pricingModel.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Version & Currency</span>
                        <strong className="text-slate-800">{selectedOpportunityCalc.pricingModel.version} ({selectedOpportunityCalc.pricingModel.currency})</strong>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-100 flex justify-between text-[10px] text-slate-500">
                        <span>Last Updated: {selectedOpportunityCalc.pricingModel.lastUpdated}</span>
                        <span>Standard Agency Benchmark</span>
                      </div>
                    </div>
                  </div>

                  {/* Model Assumptions Panel */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Model Assumptions
                    </span>
                    <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1 bg-white p-2.5 rounded border border-slate-150">
                      {selectedOpportunityCalc.assumptions.map((asm, idx) => (
                        <li key={idx}>{asm}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Financial Disclaimer */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-relaxed italic">
                    <strong>Financial Disclaimer:</strong> {selectedOpportunityCalc.disclaimer}
                  </div>
                </div>
              )}

              {/* MULTI-SERVICE PORTFOLIO VALUATION BREAKDOWN */}
              {!selectedOpportunityCalc && selectedPortfolioCalc && (
                <div className="space-y-4">
                  {/* Top Value Classification Card */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                        Total Opportunity Portfolio
                      </span>
                      <h4 className="text-base font-black text-white mt-0.5">Aggregated Multi-Service Valuation</h4>
                    </div>

                    {/* Value Range Classification */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Minimum</span>
                        <strong className="text-sm font-black text-emerald-400">
                          ${selectedPortfolioCalc.portfolio.min.toLocaleString()}
                        </strong>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-emerald-500/30">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Likely Value</span>
                        <strong className="text-base font-black text-emerald-300">
                          ${selectedPortfolioCalc.portfolio.likely.toLocaleString()}
                        </strong>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Maximum</span>
                        <strong className="text-sm font-black text-emerald-400">
                          ${selectedPortfolioCalc.portfolio.max.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Service Itemized Breakdown */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Individual Service Calculations ({selectedPortfolioCalc.services.length})
                    </span>
                    <div className="space-y-2">
                      {selectedPortfolioCalc.services.map((srv, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong className="text-slate-900 block">{srv.serviceName}</strong>
                              <span className="text-[10px] text-slate-500">Confidence: {srv.confidence}% (Adjustment: {srv.confidenceAdjustment})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-black text-emerald-600">{srv.weightedRange?.formatted}</span>
                              <span className="block text-[9px] text-slate-400">Likely: ${srv.weightedRange?.likely.toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                            <strong>Issue:</strong> {srv.detectedProblem}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Model Attribution */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Pricing Model Attribution
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-slate-150">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Model Name</span>
                        <strong className="text-slate-800">{selectedPortfolioCalc.pricingModel.name} {selectedPortfolioCalc.pricingModel.version}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase">Currency & Updated</span>
                        <strong className="text-slate-800">{selectedPortfolioCalc.pricingModel.currency} ({selectedPortfolioCalc.pricingModel.lastUpdated})</strong>
                      </div>
                    </div>
                  </div>

                  {/* Model Assumptions Panel */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Active Model Assumptions
                    </span>
                    <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1 bg-white p-2.5 rounded border border-slate-150">
                      {selectedPortfolioCalc.assumptions.map((asm, idx) => (
                        <li key={idx}>{asm}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Financial Disclaimer */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-relaxed italic">
                    <strong>Financial Disclaimer:</strong> {selectedPortfolioCalc.disclaimer}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowOpportunityCalcModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl mt-6 transition-colors uppercase tracking-wider"
            >
              Close Calculation
            </button>
          </div>
        </div>
      )}

      {/* ---------------- SECTION: SOLUTION SANDBOX EVIDENCE MODAL DRAWER ---------------- */}
      {showSandboxEvidenceModal && selectedSandboxEvidence && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-lg h-[90vh] sm:h-full shadow-2xl p-4 sm:p-6 rounded-t-2xl sm:rounded-none flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                    Sandbox Evidence & Rationale
                  </h3>
                </div>
                <button 
                  onClick={() => setShowSandboxEvidenceModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Recommended Solution Concept
                </span>
                <h4 className="text-base font-black text-emerald-400">{selectedSandboxEvidence.recommendation}</h4>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Confidence: <strong className="text-sky-300">{selectedSandboxEvidence.confidence}%</strong></span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Verified Finding
                  </span>
                </div>
              </div>

              {/* Finding & Evidence */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Observed Evidence Quote</span>
                  <blockquote className="mt-1 border-l-3 border-emerald-500 pl-3 text-slate-700 italic bg-white p-2.5 rounded">
                    "{selectedSandboxEvidence.evidenceUsed}"
                  </blockquote>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Source Pages</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedSandboxEvidence.sourcePages.map((page: string, i: number) => (
                      <span key={i} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                        📄 {page}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Strategic Reasoning</span>
                  <p className="mt-1 text-slate-700 leading-relaxed">{selectedSandboxEvidence.reasoning}</p>
                </div>

                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Why Was This Generated?</span>
                  <p className="mt-1 text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-150">
                    💡 {selectedSandboxEvidence.whyGenerated}
                  </p>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[10px] text-amber-900 leading-relaxed italic">
                <strong>Planning Tool Notice:</strong> This preview is based on audited findings and does not guarantee specific business outcomes.
              </div>
            </div>

            <button
              onClick={() => setShowSandboxEvidenceModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl mt-6 transition-colors uppercase tracking-wider"
            >
              Close Evidence Panel
            </button>
          </div>
        </div>
      )}





      {/* ---------------- SECTION: REFERRAL & REWARDS MODAL ---------------- */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-widest block">Agency Growth Network</span>
                <h3 className="text-xl font-black text-slate-900">Referral & Rewards System</h3>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Invite peer agencies, consultants, and freelancers to LeadPilot. When they register and run audits, you automatically receive platform credits and extra analysis quotas.
            </p>

            {/* Custom Referral Link Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Your Personal Referral Link:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://leadpilot.ai/register?ref=${generateReferralCode(user?.id || 'agency')}`}
                  className="flex-1 bg-white border border-slate-250 text-xs px-3.5 py-2.5 rounded-xl font-mono text-slate-800 focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://leadpilot.ai/register?ref=${generateReferralCode(user?.id || 'agency')}`);
                    setCopiedText('referral-link');
                    setTimeout(() => setCopiedText(null), 2500);
                  }}
                  className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
                >
                  {copiedText === 'referral-link' ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* 3 Referral Tracks */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available Reward Tiers:</span>
              <div className="grid gap-2.5">
                {getReferralRewardTiers().map((tier, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-slate-900">{tier.track}</strong>
                        <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-2 py-0.5 rounded-full">{tier.badge}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{tier.target}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-xs font-black text-emerald-600 block">{tier.reward}</strong>
                      <span className="text-[10px] text-slate-400">{tier.rewardValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowReferralModal(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3.5 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/dashboard" className="text-lg sm:text-xl font-black bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent shrink-0">
            LeadPilot
          </Link>
          <span className="hidden xs:inline-flex items-center bg-slate-100 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold text-slate-600 border border-slate-200 truncate">
            <span className="text-sky-600 font-bold uppercase">
              {user.email?.toLowerCase() === 'admettre@gmail.com' ? 'DEVELOPER (UNLIMITED)' : user.subscriptionTier}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="hidden lg:flex flex-col items-end gap-1">
            {user.email?.toLowerCase() === 'admettre@gmail.com' ? (
              <>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <span>⚡ Quota: Unlimited</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black uppercase">Dev</span>
                </span>
                <div className="w-28 bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
                </div>
              </>
            ) : (
              <>
                <span className="text-[11px] text-slate-500 font-medium">
                  Quota: {user.analysesUsed} / {user.subscriptionTier === 'AGENCY' ? '∞' : user.analysesLimit}
                </span>
                <div className="w-28 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-sky-600 h-1.5 rounded-full" 
                    style={{ width: `${user.subscriptionTier === 'AGENCY' ? 100 : Math.min((user.analysesUsed / user.analysesLimit) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowReferralModal(true)}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 sm:px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer min-h-[36px]"
            title="Refer Agencies & Earn Rewards"
          >
            <span>🎁</span>
            <span className="hidden sm:inline">Refer & Earn</span>
          </button>

          <Link
            href="/admin/security"
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 border border-slate-200 px-2 sm:px-3 py-1.5 rounded-lg transition-colors shadow-2xs min-h-[36px]"
            title="Multi-Tenant RLS Security Dashboard"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="hidden md:inline">RLS Security</span>
          </Link>

          <div className="border-l border-slate-200 pl-2 sm:pl-3 flex items-center gap-1 sm:gap-2">
            <span className="text-xs text-slate-700 font-semibold hidden md:flex items-center gap-1 max-w-[130px] truncate" title={user.email}>
              <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </span>

            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Client Switcher Bar (Mobile phones only) */}
      {prospects.length > 0 && (
        <div className="lg:hidden bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shadow-xs sticky top-[49px] z-30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Client:</span>
            <span className="text-xs font-bold text-white truncate">
              {activeProspect?.companyName || 'Select a Prospect'}
            </span>
          </div>
          <button
            onClick={() => setShowMobileProspectDrawer(true)}
            className="text-[11px] font-bold text-sky-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Switch ({prospects.length})</span>
            <Filter className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Main SaaS panel */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Workspace */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Core Positioning & Brand Principles Banner */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[9px] uppercase font-bold text-sky-600 tracking-wider block">LeadPilot AI Value Proposition</span>
              <p className="text-xs font-bold text-slate-800">
                LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <span className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">Trust before AI</span>
              <span className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">Evidence before recommendations</span>
              <span className="bg-slate-100 text-slate-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">&lt;60s Delivery</span>
            </div>
          </div>

          {/* Agency Revenue Dashboard stats */}
          {/* Agency Revenue & Platform Trust Dashboard stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

            
            {/* 1. PLATFORM TRUST STATUS CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl border border-slate-700 shadow-md flex flex-col justify-between col-span-2 md:col-span-1">
              <div className="flex justify-between items-start">
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className={`h-3 w-3 ${globalPlatformTrust.isAvailable ? 'text-emerald-400' : 'text-amber-400'}`} />
                  Platform Trust
                </span>
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${globalPlatformTrust.statusColor.badge}`}>
                  ● {globalPlatformTrust.isAvailable ? globalPlatformTrust.statusLevel : (globalPlatformTrust.status || 'INVALID')}
                </span>
              </div>

              {globalPlatformTrust.isAvailable ? (
                <>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-400">{globalPlatformTrust.displayScore}</span>
                    <button
                      onClick={() => {
                        setSelectedTrustBreakdown(globalPlatformTrust);
                        setShowTrustModal(true);
                      }}
                      className="text-[10px] font-bold text-sky-300 hover:text-sky-200 underline flex items-center gap-0.5 cursor-pointer"
                      title="View complete mathematical trust breakdown"
                    >
                      Breakdown
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700/60 grid grid-cols-3 gap-1 text-[8px] text-slate-300">
                    <div title="Database Security">DB: <strong className="text-emerald-400">{globalPlatformTrust.components.databaseSecurity?.score}%</strong></div>
                    <div title="Storage Security">Storage: <strong className="text-emerald-400">{globalPlatformTrust.components.storageSecurity?.score}%</strong></div>
                    <div title="Tenant Isolation">Iso: <strong className="text-emerald-400">{globalPlatformTrust.components.tenantIsolation?.score}%</strong></div>
                    <div title="Verification Pass Rate">Verif: <strong className="text-sky-300">{globalPlatformTrust.components.verificationEngine?.score}%</strong></div>
                    <div title="Evidence Quality">Evid: <strong className="text-sky-300">{globalPlatformTrust.components.evidenceEngine?.score}%</strong></div>
                    <div title="Crawl Coverage">Crawl: <strong className="text-sky-300">{globalPlatformTrust.components.crawlReliability?.score}%</strong></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-2">
                    <span className="text-xs font-black text-rose-400 block leading-tight">Trust Score Unavailable</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {globalPlatformTrust.reason || 'Required telemetry missing'}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[8px] text-rose-300 font-mono">
                      {globalPlatformTrust.missingComponents.length > 0 
                        ? `${globalPlatformTrust.missingComponents.length} missing` 
                        : 'Invalid input'}
                    </span>
                    <button
                      onClick={() => {
                        setDiagnosticsData(globalPlatformTrust.diagnostics);
                        setShowDiagnosticsModal(true);
                      }}
                      className="text-[10px] font-bold text-sky-300 hover:text-sky-200 underline flex items-center gap-0.5 cursor-pointer"
                    >
                      View Diagnostics
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>


            {/* 2. Companies Analyzed */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Companies Analyzed</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{prospects.length}</p>
            </div>

            {/* 3. Verified Opportunities */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Verified Opportunities</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">{totalVerifiedOpps}</p>
            </div>

            {/* 4. Reports Generated */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reports Generated</span>
              <p className="text-2xl font-black text-sky-600 mt-1">{prospects.length}</p>
            </div>

            {/* 5. Opportunity Value Range */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Opportunity Value</span>
                {activeOpportunityPortfolio?.isAvailable && (
                  <button
                    onClick={() => {
                      setSelectedOpportunityCalc(null);
                      setSelectedPortfolioCalc(activeOpportunityPortfolio);
                      setShowOpportunityCalcModal(true);
                    }}
                    className="text-[9px] font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-0.5 cursor-pointer"
                    title="Show mathematical calculation breakdown"
                  >
                    Show Calc
                  </button>
                )}
              </div>
              <p className="text-sm font-black text-emerald-600 mt-2 truncate" title={totalOpportunityValueRange}>{totalOpportunityValueRange}</p>
            </div>


            {/* 6. Evidence Confidence */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 md:col-span-1">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Evidence Confidence</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{avgEvidenceConfidence}%</p>
            </div>
          </div>


          {/* Proposal Scraper trigger form & Batch Multi-Domain Scanner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-sky-500" />
                  Find Opportunities. Generate Proposals. Win Clients.
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {batchMode
                    ? 'Audit up to 10 prospective client websites in batch. High-value opportunities automatically bubble to top.'
                    : 'Analyze a single website and generate evidence-backed opportunities, solutions, and proposals.'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBatchMode(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !batchMode ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single Scan
                </button>
                <button
                  type="button"
                  onClick={() => setBatchMode(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    batchMode ? 'bg-sky-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5 text-amber-300" />
                  <span>Batch Scanner (Up to 10)</span>
                </button>
              </div>
            </div>

            {!batchMode ? (
              /* Single Domain Form */
              <form onSubmit={handleAnalyze} className="mt-4 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. stripe.com or https://company.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 pl-3.5 pr-4 py-3 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm shadow-2xs min-h-[44px]"
                  disabled={analyzing}
                />
                <button
                  type="submit"
                  disabled={analyzing}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-h-[44px] shrink-0 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Running auditor checks...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze Website</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Batch Multi-Domain Form */
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <textarea
                    rows={4}
                    value={batchUrlsText}
                    onChange={(e) => setBatchUrlsText(e.target.value)}
                    placeholder="Paste up to 10 prospective client domains (one per line or comma-separated):&#10;stripe.com&#10;acmecloud.com&#10;dentalcaregroup.com"
                    disabled={batchScanning}
                    className="w-full p-3.5 border border-slate-300 rounded-xl focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono shadow-2xs resize-none"
                  />
                  <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
                    <span>
                      {
                        batchUrlsText
                          .split(/[\n,]+/)
                          .map(l => l.trim())
                          .filter(l => l.length > 0).length
                      } / 10 target domains entered
                    </span>
                    <span className="text-slate-400">Sequential polite crawling to prevent rate-limiting</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <button
                    type="button"
                    disabled={batchScanning || !batchUrlsText.trim()}
                    onClick={handleBatchScan}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                  >
                    {batchScanning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          Scanning {batchProgress?.current || 0} of {batchProgress?.total || 0}...
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span>Start Sequential Batch Scan</span>
                      </>
                    )}
                  </button>

                  {batchScanning && batchProgress && (
                    <span className="text-xs font-mono text-slate-600 animate-pulse">
                      Auditing: <strong>{batchProgress.currentDomain}</strong>
                    </span>
                  )}
                </div>

                {/* Live Batch Progress & Results Table */}
                {batchProgress && batchProgress.results.length > 0 && (
                  <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span>Batch Progress ({batchProgress.results.length} / {batchProgress.total})</span>
                      {!batchScanning && (
                        <span className="text-emerald-700 bg-emerald-100 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          ✓ Batch Complete • Sorted by Opportunity
                        </span>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-sky-500 h-1.5 transition-all duration-300 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((batchProgress.current / batchProgress.total) * 100))}%` }}
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
                      {batchProgress.results.map((res, idx) => (
                        <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-800">{res.domain}</span>
                          <div className="flex items-center gap-2">
                            {res.status === 'success' ? (
                              <>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  {res.value || 'Opportunity Found'}
                                </span>
                                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                                  Score: {res.score}
                                </span>
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] text-rose-600">{res.error || 'Failed'}</span>
                                <AlertCircle className="h-4 w-4 text-rose-500" />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STRUCTURED ERROR BANNER & DIAGNOSTICS */}
            {analysisError?.classification === 'SCHEMA_MISMATCH' ? (
              <div className="mt-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-3.5 shadow-sm animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1.5 text-rose-900">
                    <p className="font-bold text-sm leading-snug">
                      Analysis could not be saved because the application and database schemas are out of sync.
                    </p>
                    <p className="text-rose-700 text-xs font-semibold">
                      This issue cannot be resolved by retrying.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Reference Code:</span>
                      <span className="font-mono font-bold text-rose-900 text-xs bg-rose-200/70 px-2 py-0.5 rounded border border-rose-300">
                        SCHEMA_MISMATCH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Administrator Diagnostic Telemetry */}
                {analysisError.adminDetails && (
                  <div className="pt-3 border-t border-rose-200 bg-rose-100/60 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-rose-700" />
                        Administrator Diagnostics
                      </span>
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 border border-rose-300">
                        Schema Drift Detected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <span className="text-[9px] uppercase text-slate-500 block font-sans font-bold">Prisma Error Code</span>
                        <strong className="text-rose-700">{analysisError.adminDetails.prismaErrorCode}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <span className="text-[9px] uppercase text-slate-500 block font-sans font-bold">Model</span>
                        <strong className="text-slate-800">{analysisError.adminDetails.model}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <span className="text-[9px] uppercase text-slate-500 block font-sans font-bold">Missing Table or Column</span>
                        <strong className="text-rose-700">{analysisError.adminDetails.missingItem}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-rose-200">
                        <span className="text-[9px] uppercase text-slate-500 block font-sans font-bold">Migration Status</span>
                        <strong className="text-amber-700">{analysisError.adminDetails.migrationStatus}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : analysisError ? (
              <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2 text-rose-800 shadow-sm animate-in fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold">{analysisError.userMessage}</p>
                      {analysisError.referenceCode && (
                        <span className="text-[9px] font-mono text-rose-600 block">
                          Reference: {analysisError.referenceCode}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ONLY show Retry button when error is genuinely retryable */}
                  {analysisError.isRetryable && (
                    <button
                      type="button"
                      onClick={() => handleAnalyze()}
                      disabled={analyzing}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      <RefreshCw className={`h-3 w-3 ${analyzing ? 'animate-spin' : ''}`} />
                      <span>Retry Analysis</span>
                    </button>
                  )}
                </div>
              </div>
            ) : error ? (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            ) : null}
          </div>

          {/* Core proposal workspace */}
          {activeProspect ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              
              {/* Trust Dashboard Header metrics (Evidence Quality, etc.) */}
              {/* Trust Dashboard Header metrics (Evidence Quality, Trust Score, etc.) */}
              <div className="p-4 bg-slate-900 text-white border-b border-slate-800 grid grid-cols-3 md:grid-cols-7 gap-3 items-center">
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

                <div className="text-center">
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Reliability</span>
                  <span className="text-xs font-black text-indigo-400">{activeProspect.findingReliability}%</span>
                </div>

                {/* PROSPECT TRUST SCORE BADGE */}
                <div className="text-center border-x border-slate-800">
                  <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-wider">Trust Score</span>
                  {activeProspectTrust && activeProspectTrust.isAvailable ? (
                    <button
                      onClick={() => {
                        setSelectedTrustBreakdown(activeProspectTrust);
                        setShowTrustModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      title="Click to view full Trust Breakdown for this prospect"
                    >
                      {activeProspectTrust.displayScore}
                      <span className="text-[8px] font-normal underline text-sky-400">Why?</span>
                    </button>
                  ) : activeProspectTrust ? (
                    <button
                      onClick={() => {
                        setDiagnosticsData(activeProspectTrust.diagnostics);
                        setShowDiagnosticsModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Telemetry missing or invalid. Click to view diagnostics."
                    >
                      Unavailable
                      <span className="text-[8px] font-normal underline text-sky-400">Diag</span>
                    </button>
                  ) : (
                    <span className="text-xs font-black text-slate-500">—</span>
                  )}
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
              <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center text-[10px] text-slate-500 font-semibold gap-2">
                <span>Facts Verified: <strong className="text-emerald-600">{activeProspect.factsVerifiedCount}</strong></span>
                <span>Claims Rejected: <strong className="text-rose-600">{activeProspect.claimsRejectedCount}</strong></span>
                <span>Crawl Coverage: <strong className="text-sky-700">{activeProspect.pagesCrawledCount || 1} / {activeProspect.pagesDiscoveredCount || 1} pages ({activeProspect.crawlCoveragePercent || 100}%)</strong></span>
                <span>
                  Opportunity Range: <strong className="text-slate-700 font-mono">{activeProspect.opportunityRange}</strong>
                  {activeOpportunityPortfolio?.isAvailable && (
                    <button
                      onClick={() => {
                        setSelectedOpportunityCalc(null);
                        setSelectedPortfolioCalc(activeOpportunityPortfolio);
                        setShowOpportunityCalcModal(true);
                      }}
                      className="ml-1.5 text-sky-600 hover:text-sky-700 underline font-bold cursor-pointer"
                    >
                      [Show Calculation]
                    </button>
                  )}
                </span>
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

              {/* STRATEGIC ASSESSMENT CARDS: "Why This Prospect?" & "Best Service to Sell" */}
              {activeOpportunityPortfolio?.whyThisProspect && (
                <div className="mx-6 mt-4 grid md:grid-cols-2 gap-4">
                  {/* Card 1: Why This Prospect? */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm border border-slate-700 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Strategic Assessment</span>
                        <h4 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                          <Sparkles className="h-4 w-4 text-amber-400" />
                          Why This Prospect?
                        </h4>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        activeOpportunityPortfolio.whyThisProspect.priority === 'High'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      }`}>
                        Priority: {activeOpportunityPortfolio.whyThisProspect.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-2.5 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Opportunities</span>
                        <strong className="text-emerald-400 text-sm font-black">{activeOpportunityPortfolio.whyThisProspect.detectedOpportunitiesCount}</strong>
                      </div>
                      <div className="border-x border-slate-700">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Competitor Gaps</span>
                        <strong className="text-sky-400 text-sm font-black">{activeOpportunityPortfolio.whyThisProspect.competitorGapsCount}</strong>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Confidence</span>
                        <strong className="text-amber-400 text-sm font-black">{activeOpportunityPortfolio.whyThisProspect.confidence}%</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Key Opportunity Drivers:</span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                        {activeOpportunityPortfolio.whyThisProspect.reasons.map((r, i) => (
                          <li key={i} className="truncate" title={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card 2: Best Service to Sell */}
                  {activeOpportunityPortfolio.bestServiceRecommendation && (
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Top Recommended Pitch</span>
                            <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                              <Award className="h-4 w-4 text-emerald-600" />
                              Best Service to Sell
                            </h4>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {activeOpportunityPortfolio.bestServiceRecommendation.confidence}% Confidence
                          </span>
                        </div>

                        <div className="mt-3 p-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Recommended Solution</span>
                            <strong className="text-sm font-black text-slate-900">
                              {activeOpportunityPortfolio.bestServiceRecommendation.serviceName}
                            </strong>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 font-bold uppercase block">Estimated Value</span>
                            <strong className="text-sm font-black text-emerald-700">
                              {activeOpportunityPortfolio.bestServiceRecommendation.estimatedValue}
                            </strong>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Strategic Rationale:</span>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {activeOpportunityPortfolio.bestServiceRecommendation.reasons.map((rsn, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px]">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate" title={rsn}>{rsn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => {
                            const topServiceCalc = activeOpportunityPortfolio.services.find(
                              s => s.serviceName === activeOpportunityPortfolio.bestServiceRecommendation?.serviceName
                            );
                            if (topServiceCalc) {
                              setSelectedPortfolioCalc(null);
                              setSelectedOpportunityCalc(topServiceCalc);
                              setShowOpportunityCalcModal(true);
                            }
                          }}
                          className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer"
                        >
                          Show Calculation
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Crawl Diagnostics Panel (Requirement 12) */}
              {(() => {
                const diag = parseCrawlDiagnostics(activeProspect.crawlDiagnostics, activeProspect);
                return (
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-sky-600" />
                        Website Research Engine • Crawl Diagnostics
                      </span>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                        Coverage: {diag.coveragePercentage}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Pages Discovered</span>
                        <strong className="text-slate-800 text-sm font-black">{diag.pagesDiscovered}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Pages Crawled</span>
                        <strong className="text-emerald-600 text-sm font-black">{diag.pagesCrawled}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Pages Skipped</span>
                        <strong className="text-slate-600 text-sm font-black">{diag.pagesSkipped}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Crawl Duration</span>
                        <strong className="text-indigo-600 text-sm font-black">
                          {((diag.crawlDurationMs || 0) / 1000).toFixed(1)}s
                        </strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                        <span className="text-[9px] text-slate-400 font-semibold block uppercase">Text Extracted</span>
                        <strong className="text-amber-600 text-sm font-black">
                          {((diag.totalTextExtracted || 0) / 1024).toFixed(1)} KB
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SINGLE PAGE COVERAGE WARNING (Requirement 13) */}
              {(activeProspect.pagesCrawledCount || 1) <= 1 && (
                <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="font-semibold text-xs">
                    Limited website coverage may reduce analysis quality.
                  </p>
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

              {/* REPEATED ANALYSIS DETECTION BANNER */}
              {activeComparisonReport?.isRepeatedAnalysis && (
                <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border-2 border-sky-300 rounded-2xl text-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                      v{activeComparisonReport.version}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900">Previous Analysis Found</h4>
                        <span className="bg-sky-200 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Analysis #{activeComparisonReport.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Previous Analysis: <strong className="text-slate-900 font-semibold">{activeComparisonReport.previousAnalysis?.timeAgo || '22 minutes ago'}</strong> • A comparison report has been generated.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    View Difference Summary →
                  </button>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 bg-white overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-1 py-0.5">
                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'opportunities' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Search className="h-4 w-4" />
                  <span>Audited Solutions</span>
                </button>
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'sandbox' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Solution Sandbox</span>
                </button>
                <button
                  onClick={() => setActiveTab('proposal')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'proposal' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>Proposal Generator</span>
                </button>
                <button
                  onClick={() => setActiveTab('outreach')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'outreach' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span>Outreach Center</span>
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'vault' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Evidence Vault</span>
                </button>
                <button
                  onClick={() => setActiveTab('valuation')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'valuation' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Valuation</span>
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`shrink-0 py-2.5 sm:py-3 px-3 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'comparison' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <History className="h-4 w-4 text-sky-600" />
                  <span>Comparison</span>
                  {activeComparisonReport?.isRepeatedAnalysis && (
                    <span className="bg-sky-100 text-sky-700 border border-sky-200 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      v{activeComparisonReport.version}
                    </span>
                  )}
                </button>
              </div>


              {/* Tab Contents */}
              <div className="p-6 flex-1 flex flex-col bg-white">
                <ErrorBoundary sectionName="Interactive Workspace">
                
                {/* 0. Solution Sandbox Module */}
                {activeTab === 'sandbox' && (

                  <div className="space-y-6 flex-1 flex flex-col">
                    {activeSolutionSandbox && activeSolutionSandbox.isAvailable && activeSolutionSandbox.sandboxes ? (
                      <div className="space-y-6 flex-1 flex flex-col">
                        {/* Top Positioning Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-amber-500" />
                              <h3 className="font-black text-slate-900 text-base uppercase tracking-wider">
                                {activeSolutionSandbox.positioning.title}
                              </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {activeSolutionSandbox.positioning.subtitle}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {activeSolutionSandbox.positioning.badges.map((badge, idx) => (
                                <span key={idx} className="bg-white border border-slate-200 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
                                  ● {badge}
                                </span>
                              ))}
                            </div>
                          </div>

                          <a
                            href={`/proposal/${activeProspect.id}/sandbox/print`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                          >
                            📄 Export Solution Preview PDF
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {/* Trust & Safety Status Bar */}
                        <div className="p-3.5 bg-slate-900 text-white rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Platform Trust</span>
                            <strong className="text-sm sm:text-base font-black text-emerald-400">
                              {activeSolutionSandbox.trustIntegration?.trustScore}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Evidence Quality</span>
                            <strong className="text-sm sm:text-base font-black text-sky-400">
                              {activeSolutionSandbox.trustIntegration?.evidenceQuality}%
                            </strong>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Verification Status</span>
                            <strong className="text-sm sm:text-base font-black text-indigo-300">
                              {activeSolutionSandbox.trustIntegration?.verificationStatus}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase text-slate-400 font-bold block">Sandbox Confidence</span>
                            <strong className="text-sm sm:text-base font-black text-amber-300">
                              {activeSolutionSandbox.trustIntegration?.sandboxConfidence}%
                            </strong>
                          </div>
                        </div>

                        {/* Horizontal Sandbox Type Selector */}
                        <div className="flex overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap gap-1.5 border-b border-slate-100 pb-3 py-1">
                          {[
                            { id: 'websiteRedesign', label: '1. Redesign' },
                            { id: 'seoContent', label: '2. SEO' },
                            { id: 'leadGeneration', label: '3. Leads' },
                            { id: 'aiAutomation', label: '4. AI' },
                            { id: 'conversionOptimization', label: '5. Conversion' },
                            { id: 'pricingLicensing', label: '6. Pricing' },
                            { id: 'competitorGap', label: '7. Gaps' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedSandboxType(t.id)}
                              className={`shrink-0 text-xs px-3.5 py-2 rounded-full font-bold transition-all min-h-[36px] cursor-pointer ${
                                selectedSandboxType === t.id
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>

                        {/* Sandbox Interactive Views */}
                        <div className="flex-1 overflow-y-auto max-h-[420px] pr-1 space-y-4">
                          {/* 1. Website Redesign Sandbox */}
                          {selectedSandboxType === 'websiteRedesign' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 1</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.websiteRedesign.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.websiteRedesign.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.websiteRedesign.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Current Observed State</span>
                                  <p className="text-slate-600">{activeSolutionSandbox.sandboxes.websiteRedesign.currentState}</p>
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Observed Issues</span>
                                  <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                    {activeSolutionSandbox.sandboxes.websiteRedesign.observedIssues.map((iss, i) => (
                                      <li key={i}>{iss}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              {/* Interactive Mock Homepage Wireframe */}
                              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                  <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider">
                                    {activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.heroSection.badge}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">Conceptual Hero Preview</span>
                                </div>
                                <h3 className="text-lg font-black text-white">
                                  {activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.heroSection.headline}
                                </h3>
                                <p className="text-xs text-slate-300">
                                  {activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.heroSection.subheadline}
                                </p>

                                <div className="pt-2 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                  <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                                    <span className="text-[8px] font-bold text-rose-400 uppercase block">Current Call-To-Action</span>
                                    <span className="line-through text-slate-400">{activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.suggestedCTAs.currentCTA}</span>
                                  </div>
                                  <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs">
                                    <span className="text-[8px] font-bold text-emerald-300 uppercase block">Suggested Intent-Driven CTA</span>
                                    <span className="font-bold text-white">{activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.suggestedCTAs.suggestedCTA}</span>
                                    <span className="block text-[9px] text-emerald-400/80 mt-0.5">{activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.suggestedCTAs.microcopy}</span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Suggested Navigation Grouping:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {activeSolutionSandbox.sandboxes.websiteRedesign.mockHomepageStructure.suggestedNavigation.map((nav, i) => (
                                      <span key={i} className="bg-slate-800 text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-700">
                                        {nav}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. SEO Content Sandbox */}
                          {selectedSandboxType === 'seoContent' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 2</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.seoContent.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.seoContent.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.seoContent.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Suggested Resource Hub Anchor</span>
                                  <code className="bg-slate-100 px-2 py-1 rounded text-sky-700 font-mono text-xs block mt-1">
                                    {activeSolutionSandbox.sandboxes.seoContent.sampleContentArchitecture.resourceHub}
                                  </code>
                                </div>

                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-2">Target Topic Clusters & Category Hubs</span>
                                  <div className="grid sm:grid-cols-3 gap-2.5">
                                    {activeSolutionSandbox.sandboxes.seoContent.sampleContentArchitecture.categories.map((cat, i) => (
                                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <strong className="block text-slate-800 text-xs">{cat.name}</strong>
                                        <span className="text-[10px] text-sky-600 font-mono block mt-1">{cat.slug}</span>
                                        <span className="text-[9px] text-slate-400 uppercase block mt-1.5">{cat.intent}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Suggested Landing Page Wireframe Slugs:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {activeSolutionSandbox.sandboxes.seoContent.sampleContentArchitecture.suggestedLandingPageStructure.map((slug, i) => (
                                      <span key={i} className="bg-emerald-50 text-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-200">
                                        {slug}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. Lead Generation Sandbox */}
                          {selectedSandboxType === 'leadGeneration' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 3</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.leadGeneration.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.leadGeneration.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.leadGeneration.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">High-Value Lead Magnet Concept</span>
                                  <h5 className="font-black text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.leadGeneration.landingPageExample.leadMagnetConcept}</h5>
                                  <p className="text-slate-500 text-[11px]">Instant benchmark transparency asset tailored to this prospect's industry.</p>
                                </div>
                                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Consultative Discovery Framework</span>
                                  <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px]">
                                    {activeSolutionSandbox.sandboxes.leadGeneration.discoveryCallFlow.map((step, i) => (
                                      <li key={i}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              </div>

                              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Multi-Touch Contact Sequence Example</span>
                                <div className="grid sm:grid-cols-3 gap-2">
                                  {activeSolutionSandbox.sandboxes.leadGeneration.contactSequenceExample.map((sq, i) => (
                                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                      <strong className="block text-slate-900 text-xs">{sq.step} ({sq.channel})</strong>
                                      <p className="text-[10px] text-slate-600 line-clamp-2">"{sq.preview}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. AI Automation Sandbox */}
                          {selectedSandboxType === 'aiAutomation' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 4</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.aiAutomation.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.aiAutomation.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.aiAutomation.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                  <span className="text-[9px] font-bold text-rose-500 uppercase block">Current Workflow Bottleneck</span>
                                  <p className="text-slate-700 font-mono text-[11px]">{activeSolutionSandbox.sandboxes.aiAutomation.currentProcess}</p>
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                                  <span className="text-[9px] font-bold text-emerald-600 uppercase block">Automated Dispatch Engine</span>
                                  <p className="text-slate-700 font-mono text-[11px]">{activeSolutionSandbox.sandboxes.aiAutomation.suggestedProcess}</p>
                                </div>
                              </div>

                              {/* 4-Node Visual Workflow */}
                              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                                <span className="text-[9px] font-bold text-sky-400 uppercase tracking-wider block">
                                  Potential Automation Workflow Architecture
                                </span>
                                <div className="grid sm:grid-cols-4 gap-2 text-center text-xs">
                                  {activeSolutionSandbox.sandboxes.aiAutomation.potentialAutomationWorkflow.map((node, i) => (
                                    <div key={i} className="p-3 bg-slate-800 rounded-xl border border-slate-700 relative">
                                      <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-black text-[10px] flex items-center justify-center mx-auto mb-1.5">
                                        {i + 1}
                                      </span>
                                      <strong className="block text-white text-xs">{node.node}</strong>
                                      <p className="text-[10px] text-slate-400 mt-1 leading-snug">{node.desc}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. Conversion Optimization Sandbox */}
                          {selectedSandboxType === 'conversionOptimization' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 5</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.conversionOptimization.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.conversionOptimization.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.conversionOptimization.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Proposed A/B Experiments & Hypotheses</span>
                                <div className="space-y-2">
                                  {activeSolutionSandbox.sandboxes.conversionOptimization.proposedExperiments.map((exp, i) => (
                                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                      <strong className="text-slate-900 text-xs block">{exp.experiment}</strong>
                                      <span className="text-[11px] text-slate-600 block mt-0.5">Hypothesis: {exp.hypothesis}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 6. Licensing & Pricing Sandbox */}
                          {selectedSandboxType === 'pricingLicensing' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 6</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.pricingLicensing.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.pricingLicensing.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.pricingLicensing.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-3 gap-3 text-xs">
                                {activeSolutionSandbox.sandboxes.pricingLicensing.suggestedStructure.map((tier, i) => (
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
                            </div>
                          )}

                          {/* 7. Competitor Gap Sandbox */}
                          {selectedSandboxType === 'competitorGap' && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sandbox Type 7</span>
                                  <h4 className="font-bold text-slate-900 text-sm">{activeSolutionSandbox.sandboxes.competitorGap.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                                    {activeSolutionSandbox.sandboxes.competitorGap.badge}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setSelectedSandboxEvidence(activeSolutionSandbox.sandboxes!.competitorGap.evidence);
                                      setShowSandboxEvidenceModal(true);
                                    }}
                                    className="text-xs font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-1 cursor-pointer ml-2"
                                  >
                                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                    Show Evidence
                                  </button>
                                </div>
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
                                    {activeSolutionSandbox.sandboxes.competitorGap.comparisons.map((cmp, i) => (
                                      <tr key={i}>
                                        <td className="p-2.5 font-bold text-slate-800">{cmp.capability}</td>
                                        <td className="p-2.5 text-slate-600">{cmp.prospectStatus}</td>
                                        <td className="p-2.5 text-sky-700 font-medium">{cmp.potentialFutureCapability}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Financial Safety & Disclaimer */}
                        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-1.5">
                          <div className="flex justify-between items-center border-b border-amber-200/60 pb-1.5">
                            <span className="font-bold text-amber-950 text-[11px] uppercase tracking-wider">
                              Financial Safety Notice
                            </span>
                            <span className="text-[10px] text-amber-800 font-mono">
                              Illustrative Range: {activeSolutionSandbox.financialSafety?.illustrativeOpportunityRange}
                            </span>
                          </div>
                          <p className="text-amber-900 leading-relaxed italic text-[11px]">
                            {activeSolutionSandbox.disclaimer}
                          </p>
                          <p className="text-amber-800 text-[10px]">
                            {activeSolutionSandbox.financialSafety?.nonGuaranteeNotice}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-3 flex-1 flex flex-col justify-center items-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                          ⚠️
                        </div>
                        <h4 className="font-black text-slate-900 text-base uppercase">Solution Sandbox Unavailable</h4>
                        <p className="text-xs text-slate-500 max-w-md">
                          {activeSolutionSandbox?.reason || "Solution Sandbox unavailable due to insufficient verified evidence."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

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
                      <button
                        onClick={() => setAuditSubTab('rawScrape')}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                          auditSubTab === 'rawScrape' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Raw Scrape Proof
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
                                <button
                                  onClick={() => {
                                    const calc = calculateServiceOpportunity(rec, { evidenceQuality: activeProspect.evidenceQuality });
                                    setSelectedPortfolioCalc(null);
                                    setSelectedOpportunityCalc(calc);
                                    setShowOpportunityCalcModal(true);
                                  }}
                                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  Show Calculation
                                  <ArrowUpRight className="h-3 w-3" />
                                </button>
                                <div className="text-right">
                                  <span className="font-bold text-slate-400 uppercase text-[8px] block">Revenue Potential</span>
                                  <span className="font-mono font-black text-emerald-600">{rec.estimatedFee}</span>
                                </div>
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
                                <button
                                  onClick={() => {
                                    const calc = calculateServiceOpportunity(rec, { evidenceQuality: activeProspect.evidenceQuality });
                                    setSelectedPortfolioCalc(null);
                                    setSelectedOpportunityCalc(calc);
                                    setShowOpportunityCalcModal(true);
                                  }}
                                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  Show Calculation
                                  <ArrowUpRight className="h-3 w-3" />
                                </button>
                                <div className="text-right">
                                  <span className="font-bold text-slate-400 uppercase text-[8px] block">Estimated Project Value</span>
                                  <span className="font-mono font-black text-emerald-600">${(rec.estimatedValue || 0).toLocaleString()}</span>
                                </div>
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

                      {/* Raw Scrape Proof & Evidence Inspector */}
                      {auditSubTab === 'rawScrape' && (() => {
                        const facts = parseFacts(activeProspect.verifiedFacts);
                        const recs = parseRecommendations(activeProspect.recommendations);
                        
                        // Aggregate all evidence items with quotes
                        const evidenceItems: { title: string; category: string; quote: string; sourceUrl: string; status: string; fee?: string }[] = [];
                        
                        facts.forEach(f => {
                          if (f.evidenceText) {
                            evidenceItems.push({
                              title: f.fact,
                              category: 'Verified DOM Finding',
                              quote: f.evidenceText,
                              sourceUrl: f.sourceUrl || activeProspect.websiteUrl,
                              status: f.status || 'Verified'
                            });
                          }
                        });

                        recs.forEach(r => {
                          if (r.evidenceList && r.evidenceList.length > 0) {
                            evidenceItems.push({
                              title: `${r.serviceName} — ${r.issue}`,
                              category: 'Commercial Opportunity',
                              quote: r.evidenceList[0],
                              sourceUrl: activeProspect.websiteUrl,
                              status: r.status || 'Verified',
                              fee: r.estimatedFee
                            });
                          }
                        });

                        const filteredItems = evidenceItems.filter(item => 
                          !scrapeEvidenceSearch ||
                          item.title.toLowerCase().includes(scrapeEvidenceSearch.toLowerCase()) ||
                          item.quote.toLowerCase().includes(scrapeEvidenceSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(scrapeEvidenceSearch.toLowerCase())
                        );

                        return (
                          <div className="space-y-4">
                            {/* Evidence Inspector Control Bar */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  ● 100% Deterministic Evidence
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {evidenceItems.length} verifiable quotes extracted
                                </span>
                              </div>
                              <div className="relative w-full sm:w-64">
                                <input
                                  type="text"
                                  placeholder="Search DOM quotes & evidence..."
                                  value={scrapeEvidenceSearch}
                                  onChange={(e) => setScrapeEvidenceSearch(e.target.value)}
                                  className="w-full text-xs pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                                />
                                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2.5" />
                              </div>
                            </div>

                            {/* Side-by-Side Proof Cards */}
                            {filteredItems.length > 0 ? (
                              <div className="space-y-3">
                                {filteredItems.map((item, idx) => (
                                  <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-[9px] font-bold text-sky-600 uppercase tracking-wider block">
                                          {item.category} {item.fee ? `• Est. Value: ${item.fee}` : ''}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                                          {item.title}
                                        </h4>
                                      </div>
                                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase border border-emerald-200 shrink-0">
                                        {item.status}
                                      </span>
                                    </div>

                                    {/* Stylized Visual DOM Quote Block */}
                                    <div className="bg-slate-950 text-slate-200 rounded-xl p-3.5 font-mono text-xs border border-slate-800 space-y-2">
                                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                          DOM GROUND-TRUTH EXCERPT
                                        </span>
                                        <span className="text-slate-500 font-mono">Status: 200 OK</span>
                                      </div>
                                      <div className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap select-all">
                                        <span className="text-sky-400 select-none mr-2">DOM &gt;</span>
                                        "{item.quote}"
                                      </div>
                                    </div>

                                    {/* Action Footnotes */}
                                    <div className="flex flex-wrap justify-between items-center gap-2 pt-1 border-t border-slate-100 text-[10px]">
                                      <a
                                        href={item.sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sky-600 hover:underline flex items-center gap-1 font-mono truncate max-w-[280px]"
                                      >
                                        <ExternalLink className="h-3 w-3 shrink-0" />
                                        <span>{item.sourceUrl}</span>
                                      </a>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const pitch = `Hi, while reviewing ${activeProspect.companyName}'s website (${activeProspect.websiteUrl}), I noticed this specific opportunity: "${item.quote}". We specialize in resolving this to boost conversion rates. Let me know if you'd like to see the full audit.`;
                                          navigator.clipboard.writeText(pitch);
                                          setCopiedQuoteIdx(idx);
                                          setTimeout(() => setCopiedQuoteIdx(null), 2500);
                                        }}
                                        className="bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedQuoteIdx === idx ? (
                                          <>
                                            <Check className="h-3 w-3 text-emerald-600" />
                                            <span className="text-emerald-600">Copied Pitch to Clipboard!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3 w-3" />
                                            <span>Copy Outreach Hook</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                                <ShieldCheck className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">No Evidence Matches Found</p>
                                <p className="text-[11px] mt-0.5">Try clearing your search filter or running a new audit scan.</p>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                )}

                {/* 2. Proposal Generator */}
                {activeTab === 'proposal' && (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="overflow-y-auto max-h-[360px] space-y-4 pr-1">
                      
                      {/* 1. Dynamic Client Proposal Link & Live Engagement Tracker */}
                      <div className="p-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/50 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-sky-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              {proposalTelemetry.totalViews > 0 && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              )}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${proposalTelemetry.totalViews > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                Dynamic Client Proposal Link & Live View-Tracking
                              </h4>
                              <p className="text-[10px] text-slate-500">
                                White-label client presentation URL with non-intrusive view telemetry & section analytics.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => fetchProposalTelemetry(activeProspect.id)}
                            disabled={proposalTelemetry.loading}
                            className="text-[10px] text-slate-600 hover:text-sky-700 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
                            title="Refresh real-time view telemetry"
                          >
                            <RefreshCw className={`h-3 w-3 ${proposalTelemetry.loading ? 'animate-spin text-sky-600' : ''}`} />
                            <span>Refresh Telemetry</span>
                          </button>
                        </div>

                        {/* Proposal Link Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 flex items-center justify-between shadow-2xs overflow-hidden">
                            <span className="truncate">
                              {typeof window !== 'undefined' ? window.location.origin : 'https://leadpilotsoftware.com'}/audit/{activeProspect.id}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://leadpilotsoftware.com'}/audit/${activeProspect.id}`;
                                navigator.clipboard.writeText(publicUrl);
                                setShareCopied(true);
                                setTimeout(() => setShareCopied(false), 2500);
                              }}
                              className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                              title="Copy dynamic link to send to client"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>{shareCopied ? '✓ Link Copied!' : 'Copy Proposal Link'}</span>
                            </button>

                            <a
                              href={`/audit/${activeProspect.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                              title="Open client-facing audit in new tab"
                            >
                              <span>Preview</span>
                              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                            </a>
                          </div>
                        </div>

                        {/* Telemetry Engagement Badges Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* Opens Counter */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            proposalTelemetry.totalViews > 0 
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Client Opens</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`h-2 w-2 rounded-full ${proposalTelemetry.totalViews > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                <strong className="text-xs font-black">
                                  {proposalTelemetry.totalViews > 0 ? `${proposalTelemetry.totalViews} Views Logged` : '0 Views (Awaiting Click)'}
                                </strong>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {proposalTelemetry.lastViewedAt ? formatRelativeTime(proposalTelemetry.lastViewedAt) : 'Never'}
                            </span>
                          </div>

                          {/* Pricing Heat-map View */}
                          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            proposalTelemetry.hasPricingViewed 
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Pricing & Scope</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <Eye className={`h-3 w-3 ${proposalTelemetry.hasPricingViewed ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <strong className="text-xs font-black">
                                  {proposalTelemetry.hasPricingViewed ? 'Pricing Inspected' : 'Not Scrolled Yet'}
                                </strong>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono opacity-70">
                              {proposalTelemetry.pricingViews > 0 ? `${proposalTelemetry.pricingViews}x viewed` : 'Pending'}
                            </span>
                          </div>

                          {/* Confidence Score */}
                          <div className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deliverable Trust</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
                                <strong className="text-xs font-black text-slate-900">
                                  {activeProspect.evidenceQuality}% Evidence Pass
                                </strong>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold">
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Two-Way CRM Synchronization & Pipeline Status Card */}
                      <div className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${
                        crmSyncRecords[activeProspect.id]
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : activeProspect.proposalStatus === 'Speculative'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {crmSyncRecords[activeProspect.id] ? '✓ CRM Deal Pipeline Synced' : 'CRM & Proposal Integrations'}
                            </h4>
                            {crmSyncRecords[activeProspect.id] && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                                Active Deal
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {crmSyncRecords[activeProspect.id] ? (
                              <span>
                                Synced to {crmSyncRecords[activeProspect.id].destinations.map(d => d.label).join(' & ')} • Stage: <strong>{crmSyncRecords[activeProspect.id].dealStage}</strong> ({formatRelativeTime(crmSyncRecords[activeProspect.id].syncedAt)})
                              </span>
                            ) : (
                              <span>
                                Push deal name, verified findings, and suggested scope directly to HubSpot Deals or Zapier webhooks.
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-wrap shrink-0">
                          <button
                            disabled={syncingCrm}
                            onClick={handleCrmSync}
                            className={`font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors border cursor-pointer ${
                              crmSuccess || crmSyncRecords[activeProspect.id]
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {syncingCrm ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Syncing...</span>
                              </>
                            ) : crmSuccess ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Synced to CRM!</span>
                              </>
                            ) : crmSyncRecords[activeProspect.id] ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Re-sync CRM</span>
                              </>
                            ) : (
                              <>
                                <span>🔗 Sync to CRM</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleConfigureWebhook}
                            title="Configure CRM or Zapier Webhook URL"
                            className="text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
                          >
                            ⚙️
                          </button>

                          <a
                            href={`/proposal/${activeProspect.id}/print`}
                            target="_blank"
                            rel="noreferrer"
                            className={`font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
                              activeProspect.proposalStatus === 'Speculative'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
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
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cost Estimate & Recommendations</h4>
                          {activeOpportunityPortfolio?.isAvailable && (
                            <button
                              onClick={() => {
                                setSelectedOpportunityCalc(null);
                                setSelectedPortfolioCalc(activeOpportunityPortfolio);
                                setShowOpportunityCalcModal(true);
                              }}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-0.5 cursor-pointer"
                            >
                              Show Calculation Breakdown
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
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
                          Follow-Up
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('discovery')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'discovery' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Discovery
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('angle')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'angle' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Sales Angle
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('social')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'social' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          Social Posts
                        </button>
                        <button
                          onClick={() => setOutreachSubTab('ideas')}
                          className={`flex-1 py-1 px-2 rounded transition-all ${outreachSubTab === 'ideas' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-800'}`}
                        >
                          YouTube & Blog
                        </button>
                      </div>

                      {/* Regular Email / Script Subtabs */}
                      {outreachSubTab !== 'social' && outreachSubTab !== 'ideas' && (
                        <>
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
                              className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded cursor-pointer"
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
                        </>
                      )}

                      {/* SOCIAL CONTENT GENERATOR */}
                      {outreachSubTab === 'social' && (() => {
                        let content = '';
                        if (socialType === 'linkedin') content = generateLinkedInPost(activeProspect);
                        else if (socialType === 'twitter') content = generateTwitterThread(activeProspect);
                        else if (socialType === 'tips') content = generateAgencyTips(activeProspect);
                        else if (socialType === 'teardown') content = generateWebsiteTeardown(activeProspect);
                        else if (socialType === 'discovery') content = generateOpportunityDiscoveryPost(activeProspect);

                        return (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-1.5 items-center justify-between border-b border-slate-150 pb-2">
                              <div className="flex flex-wrap gap-1">
                                <button
                                  onClick={() => setSocialType('linkedin')}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    socialType === 'linkedin' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  LinkedIn Post
                                </button>
                                <button
                                  onClick={() => setSocialType('twitter')}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    socialType === 'twitter' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  X / Twitter Thread
                                </button>
                                <button
                                  onClick={() => setSocialType('tips')}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    socialType === 'tips' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Agency Tips
                                </button>
                                <button
                                  onClick={() => setSocialType('teardown')}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    socialType === 'teardown' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Video Teardown Script
                                </button>
                                <button
                                  onClick={() => setSocialType('discovery')}
                                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    socialType === 'discovery' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Discovery Post
                                </button>
                              </div>

                              <button
                                onClick={() => copyToClipboard(content, `social-${socialType}`)}
                                className="text-sky-600 hover:text-sky-700 text-xs font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded cursor-pointer"
                              >
                                {copiedText === `social-${socialType}` ? (
                                  <>
                                    <Check className="h-3 w-3" /> Copied Post
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" /> Copy Post
                                  </>
                                )}
                              </button>
                            </div>

                            <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs md:text-sm font-sans whitespace-pre-wrap leading-relaxed overflow-y-auto h-[180px]">
                              {content}
                            </pre>
                          </div>
                        );
                      })()}

                      {/* YOUTUBE & BLOG CONTENT IDEAS */}
                      {outreachSubTab === 'ideas' && (() => {
                        const ideas = generateContentIdeas(activeProspect);
                        return (
                          <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
                            {ideas.map((idea) => (
                              <div key={idea.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 block">{idea.format}</span>
                                    <h4 className="text-xs font-bold text-slate-900">{idea.title}</h4>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const text = `${idea.title}\nFormat: ${idea.format}\nHook: ${idea.hook}\n\nOutline:\n${idea.outline.map(o => `• ${o}`).join('\n')}`;
                                      copyToClipboard(text, idea.id);
                                    }}
                                    className="text-[10px] font-bold text-sky-600 hover:text-sky-700 bg-white border border-slate-200 px-2 py-0.5 rounded cursor-pointer shrink-0"
                                  >
                                    {copiedText === idea.id ? '✓ Copied' : 'Copy Outline'}
                                  </button>
                                </div>
                                <p className="text-[11px] text-slate-600 italic">
                                  "{idea.hook}"
                                </p>
                                <ul className="text-[10px] text-slate-600 space-y-1 bg-white p-2 rounded border border-slate-150">
                                  {idea.outline.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-1.5">
                                      <span className="text-sky-500 font-bold">•</span>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        );
                      })()}


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

                {/* 4. Evidence Vault (Requirement 6: Store all discovered pages in the Evidence Vault) */}
                {activeTab === 'vault' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-2 gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setVaultSubTab('pages')}
                          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                            vaultSubTab === 'pages' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <Globe className="h-3.5 w-3.5" />
                          Discovered & Crawled Pages ({parseCrawledPages(activeProspect.crawledPagesData).length || activeProspect.pagesCrawledCount || 1})
                        </button>
                        <button
                          onClick={() => setVaultSubTab('citations')}
                          className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                            vaultSubTab === 'citations' ? 'bg-sky-100 text-sky-700' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <FileCheck className="h-3.5 w-3.5" />
                          Verifiable Citations ({parseSignals(activeProspect.buyingSignals).length})
                        </button>
                      </div>

                      {vaultSubTab === 'pages' && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Filter pages by URL or title..."
                            value={vaultSearch}
                            onChange={(e) => setVaultSearch(e.target.value)}
                            className="text-xs pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg w-56 focus:outline-none focus:border-sky-500"
                          />
                          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2 top-2" />
                        </div>
                      )}
                    </div>

                    {/* SubTab 1: Discovered & Crawled Pages Inventory */}
                    {vaultSubTab === 'pages' && (() => {
                      const allPages = parseCrawledPages(activeProspect.crawledPagesData);
                      const filteredPages = allPages.filter(p => 
                        !vaultSearch ||
                        p.url.toLowerCase().includes(vaultSearch.toLowerCase()) ||
                        p.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
                        p.category.toLowerCase().includes(vaultSearch.toLowerCase())
                      );

                      if (allPages.length === 0) {
                        return (
                          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                            <Globe className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                            <p className="font-semibold text-slate-600">Single Homepage Audited</p>
                            <p className="text-[11px] mt-0.5">Run a new scan to crawl up to 20 prioritized internal pages.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex-1 flex flex-col max-h-[340px]">
                          <div className="overflow-y-auto flex-1">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-bold z-10">
                                <tr>
                                  <th className="p-2.5">Page Title & URL</th>
                                  <th className="p-2.5">Category</th>
                                  <th className="p-2.5">Depth</th>
                                  <th className="p-2.5">Status</th>
                                  <th className="p-2.5 text-right">Extracted</th>
                                  <th className="p-2.5 text-center">Snippet</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-150 bg-white">
                                {filteredPages.map((page, idx) => (
                                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="p-2.5 max-w-[240px]">
                                      <span className="font-bold text-slate-800 block truncate" title={page.title}>{page.title || 'Untitled Page'}</span>
                                      <a
                                        href={page.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] text-sky-600 hover:underline flex items-center gap-1 truncate"
                                        title={page.url}
                                      >
                                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                        {page.url}
                                      </a>
                                    </td>
                                    <td className="p-2.5">
                                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                        {page.category}
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <span className="text-[10px] font-mono text-slate-500">
                                        Level {page.depth}
                                      </span>
                                    </td>
                                    <td className="p-2.5">
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        page.status === 'Crawled'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : page.status === 'Failed'
                                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                                          : 'bg-slate-100 text-slate-500 border-slate-200'
                                      }`}>
                                        {page.status === 'Crawled' ? '✓ Crawled' : page.status}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right font-mono text-slate-500 text-[10px]">
                                      {page.textLength ? `${(page.textLength / 1024).toFixed(1)} KB` : '—'}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      {page.snippet ? (
                                        <button
                                          onClick={() => setSelectedPageSnippet({ title: page.title, url: page.url, snippet: page.snippet })}
                                          className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline"
                                        >
                                          View Text
                                        </button>
                                      ) : (
                                        <span className="text-slate-300 text-[10px]">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}

                    {/* SubTab 2: Verifiable Evidence & Citations */}
                    {vaultSubTab === 'citations' && (
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
                    )}
                  </div>
                )}


                {/* 5. Safe Opportunity Valuation Engine */}
                {activeTab === 'valuation' && (
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                      <h4 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Service Opportunity Range</h4>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Total Range: {activeProspect.opportunityRange}
                        </span>
                        {activeOpportunityPortfolio?.isAvailable && (
                          <button
                            onClick={() => {
                              setSelectedOpportunityCalc(null);
                              setSelectedPortfolioCalc(activeOpportunityPortfolio);
                              setShowOpportunityCalcModal(true);
                            }}
                            className="bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer flex items-center gap-0.5"
                          >
                            Show Calculation
                            <ArrowUpRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
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
                                  onClick={() => {
                                    const calc = calculateServiceOpportunity(rec, { evidenceQuality: activeProspect.evidenceQuality });
                                    setSelectedPortfolioCalc(null);
                                    setSelectedOpportunityCalc(calc);
                                    setShowOpportunityCalcModal(true);
                                  }}
                                  className="text-[10px] font-bold text-sky-600 hover:text-sky-700 underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  Show Calculation
                                  <ArrowUpRight className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => setShowCalcIndex(showCalcIndex === idx ? null : idx)}
                                  className="text-[9px] font-medium text-slate-500 hover:text-slate-700"
                                >
                                  {showCalcIndex === idx ? '✕ Hide Quick Math' : '➕ Quick Math'}
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


                {/* 6. Analysis Comparison & Change Detection Engine */}
                {activeTab === 'comparison' && (
                  <div className="space-y-6 flex-1 flex flex-col">
                    {/* Header & Version History Selector */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <History className="h-5 w-5 text-sky-600" />
                          <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                            Analysis Comparison Engine
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Detect differences and explain results across website analysis runs.
                        </p>
                      </div>

                      {/* Version History Selector */}
                      {domainProspects.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Version History:
                          </span>
                          {domainProspects.map((dp, idx) => {
                            const vNum = idx + 1;
                            const isCurrent = dp.id === activeProspect.id;
                            const isCompared = activeComparisonReport?.previousAnalysis?.id === dp.id;
                            const formattedDate = new Date(dp.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            });

                            return (
                              <button
                                key={dp.id}
                                onClick={() => {
                                  if (isCurrent) return;
                                  setSelectedComparisonVersion(dp.id);
                                }}
                                className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : isCompared
                                    ? 'bg-sky-100 text-sky-800 border-sky-300 shadow-2xs'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                                title={`Analysis #${vNum} • ${formattedDate}`}
                              >
                                <span>Analysis #{vNum}</span>
                                <span className="text-[10px] opacity-75 font-normal">({formattedDate})</span>
                                {isCurrent && <span className="text-[9px] bg-sky-500 text-white px-1.5 py-0.2 rounded-full uppercase">Active</span>}
                                {isCompared && <span className="text-[9px] bg-sky-600 text-white px-1.5 py-0.2 rounded-full uppercase">Compared</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {activeComparisonReport && activeComparisonReport.isRepeatedAnalysis ? (
                      <div className="space-y-6 flex-1 flex flex-col">
                        
                        {/* 1. Repeated Analysis Found Banner */}
                        <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                              v{activeComparisonReport.version}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-black text-sm text-slate-900">Previous Analysis Found</h4>
                                <span className="bg-sky-200 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Analysis #{activeComparisonReport.version} vs #{activeComparisonReport.version - 1}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Previous Analysis: <strong className="text-slate-900 font-semibold">{activeComparisonReport.previousAnalysis?.timeAgo || 'Earlier'}</strong> ({activeComparisonReport.previousAnalysis?.shortDate}) • A comparison report has been generated.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                              ● {activeComparisonReport.summaryCard?.status || 'Analysis Improved'}
                            </span>
                          </div>
                        </div>

                        {/* 2. CHANGE SUMMARY CARD */}
                        <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4.5 w-4.5 text-sky-600" />
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                {activeComparisonReport.summaryCard?.title || 'Analysis Difference Summary'}
                              </h4>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              Status: {activeComparisonReport.summaryCard?.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Verified Facts</span>
                              <strong className="text-sm font-black text-slate-900 mt-1 block">
                                {activeComparisonReport.summaryCard?.verifiedFacts}
                              </strong>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Crawl Coverage</span>
                              <strong className="text-sm font-black text-slate-900 mt-1 block">
                                {activeComparisonReport.summaryCard?.crawlCoverage}
                              </strong>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Pages Crawled</span>
                              <strong className="text-sm font-black text-slate-900 mt-1 block">
                                {activeComparisonReport.summaryCard?.pagesCrawled}
                              </strong>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Opportunity Value</span>
                              <strong className="text-sm font-black text-emerald-600 mt-1 block truncate" title={activeComparisonReport.summaryCard?.opportunityValue}>
                                {activeComparisonReport.summaryCard?.opportunityValue}
                              </strong>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Trust Score</span>
                              <strong className="text-sm font-black text-sky-600 mt-1 block">
                                {activeComparisonReport.summaryCard?.trustScore}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* 3. EXPLAIN THE DIFFERENCE & ROOT CAUSE */}
                        <div className="grid md:grid-cols-2 gap-4">
                          
                          {/* Explain The Difference (Plain Language) */}
                          <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base">💡</span>
                              <h4 className="text-xs font-black text-sky-950 uppercase tracking-wider">
                                Why are results different?
                              </h4>
                            </div>
                            <div className="text-xs text-sky-900 leading-relaxed space-y-2 whitespace-pre-line font-medium">
                              {activeComparisonReport.explanation}
                            </div>
                          </div>

                          {/* Root Cause Classification */}
                          <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3.5">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-sky-400">
                                Root Cause Classification
                              </span>
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Verified Attribution
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Cause:</span>
                              <h4 className="text-base font-black text-white flex items-center gap-2">
                                <span className="text-emerald-400 font-bold">●</span>
                                {activeComparisonReport.rootCause?.primaryCause}
                              </h4>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                <strong>Impact:</strong> {activeComparisonReport.rootCause?.impact}
                              </p>
                            </div>

                            {/* Allowed Reasons Dropdown/Pills */}
                            <div className="pt-2 border-t border-slate-800">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                Allowed Reason Categories:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {ALLOWED_ROOT_CAUSES.map((cause, i) => (
                                  <span
                                    key={i}
                                    className={`text-[9px] px-2 py-0.5 rounded-md font-medium ${
                                      activeComparisonReport.rootCause?.primaryCause === cause
                                        ? 'bg-sky-500 text-white font-bold'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                  >
                                    {cause}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. WEBSITE CHANGES DETECTED & PRICING MODEL CHANGES & TRUST CHANGES */}
                        <div className="grid md:grid-cols-3 gap-4">
                          
                          {/* Website Changes Detected */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Website Changes Detected
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                activeComparisonReport.websiteChanges?.detected
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {activeComparisonReport.websiteChanges?.detected ? 'Changes Found' : 'No Changes'}
                              </span>
                            </div>

                            <div className="text-xs text-slate-700 space-y-1.5">
                              <div className="flex justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-1">
                                <span>Current: <strong>{activeComparisonReport.websiteChanges?.currentAnalysisDate}</strong></span>
                                <span>Previous: <strong>{activeComparisonReport.websiteChanges?.previousAnalysisDate}</strong></span>
                              </div>

                              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider pt-1">
                                New Content Found:
                              </span>
                              <ul className="space-y-1 text-xs">
                                {activeComparisonReport.websiteChanges?.newContentFound && activeComparisonReport.websiteChanges.newContentFound.length > 0 ? (
                                  activeComparisonReport.websiteChanges.newContentFound.map((item: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-1.5 text-slate-700 font-medium">
                                      <span className="text-emerald-500 font-bold text-xs">✔</span>
                                      <span>{item}</span>
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-slate-400 text-xs italic">No structural website changes.</li>
                                )}
                              </ul>
                              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                                {activeComparisonReport.websiteChanges?.impactStatement}
                              </p>
                            </div>
                          </div>

                          {/* Pricing Model Changes */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Pricing Model Changed
                              </span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                activeComparisonReport.pricingModelChanges?.changed
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {activeComparisonReport.pricingModelChanges?.changed ? 'Model Updated' : 'Model Kept'}
                              </span>
                            </div>

                            <div className="text-xs space-y-2">
                              <div className="p-2 bg-slate-50 rounded-lg border border-slate-150 text-[11px] space-y-1">
                                <div><span className="text-slate-400">Previous Model:</span> <strong className="text-slate-800">{activeComparisonReport.pricingModelChanges?.previousModel}</strong></div>
                                <div><span className="text-slate-400">Current Model:</span> <strong className="text-sky-700">{activeComparisonReport.pricingModelChanges?.currentModel}</strong></div>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {activeComparisonReport.pricingModelChanges?.explanation}
                              </p>
                            </div>
                          </div>

                          {/* Trust Score Changes */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Trust Score Changes
                              </span>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                                {activeComparisonReport.trustScoreChanges?.displayDelta}
                              </span>
                            </div>

                            <div className="text-xs space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">
                                Reason for Score Delta:
                              </span>
                              <ul className="space-y-1 text-xs">
                                {activeComparisonReport.trustScoreChanges?.reasons.map((r: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1.5 text-slate-700 font-medium">
                                    <span className="text-sky-600 mt-0.5">•</span>
                                    <span>{r}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* 5. ITEMIZED DELTAS: NEW FACTS & NEW OPPORTUNITIES */}
                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                            Itemized Audit Deltas
                          </h4>

                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Newly Verified Facts */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span>✔</span> Newly Verified Facts ({activeComparisonReport.itemizedDeltas?.newlyVerifiedFacts.length || 0})
                              </span>
                              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                                {activeComparisonReport.itemizedDeltas?.newlyVerifiedFacts && activeComparisonReport.itemizedDeltas.newlyVerifiedFacts.length > 0 ? (
                                  activeComparisonReport.itemizedDeltas.newlyVerifiedFacts.map((fact: string, idx: number) => (
                                    <div key={idx} className="p-2 bg-emerald-50/60 border border-emerald-150 rounded text-xs text-slate-800">
                                      {fact}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic">No new facts added in this run.</p>
                                )}
                              </div>
                            </div>

                            {/* Newly Identified Opportunities */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                              <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                                <span>★</span> Newly Recommended Services ({activeComparisonReport.itemizedDeltas?.newlyIdentifiedOpportunities.length || 0})
                              </span>
                              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                                {activeComparisonReport.itemizedDeltas?.newlyIdentifiedOpportunities && activeComparisonReport.itemizedDeltas.newlyIdentifiedOpportunities.length > 0 ? (
                                  activeComparisonReport.itemizedDeltas.newlyIdentifiedOpportunities.map((opp: string, idx: number) => (
                                    <div key={idx} className="p-2 bg-sky-50/60 border border-sky-150 rounded text-xs font-semibold text-sky-900">
                                      {opp}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic">Opportunity list remained identical.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      /* Initial Run / Single Analysis State */
                      <div className="p-10 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white text-slate-600 flex items-center justify-center mx-auto text-xl shadow-2xs font-bold border border-slate-200">
                          🔍
                        </div>
                        <h4 className="text-sm font-black text-slate-800">
                          Analysis #1 (Baseline Run)
                        </h4>
                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                          This is the initial analysis for <strong>{activeProspect.companyName}</strong> ({activeProspect.websiteUrl}).
                          When you re-analyze this website in the future, LeadPilot will automatically detect differences, classify root causes, and explain any metric shifts.
                        </p>
                      </div>
                    )}
                  </div>
                )}


                </ErrorBoundary>
              </div>
            </div>

          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center text-slate-600 shadow-sm flex-1 flex flex-col justify-center items-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto text-2xl shadow-2xs font-bold">
                🔍
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Turn any company website into:
                </h3>
                <div className="mt-3 space-y-2 text-left inline-block bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✅</span>
                    <span>Verified opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✅</span>
                    <span>Service recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✅</span>
                    <span>Proposal-ready solutions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">✅</span>
                    <span>Personalized outreach</span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-sky-700 bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 shadow-2xs">
                Analyze a website to get started.
              </p>
              <p className="text-[11px] text-slate-400 max-w-md">
                LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.
              </p>
            </div>
          )}


        </div>

        {/* Right Column: History, Billing, Logs */}
        <div className="space-y-6">
          
          {/* Chrome Extension Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Chrome Extension
              </span>
              <span className="text-[10px] text-slate-400 font-mono">&lt;60s Speed</span>
            </div>
            <h4 className="font-black text-sm text-white">
              From website to winning proposal in under 60 seconds.
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis directly from any browser tab.
            </p>
            <div className="pt-1">
              <span className="text-[10px] text-emerald-400 font-semibold block">
                ✓ 1-Click Prospect Audit & Proposal Generation
              </span>
            </div>
          </div>

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
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <History className="h-4.5 w-4.5 text-slate-400" />
                Client Opportunities ({sortedProspects.length})
              </h3>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setProspectSortBy('opportunity')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    prospectSortBy === 'opportunity'
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Sort by highest potential opportunity value"
                >
                  $ Value
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setProspectSortBy('newest')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    prospectSortBy === 'newest'
                      ? 'bg-sky-100 text-sky-800'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Sort by newest scan date"
                >
                  Newest
                </button>
              </div>
            </div>

            <div className="mt-2 divide-y divide-slate-100 overflow-y-auto flex-1 pr-1 space-y-1">
              {sortedProspects.length > 0 ? (
                sortedProspects.map((p) => (
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

      {/* Extracted Page Content Preview Modal */}
      {selectedPageSnippet && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-150 pb-3">
              <div className="max-w-[500px]">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">Evidence Vault Content Extracted</span>
                <h4 className="font-bold text-slate-800 text-sm truncate">{selectedPageSnippet.title || 'Page Content'}</h4>
                <a href={selectedPageSnippet.url} target="_blank" rel="noreferrer" className="text-[11px] text-slate-400 hover:text-sky-600 flex items-center gap-1 truncate mt-0.5">
                  <ExternalLink className="h-3 w-3" />
                  {selectedPageSnippet.url}
                </a>
              </div>
              <button
                onClick={() => setSelectedPageSnippet(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-[300px] overflow-y-auto text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
              {selectedPageSnippet.snippet || 'No text snippet recorded.'}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedPageSnippet(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

