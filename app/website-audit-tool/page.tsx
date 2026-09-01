import React from 'react';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';

const DATA = {
  ...SEO_KEYWORDS['website-audit-tool'],
  title: 'Website Audit Tool for Agencies & Consultants | LeadPilot Software',
  metaDescription:
    'Audit any company website in 60 seconds with verified evidence, competitor gaps, and client-ready proposals. Start scanning websites free with LeadPilot Software.',
  headline: 'The Evidence-Backed Website Audit Tool for High-Growth Agencies',
  subtitle:
    'Scan client websites, surface technical and conversion gaps, and turn verified findings into client proposals in under 60 seconds.'
};

export const metadata: Metadata = {
  title: DATA.title,
  description: DATA.metaDescription,
  alternates: {
    canonical: 'https://leadpilotsoftware.com/website-audit-tool'
  },
  openGraph: {
    title: DATA.title,
    description: DATA.metaDescription,
    url: 'https://leadpilotsoftware.com/website-audit-tool',
    siteName: 'LeadPilot Software'
  }
};

export default function WebsiteAuditToolPage() {
  return <LandingPageTemplate data={DATA} canonicalPath="/website-audit-tool" />;
}
