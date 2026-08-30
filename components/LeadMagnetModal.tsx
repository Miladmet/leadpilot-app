'use client';

import React, { useState } from 'react';
import { Check, X, Download, Sparkles, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultOffer?: 'report' | 'template' | 'audit';
}

export default function LeadMagnetModal({ isOpen, onClose, defaultOffer = 'report' }: Props) {
  const [selectedOffer, setSelectedOffer] = useState<'report' | 'template' | 'audit'>(defaultOffer);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agencyType, setAgencyType] = useState('SEO Agency');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setSubmitting(true);
    // Simulate instantaneous lead generation & asset delivery
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
    }, 600);
  };

  const getOfferTitle = () => {
    if (selectedOffer === 'template') return 'Free Agency Proposal Template (Figma & PDF)';
    if (selectedOffer === 'audit') return 'Free Full Website Opportunity Audit';
    return 'Free Website Opportunity & Revenue Report';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!success ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Free Agency Growth Asset</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Claim Your Free Growth Asset
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select your resource below. We will send the asset directly to your inbox.
              </p>
            </div>

            {/* Offer Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedOffer('report')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  selectedOffer === 'report'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Opportunity Report
              </button>
              <button
                type="button"
                onClick={() => setSelectedOffer('template')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  selectedOffer === 'template'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Proposal Template
              </button>
              <button
                type="button"
                onClick={() => setSelectedOffer('audit')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  selectedOffer === 'audit'
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Website Audit
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@agencygrowth.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Agency Type
                </label>
                <select
                  value={agencyType}
                  onChange={(e) => setAgencyType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 bg-white"
                >
                  <option value="SEO Agency">SEO Agency</option>
                  <option value="Web Design & Development">Web Design & Development</option>
                  <option value="Growth & Performance Marketing">Growth & Performance Marketing</option>
                  <option value="B2B Strategy Consultant">B2B Strategy Consultant</option>
                  <option value="Staffing & Recruiting">Staffing & Recruiting</option>
                  <option value="Independent Freelancer">Independent Freelancer</option>
                  <option value="Other">Other Agency Service</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Preparing Your Asset...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Free Asset →</span>
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-center text-slate-400">
              We respect your inbox. Zero spam. Unsubscribe anytime.
            </p>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">
              <Check className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Your Free Resource is Ready!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              We have dispatched your <strong>{getOfferTitle()}</strong> to <strong>{email}</strong>.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Instant Download Link:
              </span>
              <a
                href="/register"
                className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1.5 underline"
              >
                <span>Access Full Interactive Audit Suite on LeadPilot →</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
