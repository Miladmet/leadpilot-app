import React from 'react';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';

const DATA = {
  ...SEO_KEYWORDS['seo-proposal-generator'],
  keyword: 'Proposal Generator',
  title: 'AI Client Proposal Generator for Agencies | LeadPilot Software',
  metaDescription:
    'Generate evidence-backed agency proposals in under 60 seconds. Calculate conservative opportunity values and deliver client-ready pitches that win retainers.',
  headline: 'Generate High-Converting Agency Proposals in Under 60 Seconds',
  subtitle:
    'Stop wasting 4+ hours per pitch. Automatically generate custom website audits, 30-60-90 day roadmaps, and pricing models that win deals.'
};

export const metadata: Metadata = {
  title: DATA.title,
  description: DATA.metaDescription,
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/proposal-generator'
  },
  openGraph: {
    title: DATA.title,
    description: DATA.metaDescription,
    url: 'https://www.leadpilotsoftware.com/proposal-generator',
    siteName: 'LeadPilot Software'
  }
};

export default function ProposalGeneratorPage() {
  return <LandingPageTemplate data={DATA} canonicalPath="/proposal-generator" />;
}
