import React from 'react';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';

const DATA = {
  ...SEO_KEYWORDS['competitor-gap-analysis'],
  title: 'Competitor Gap Analysis Tool for Agencies | LeadPilot Software',
  metaDescription:
    'Identify competitor feature gaps and conversion advantages on prospective client websites in under 60 seconds with LeadPilot Software.',
  headline: 'Uncover Competitor Gaps that Make Agency Retainers Irresistible',
  subtitle:
    'Benchmark any company website against industry rivals to reveal missing capabilities, speed deficits, and conversion gaps in seconds.'
};

export const metadata: Metadata = {
  title: DATA.title,
  description: DATA.metaDescription,
  alternates: {
    canonical: 'https://leadpilotsoftware.com/competitor-gap-analysis'
  },
  openGraph: {
    title: DATA.title,
    description: DATA.metaDescription,
    url: 'https://leadpilotsoftware.com/competitor-gap-analysis',
    siteName: 'LeadPilot Software'
  }
};

export default function CompetitorGapAnalysisPage() {
  return <LandingPageTemplate data={DATA} canonicalPath="/competitor-gap-analysis" />;
}
