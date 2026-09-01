import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GlobalJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL('https://leadpilotsoftware.com'),
  title: {
    default: 'LeadPilot Software | Turn Any Website Into a Client Proposal',
    template: '%s | LeadPilot Software'
  },
  description:
    'LeadPilot Software helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.',
  keywords: [
    'LeadPilot Software',
    'agency prospecting software',
    'website audit tool',
    'proposal generator',
    'competitor gap analysis',
    'client acquisition software',
    'evidence-backed audit'
  ],
  authors: [{ name: 'LeadPilot Software' }],
  creator: 'LeadPilot Software',
  publisher: 'LeadPilot Software',
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'LeadPilot Software',
    description: 'Turn Any Company Website Into a Client Proposal in Under 60 Seconds.',
    url: 'https://leadpilotsoftware.com',
    siteName: 'LeadPilot Software',
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadPilot Software',
    description: 'Turn Any Company Website Into a Client Proposal in Under 60 Seconds.',
    creator: '@leadpilotsoftware'
  },
  verification: {
    google: 'cYzYtD7leKZVNWP-bOlfdOIIsveWRz0HtPRooh1mZZo'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="google-site-verification" content="cYzYtD7leKZVNWP-bOlfdOIIsveWRz0HtPRooh1mZZo" />
        <GlobalJsonLd />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden w-full selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
