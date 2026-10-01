import React from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { Target, Activity, ShieldCheck, Mail, MessageSquare, Phone, FileText } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: {
    id: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function OutreachIntelligencePage({ params }: Props) {
  const { id } = params;

  // 1. Authenticate user
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const authPayload = token ? verifyToken(token) : null;

  if (!authPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
          <h2 className="text-2xl font-black mb-2 text-rose-400">Unauthorized</h2>
          <p className="text-sm text-slate-400">Please log in to LeadPilot to view this outreach sequence.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Outreach
  const outreach = await prisma.outreachMessages.findUnique({
    where: { id },
    include: {
      prospect: true
    }
  });

  if (!outreach) {
    notFound();
  }

  let followUps = [];
  try { followUps = JSON.parse(outreach.followUpSequence || '[]'); } catch(e) {}

  let questions = [];
  try { questions = JSON.parse(outreach.discoveryQuestions || '[]'); } catch(e) {}

  let sources = [];
  try { sources = JSON.parse(outreach.evidenceSources || '[]'); } catch(e) {}

  // 3. Render Outreach Intelligence Document
  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mb-3 inline-block">
                Evidence-Backed Outreach Strategy
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {outreach.opportunityTitle}
              </h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                Prepared For: <span className="text-slate-800">{outreach.prospect?.companyName || 'Target Client'}</span>
              </p>
            </div>
            
            <Link href="/opportunities" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors bg-slate-100 hover:bg-indigo-50 px-4 py-2 rounded-lg">
              &larr; Back to Pipeline
            </Link>
          </div>

          {/* OIE SCORES */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Outreach Confidence</span>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-500" />
                <span className="text-xl font-black text-slate-800">{outreach.outreachConfidence}%</span>
              </div>
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Personalization Score</span>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span className="text-xl font-black text-slate-800">{outreach.personalizationScore}/100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evidence Sources</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 bg-indigo-50 px-2 py-0.5 rounded">
                  {sources.map((s: any) => s.type).join(', ') || 'AI Extracted'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* OUTREACH CONTENT TABS (Vertical Layout) */}
        <div className="space-y-6">
          
          {/* Cold Email */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-500" />
              <h3 className="font-black text-slate-800">Cold Email Template</h3>
            </div>
            <div className="p-6">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {outreach.coldEmail}
              </pre>
            </div>
          </section>

          {/* LinkedIn Message */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <h3 className="font-black text-slate-800">LinkedIn Message</h3>
            </div>
            <div className="p-6">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {outreach.linkedInMessage}
              </pre>
            </div>
          </section>

          {/* Follow-Up Sequence */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <h3 className="font-black text-slate-800">Follow-Up Sequence</h3>
            </div>
            <div className="p-6 space-y-3">
              {followUps.map((msg: string, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Touchpoint {idx + 2}</span>
                  <p className="text-sm text-slate-700 leading-relaxed">{msg}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Discovery Questions */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-500" />
              <h3 className="font-black text-slate-800">Discovery Call Questions</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {questions.map((q: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-bold text-amber-500">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Proposal Cover Letter */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 p-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-500" />
              <h3 className="font-black text-slate-800">Proposal Cover Letter</h3>
            </div>
            <div className="p-6">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {outreach.proposalCoverLetter}
              </pre>
            </div>
          </section>

        </div>
        
      </div>
    </div>
  );
}
