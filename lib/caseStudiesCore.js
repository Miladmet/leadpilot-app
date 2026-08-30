const CASE_STUDIES = {
  'saas-scale-website-revamp': {
    slug: 'saas-scale-website-revamp',
    title: 'How a Growth Agency Uncovered $44,000 in Uncaptured Opportunities for a B2B SaaS',
    companyName: 'CloudMatrix Analytics',
    industry: 'B2B Enterprise Software',
    opportunityValue: '$44,000',
    auditDuration: '52 seconds',
    agencyType: 'B2B Growth & CRO Agency',
    summary: 'Using LeadPilot multi-page audit, Apex Growth Agency audited CloudMatrix live pages, surfaced mobile conversion bottlenecks, and pitched a $44k 3-phase optimization retainer that was approved on the first call.',
    problemsFound: [
      'Desktop CTA buttons were pushed below the viewport fold on mobile screen sizes',
      'No structured Schema.org FAQPage or Organization JSON-LD markup on product pages',
      'Largest Contentful Paint (LCP) was 4.1s due to uncompressed 4K hero PNG assets',
      'Competitors offered self-serve ROI calculators while CloudMatrix required a 5-step form'
    ],
    opportunitiesFound: [
      'Mobile Conversion Rate Optimization (CRO) Sprint: +32% projected demo bookings',
      'Topical Search Architecture & Rich Snippet Injection: +45% organic impression visibility',
      'Core Web Vitals Performance Sprint: Sub-1.2s page load speed',
      'Interactive Tiered Pricing Calculator: Immediate self-qualification for enterprise buyers'
    ],
    suggestedSolutions: [
      'Deploy sticky mobile bottom action bar with 1-tap demo scheduler',
      'Inject valid JSON-LD schemas across all 18 product subpages',
      'Migrate all hero and vector assets to next-gen WebP with lazy load',
      'Build embedded interactive pricing sandbox matching top 3 competitor features'
    ],
    beforeAfter: {
      beforeMetric: '1.4% Mobile Conversion Rate',
      beforeState: 'Prospects abandoned demo booking due to high-friction mobile navigation.',
      afterMetric: '3.8% Mobile Conversion Rate',
      afterState: 'Streamlined sticky mobile funnel doubled qualified demo submissions.',
      revenueLift: '+$140k Annual Pipeline'
    },
    agencyRoi: {
      closedRetainer: '$8,500/month 6-Month Retainer',
      pitchTimeSaved: '4.5 hours per proposal',
      winRate: 'Closed in 1 Discovery Call'
    }
  },
  'ecommerce-conversion-audit': {
    slug: 'ecommerce-conversion-audit',
    title: 'How a Web Design Shop Turned a 60-Second Audit into a $28,000 Redesign Project',
    companyName: 'Nordic Artisan Goods',
    industry: 'Direct-to-Consumer Luxury Goods',
    opportunityValue: '$28,000',
    auditDuration: '46 seconds',
    agencyType: 'Web Design & Shopify Studio',
    summary: 'By citing verbatim text and layout shift evidence from Nordic Artisan Goods live storefront, StudioCraft demonstrated $28k in immediate conversion upside and landed the redesign contract.',
    problemsFound: [
      'Cumulative Layout Shift (CLS) on checkout caused accidental cart misclicks on mobile',
      'Missing customer video proof widgets, which all top rivals prominently showcased',
      'Terms and Shipping pages lacked estimated delivery dates, creating buyer hesitation',
      'Navigation lacked clear filter categorization for seasonal collections'
    ],
    opportunitiesFound: [
      'Mobile Checkout UX Stabilization: Estimated 18% cart abandonment reduction',
      'Video Testimonial Integration: Increased social proof confidence',
      'Dynamic Shipping & Returns Clarification: Reduced customer support tickets by 40%',
      'UX Catalog Re-architecture: Enhanced average order value (AOV)'
    ],
    suggestedSolutions: [
      'Refactor Shopify checkout scripts to eliminate render-blocking CSS shifts',
      'Implement verified video testimonial carousel on high-traffic product pages',
      'Inject live dynamic shipping calculation badge next to "Add to Cart"',
      'Redesign header mega-menu with visual category previews'
    ],
    beforeAfter: {
      beforeMetric: '72% Cart Abandonment',
      beforeState: 'Buyers struggled with mobile checkout friction and unexpected shipping terms.',
      afterMetric: '54% Cart Abandonment',
      afterState: 'Transparent shipping badges and stabilized mobile checkout increased completed orders.',
      revenueLift: '+$31,500 Monthly GMV'
    },
    agencyRoi: {
      closedRetainer: '$28,000 Fixed Fee Project',
      pitchTimeSaved: '5.0 hours of manual audit prep',
      winRate: 'Unanimous Stakeholder Approval'
    }
  },
  'healthcare-seo-expansion': {
    slug: 'healthcare-seo-expansion',
    title: 'How an SEO Consultant Closed a $5,000/mo Healthcare Retainer in 3 Days',
    companyName: 'Metro Health Specialists',
    industry: 'Multi-Location Healthcare',
    opportunityValue: '$36,000',
    auditDuration: '58 seconds',
    agencyType: 'Local & National SEO Consultancy',
    summary: 'LeadPilot revealed critical localized schema omissions across Metro Health 6 regional clinic pages. The consultant presented the verified facts and signed an ongoing $5k/mo organic search retainer.',
    problemsFound: [
      '6 regional practice pages shared identical meta descriptions and lacked local schema',
      'Doctor credentials were buried in PDFs rather than indexable HTML biographies',
      'Zero FAQ schema markup for high-intent queries like "emergency dental pricing"',
      'Inconsistent NAP (Name, Address, Phone) formatting across clinic location subdomains'
    ],
    opportunitiesFound: [
      'Local Schema & Location Page Optimization: Dominate local 3-pack search rankings',
      'Physician Profile SEO Overhaul: Rank for specialized provider search queries',
      'FAQ Rich Snippets: Capture Google zero-click answer boxes for symptoms and treatments',
      'Speed Optimization: Ensure fast booking on cellular connections'
    ],
    suggestedSolutions: [
      'Deploy individual Schema.org MedicalClinic tags on each location page',
      'Convert provider PDF profiles to indexable structured schema profiles',
      'Inject localized FAQs with verified physician answers',
      'Consolidate NAP standards and deploy mobile appointment booking deep-links'
    ],
    beforeAfter: {
      beforeMetric: 'Top 3-Pack in 1 City',
      beforeState: 'Clinics relied on expensive Google Ads to capture local patient appointments.',
      afterMetric: 'Top 3-Pack in All 6 Cities',
      afterState: 'Organic patient bookings surged across all suburban service regions.',
      revenueLift: '+65 New Patients/Month'
    },
    agencyRoi: {
      closedRetainer: '$5,000/month Annual Contract ($60k ACV)',
      pitchTimeSaved: '6 hours of technical crawling',
      winRate: 'Pitch Approved in 72 Hours'
    }
  }
};

module.exports = { CASE_STUDIES };
