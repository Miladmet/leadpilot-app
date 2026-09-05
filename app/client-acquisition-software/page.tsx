import React from 'react';
import { Metadata } from 'next';
import { SEO_KEYWORDS } from '@/lib/seoKeywords';
import { LandingPageTemplate } from '@/components/seo/LandingPageTemplate';

const DATA = {
  ...SEO_KEYWORDS['client-acquisition-software'],
  title: 'Client Acquisition Software for Agencies & Studios | LeadPilot Software',
  metaDescription:
    'Turn website audits into closed agency retainers. The automated client acquisition software built for digital agencies, SEO consultants, and web designers.',
  headline: 'Client Acquisition Software Engineered for High-Ticket Agency Growth',
  subtitle:
    'Cut research time from 5 hours to 60 seconds. Uncover verified client opportunities, benchmark competitors, and deliver proposals that win deals.'
};

export const metadata: Metadata = {
  title: DATA.title,
  description: DATA.metaDescription,
  alternates: {
    canonical: 'https://www.leadpilotsoftware.com/client-acquisition-software'
  },
  openGraph: {
    title: DATA.title,
    description: DATA.metaDescription,
    url: 'https://www.leadpilotsoftware.com/client-acquisition-software',
    siteName: 'LeadPilot Software'
  }
};

export default function ClientAcquisitionSoftwarePage() {
  return <LandingPageTemplate data={DATA} canonicalPath="/client-acquisition-software" />;
}
