'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, ArrowLeft, Zap, Clock, ShieldCheck, DollarSign, Activity, Target, Search } from 'lucide-react';

interface RecommendedService {
  serviceName: string;
  issue: string;
  impact: string;
  estimatedFee: string;
  estimatedValue: number;
  confidence: number;
  expectedOutcome: string;
  explanation: string;
}

interface Opportunity {
  id: string;
  prospectId: string;
  prospectName: string;
  websiteUrl: string;
  title: string;
  description: string;
  evidence: string;
  confidence: number;
  potentialRevenue: number;
  effort: string;
  priority: string;
  whyThisMatters: string;
  source: string;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'revenue' | 'confidence' | 'fastest'>('revenue');

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) throw new Error('Unauthorized');
        
        const res = await fetch('/api/prospects');
        if (res.ok) {
          const data = await res.json();
          setProspects(data.prospects || []);
        }
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const opportunities: Opportunity[] = useMemo(() => {
    const opps: Opportunity[] = [];
    
    prospects.forEach((p) => {
      let recs: RecommendedService[] = [];
      try { recs = JSON.parse(p.recommendations || '[]'); } catch(e) {}
      
      let evidenceSources: any[] = [];
      try { evidenceSources = JSON.parse(p.evidenceSources || '[]'); } catch(e) {}
      
      // Determine overall source for this prospect
      let source = 'Crawler';
      const hasMcp = evidenceSources.some(src => src.type === 'MCP Evidence');
      const hasBiz = evidenceSources.some(src => src.type === 'Public Business Information' || src.type === 'Business Evidence');
      if (hasMcp && hasBiz) source = 'Combined';
      else if (hasMcp) source = 'MCP';
      else if (hasBiz) source = 'Business Data';

      recs.forEach((rec, idx) => {
        // Derive Effort and Priority
        let effort = 'Medium';
        let priority = 'Medium';
        
        if (rec.estimatedValue > 4000) {
          priority = 'High';
          effort = 'High';
        } else if (rec.estimatedValue < 1000) {
          priority = 'Low';
          effort = 'Low';
        }
        
        if (rec.confidence > 90 && rec.estimatedValue > 1500) {
          priority = 'High';
        }
        if (rec.serviceName.toLowerCase().includes('quick') || rec.serviceName.toLowerCase().includes('speed')) {
          effort = 'Low';
        }

        opps.push({
          id: `${p.id}-${idx}`,
          prospectId: p.id,
          prospectName: p.companyName || 'Unknown Company',
          websiteUrl: p.websiteUrl,
          title: rec.serviceName,
          description: rec.issue,
          evidence: rec.explanation || 'Analyzed via engine.',
          confidence: rec.confidence,
          potentialRevenue: rec.estimatedValue || 0,
          effort,
          priority,
          whyThisMatters: rec.impact,
          source
        });
      });
    });
    
    // Sort logic
    if (sortBy === 'revenue') {
      opps.sort((a, b) => b.potentialRevenue - a.potentialRevenue);
    } else if (sortBy === 'confidence') {
      opps.sort((a, b) => b.confidence - a.confidence);
    } else if (sortBy === 'fastest') {
      // Fastest Win: Low Effort, High Priority, High Confidence
      opps.sort((a, b) => {
        const scoreA = (a.effort === 'Low' ? 100 : a.effort === 'Medium' ? 50 : 0) + (a.confidence / 2);
        const scoreB = (b.effort === 'Low' ? 100 : b.effort === 'Medium' ? 50 : 0) + (b.confidence / 2);
        return scoreB - scoreA;
      });
    }

    return opps;
  }, [prospects, sortBy]);

  // Group into columns
  const highValue = opportunities.filter(o => o.potentialRevenue >= 3000 || o.priority === 'High');
  const quickWin = opportunities.filter(o => o.effort === 'Low' && !highValue.includes(o));
  const mediumValue = opportunities.filter(o => o.potentialRevenue >= 1000 && !highValue.includes(o) && !quickWin.includes(o));
  const longTerm = opportunities.filter(o => !highValue.includes(o) && !quickWin.includes(o) && !mediumValue.includes(o));

  const renderCard = (opp: Opportunity) => (
    <div key={opp.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:border-emerald-300 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-slate-900 text-sm leading-tight">{opp.title}</h4>
        <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
          ${opp.potentialRevenue.toLocaleString()}
        </span>
      </div>
      
      <div className="text-xs text-slate-500">
        <span className="block font-bold text-slate-700">{opp.prospectName}</span>
        <span className="block text-[10px] truncate">{opp.websiteUrl}</span>
      </div>

      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
        {opp.description}
      </p>

      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
          opp.confidence >= 90 ? 'bg-sky-50 text-sky-700 border border-sky-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          <Target className="w-2.5 h-2.5" />
          {opp.confidence}% Conf
        </span>
        
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
          opp.source === 'Combined' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          <Search className="w-2.5 h-2.5" />
          {opp.source}
        </span>
        
        <span className="text-[9px] font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-1">
          <Activity className="w-2.5 h-2.5" />
          Effort: {opp.effort}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Opportunity Intelligence Center
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Shift focus from raw crawls to verified revenue pipelines.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setSortBy('revenue')}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${sortBy === 'revenue' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Highest Revenue
          </button>
          <button 
            onClick={() => setSortBy('confidence')}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${sortBy === 'confidence' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Highest Confidence
          </button>
          <button 
            onClick={() => setSortBy('fastest')}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${sortBy === 'fastest' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Fastest Win
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center mt-20 space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">No Opportunities Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">Analyze some prospects to generate your opportunity pipeline.</p>
          </div>
        ) : (
          <div className="flex gap-6 min-w-max pb-10">
            {/* Column 1: High Value */}
            <div className="w-80 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b-2 border-emerald-400 pb-2 mb-1">
                <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  High Value
                </h3>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{highValue.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {highValue.map(renderCard)}
              </div>
            </div>

            {/* Column 2: Quick Win */}
            <div className="w-80 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b-2 border-sky-400 pb-2 mb-1">
                <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-500" />
                  Quick Win
                </h3>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{quickWin.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {quickWin.map(renderCard)}
              </div>
            </div>

            {/* Column 3: Medium Value */}
            <div className="w-80 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b-2 border-indigo-400 pb-2 mb-1">
                <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Medium Value
                </h3>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{mediumValue.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {mediumValue.map(renderCard)}
              </div>
            </div>

            {/* Column 4: Long-Term */}
            <div className="w-80 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2 mb-1">
                <h3 className="font-black text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Long-Term
                </h3>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{longTerm.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {longTerm.map(renderCard)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
