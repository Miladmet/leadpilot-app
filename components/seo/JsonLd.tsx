import React from 'react';

export function GlobalJsonLd() {
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LeadPilot Software',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Cloud, All Modern Browsers',
    url: 'https://leadpilotsoftware.com',
    description:
      'LeadPilot Software helps agencies find opportunities, generate proposals, and win clients using evidence-backed analysis in under 60 seconds.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Free Tier Available'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'LeadPilot Software',
      url: 'https://leadpilotsoftware.com'
    }
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LeadPilot Software',
    alternateName: ['LeadPilot Software Platform', 'LeadPilot SaaS for Agencies'],
    url: 'https://leadpilotsoftware.com',
    logo: 'https://leadpilotsoftware.com/favicon.ico',
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
    url: 'https://leadpilotsoftware.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://leadpilotsoftware.com/tools?query={search_term_string}',
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
