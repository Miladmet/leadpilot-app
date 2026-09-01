import React from 'react';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';

const DATA = {
  ...SEO_KEYWORDS['agency-prospecting-tool'],
  keyword: 'Agency Prospecting Software',
  title: 'Agency Prospecting Software: Evidence-Backed Discovery | LeadPilot Software',
  metaDescription:
    'Modern agency prospecting software that discovers qualified website opportunities, extracts verified facts, and generates client proposals in 60 seconds.',
  headline: 'The Evidence-First Agency Prospecting Software for High-Growth Firms',
  subtitle:
    'Stop cold pitching blind. Automatically crawl target websites, surface verifiable bottlenecks, and book discovery calls with undeniable evidence.'
};

export const metadata: Metadata = {
  title: DATA.title,
  description: DATA.metaDescription,
  alternates: {
    canonical: 'https://leadpilotsoftware.com/agency-prospecting-software'
  },
  openGraph: {
    title: DATA.title,
    description: DATA.metaDescription,
    url: 'https://leadpilotsoftware.com/agency-prospecting-software',
    siteName: 'LeadPilot Software'
  }
};

export default function AgencyProspectingSoftwarePage() {
  return <LandingPageTemplate data={DATA} canonicalPath="/agency-prospecting-software" />;
}
