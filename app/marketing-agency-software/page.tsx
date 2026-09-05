import React from 'react';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';

const DATA = {
  ...SEO_KEYWORDS['ai-agency-software'],
  keyword: 'Marketing Agency Software',
  title: 'Marketing Agency Software: Prospecting, Audits & Proposals | LeadPilot Software',
  metaDescription:
    'The all-in-one software platform for marketing agencies to uncover client opportunities, benchmark competitors, and generate winning proposals in 60 seconds.',
  headline: 'The Evidence-First Marketing Agency Software Platform',
  subtitle:
    'Deliver undeniable proof on every discovery call. Automate multi-page audits, competitor gap analyses, and proposal decks that close retainers.'
};

export const metadata: Metadata = {
  title: DATA.title,
  description: DATA.metaDescription,
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/marketing-agency-software'
  },
  openGraph: {
    title: DATA.title,
    description: DATA.metaDescription,
    url: 'https://www.leadpilotsoftware.com/marketing-agency-software',
    siteName: 'LeadPilot Software'
  }
};

export default function MarketingAgencySoftwarePage() {
  return <LandingPageTemplate data={DATA} canonicalPath="/marketing-agency-software" />;
}
