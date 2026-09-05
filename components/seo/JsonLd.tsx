import React from 'react';

export function GlobalJsonLd() {
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LeadPilot Software',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Cloud, All Modern Browsers',
    url: 'https://www.leadpilotsoftware.com',
    description:
      'LeadPilot Software helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free Tier Available'
    },
    author: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://www.leadpilotsoftware.com'
    }
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LeadPilot Software',
    alternateName: ['LeadPilot Software Platform', 'LeadPilot SaaS for Agencies'],
    url: 'https://www.leadpilotsoftware.com',
    logo: 'https://www.leadpilotsoftware.com/favicon.ico',
    description:
      'LeadPilot Software is an independent B2B SaaS platform built exclusively for agencies, consultants, and web studios to extract verified client opportunities and deliver proposals.',
    sameAs: [
      'https://github.com/Miladmet/leadpilot-app'
    ]
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LeadPilot Software',
    url: 'https://www.leadpilotsoftware.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.leadpilotsoftware.com/tools?query={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
