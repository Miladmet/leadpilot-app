import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LeadPilot AI - Find Opportunities. Generate Proposals. Win Clients.',
  description: 'LeadPilot helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.',
  verification: {
    google: 'google6d2d4ba6b8465c71',
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="google-site-verification" content="google6d2d4ba6b8465c71" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}

