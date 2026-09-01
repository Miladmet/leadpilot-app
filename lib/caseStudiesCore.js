/**
 * LeadPilot Software - Prioritized Agency Case Studies
 *
 * Each case study documents:
 * - Problem
 * - Evidence
 * - Opportunity
 * - Solution
 * - Potential Value Range
 */

const CASE_STUDIES = {
  'watermark-resize-studio': {
    slug: 'watermark-resize-studio',
    title: 'How a Growth Agency Uncovered $44,000 in SaaS Tier Opportunities for Watermark & Resize Studio',
    companyName: 'Watermark & Resize Studio',
    industry: 'B2B SaaS & Digital Asset Automation',
    opportunityValue: '$44,000',
    potentialValueRange: '$35,000 - $55,000',
    auditDuration: '52 seconds',
    agencyType: 'B2B Growth & CRO Agency',
    summary: 'Using LeadPilot Software multi-page crawler, Apex Growth Agency audited Watermark & Resize Studio live pages, surfaced mobile conversion bottlenecks and missing enterprise tiers, and closed a $44,000 3-phase optimization retainer.',
    problem: 'Desktop CTA buttons were pushed below the viewport fold on mobile screen sizes, and enterprise buyers had no self-serve tier or ROI justification to request commercial licensing.',
    evidence: 'LeadPilot Software crawl extracted verbatim text and mobile DOM metrics revealing a 4.1s LCP on cellular connections, 0 Schema.org JSON-LD blocks across 18 tool pages, and a 72% drop-off on mobile upload flows.',
    opportunity: 'Mobile Conversion Rate Optimization (CRO) Sprint (+32% projected conversion), Topical Search Schema Injection (+45% organic impression visibility), and Tiered Enterprise Pricing Sandbox.',
    solution: 'Deployed sticky 1-tap mobile action bar, injected valid Schema.org SoftwareApplication markup across all tools, and integrated interactive self-serve licensing sandbox.',
    problemsFound: [
      'Desktop CTA buttons were pushed below the viewport fold on mobile screen sizes',
      'No structured Schema.org FAQPage or SoftwareApplication JSON-LD markup on product pages',
      'Largest Contentful Paint (LCP) was 4.1s due to uncompressed 4K hero PNG assets',
      'Competitors offered self-serve ROI calculators while Watermark Studio lacked enterprise self-qualification'
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
      beforeState: 'Prospects abandoned tool usage on mobile due to viewport clipping and slow asset loads.',
      afterMetric: '3.8% Mobile Conversion Rate',
      afterState: 'Streamlined sticky mobile funnel and enterprise self-serve tier doubled qualified signups.',
      revenueLift: '+$140k Annual Pipeline'
    },
    agencyRoi: {
      closedRetainer: '$44,000 3-Phase Retainer ($8,500/mo)',
      pitchTimeSaved: '4.5 hours per proposal',
      winRate: 'Closed in 1 Discovery Call'
    }
  },

  'dental-practice-audit': {
    slug: 'dental-practice-audit',
    title: 'How an SEO Consultant Closed a $5,000/mo Retainer for a Multi-Location Dental Practice',
    companyName: 'Apex Dental & Orthodontics Group',
    industry: 'Local Healthcare & Multi-Location Dental Clinic',
    opportunityValue: '$60,000/yr ($5,000/mo)',
    potentialValueRange: '$45,000 - $75,000',
    auditDuration: '48 seconds',
    agencyType: 'Local & Healthcare SEO Consultancy',
    summary: 'LeadPilot Software revealed critical localized schema omissions across Apex Dental 6 regional clinic pages. The consultant presented the verified facts and signed an ongoing $5,000/mo organic search retainer in 72 hours.',
    problem: '6 regional clinic locations shared identical duplicate meta descriptions, lacked local Schema.org/Dentist entities, and emergency dental fees were hidden inside downloaded PDFs.',
    evidence: 'LeadPilot Software multi-page crawler extracted 6 location subpages with 0 Dentist or MedicalClinic schemas, an inconsistent phone format across directories, and a 4.8s mobile booking latency.',
    opportunity: 'Local Schema & Location Page Optimization to dominate local Google 3-pack rankings across all 6 cities, capture zero-click answer boxes for emergency queries, and streamline 1-tap booking.',
    solution: 'Deployed dedicated Schema.org/Dentist tags per location, converted doctor PDF biographies into indexable HTML schema profiles, and injected localized emergency dental FAQs.',
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
      beforeMetric: 'Top 3-Pack in 1 City Only',
      beforeState: 'Clinics relied on expensive Google Ads ($42/click) to capture emergency patient calls.',
      afterMetric: 'Top 3-Pack in All 6 Cities',
      afterState: 'Organic emergency patient bookings surged across all suburban practice regions.',
      revenueLift: '+65 New Patients/Month'
    },
    agencyRoi: {
      closedRetainer: '$5,000/month Annual Contract ($60k ACV)',
      pitchTimeSaved: '6 hours of manual crawler configuration',
      winRate: 'Pitch Approved in 72 Hours'
    }
  },

  'law-firm-client-acquisition': {
    slug: 'law-firm-client-acquisition',
    title: 'How a Web Agency Won a $36,000 Redesign & CRO Contract for a Regional Law Firm',
    companyName: 'Vanguard Legal Counsel',
    industry: 'High-Ticket Legal Services & Litigation',
    opportunityValue: '$36,000',
    potentialValueRange: '$30,000 - $48,000',
    auditDuration: '55 seconds',
    agencyType: 'Web Design & Legal Client Acquisition Agency',
    summary: 'Using LeadPilot Software evidence engine, Digital Verdict Studio proved that Vanguard Legal was losing high-value litigation cases due to a broken 9-field mobile contact form, closing a $36,000 redesign deal on the spot.',
    problem: 'The firm spent $18,000/mo on pay-per-click traffic but had a 1.1% consultation booking rate because the intake form was an unusable 9-field desktop modal on mobile phones.',
    evidence: 'LeadPilot Software automated scan verified that the case evaluation form threw layout overflow errors on iOS Safari, and zero video testimonials or case settlement badges appeared on practice pages.',
    opportunity: 'High-intent practice area landing pages, frictionless 2-step mobile case intake evaluation, and verified settlement evidence widgets.',
    solution: 'Engineered high-converting mobile case evaluation funnels, embedded verified case outcome proof badges, and created specialized practice area landing pages.',
    problemsFound: [
      'High-friction 9-field desktop evaluation form caused 88% mobile abandonment',
      'Missing settlement proof widgets and zero client video testimonials on key practice pages',
      'Terms and consultation pages lacked confidentiality security seals, creating client hesitation',
      'Practice area pages were grouped into a single non-indexable accordion'
    ],
    opportunitiesFound: [
      'Frictionless 2-Step Mobile Case Evaluation: +45% completed inquiries',
      'Video Testimonial & Case Outcome Integration: Enhanced client trust and credibility',
      'Practice Area Landing Page Architecture: Direct organic ranking for high-value legal queries',
      'Mobile Click-to-Call Sticky Bar: Immediate intake for urgent accident cases'
    ],
    suggestedSolutions: [
      'Replace 9-field form with conversational 2-step qualification funnel',
      'Embed verified settlement outcome badges with practice area attribution',
      'Publish dedicated, schema-optimized landing pages for each major practice focus',
      'Deploy mobile floating emergency contact drawer for immediate phone intake'
    ],
    beforeAfter: {
      beforeMetric: '1.1% Inquiry Rate',
      beforeState: 'Mobile visitors clicked paid ads but abandoned the complex contact form.',
      afterMetric: '3.4% Inquiry Rate',
      afterState: 'Conversational 2-step mobile intake tripled monthly consultation bookings.',
      revenueLift: '+$220k in Signed Retainers'
    },
    agencyRoi: {
      closedRetainer: '$36,000 Fixed Fee Redesign & CRO Contract',
      pitchTimeSaved: '5.5 hours of manual audit preparation',
      winRate: 'Closed on First Managing Partner Review'
    }
  },

  'marketing-agency-retainer-expansion': {
    slug: 'marketing-agency-retainer-expansion',
    title: 'How a Marketing Agency Pitched a $28,000 Retainer Expansion Using Competitor Gap Analysis',
    companyName: 'Elevation Marketing & Media',
    industry: 'Full-Service Marketing Agency Upsell',
    opportunityValue: '$28,000',
    potentialValueRange: '$25,000 - $35,000',
    auditDuration: '46 seconds',
    agencyType: 'Full-Service Digital & Growth Marketing Agency',
    summary: 'Elevation Marketing used LeadPilot Software Competitor Gap Analysis to benchmark their existing client against 3 aggressive market rivals, surfacing 4 critical capability deficits and closing an immediate $28,000 upsell.',
    problem: 'The client was questioning marketing ROI as competitors launched modern interactive tools, programmatic comparisons, and automated lead capture magnets.',
    evidence: 'LeadPilot Software Competitor Gap Sandbox surfaced 4 verified capability gaps: absence of an interactive pricing estimator, no verified case proof widgets, missing comparison tables, and 2.4x slower mobile load speed.',
    opportunity: 'Build interactive ROI tools, launch programmatic competitor comparison hubs, and upgrade technical page speed to protect market leadership.',
    solution: 'Presented visual Competitor Gap Sandbox models and live deliverable roadmaps during the quarterly business review (QBR), securing instant budget approval.',
    problemsFound: [
      'Top 3 competitors offered interactive self-serve estimators while the client offered only static PDFs',
      'Missing customer proof widgets and video case studies that rivals showcased on homepages',
      'Competitors ranked for 40+ competitor comparison keywords where the client had zero visibility',
      'Mobile page speed lagged behind top competitors by 2.4 seconds'
    ],
    opportunitiesFound: [
      'Interactive Estimator Tool: Capture enterprise prospects earlier in the buyer journey',
      'Programmatic Comparison Hub: Win search traffic for "[Client] vs [Competitor]" queries',
      'Video Case Study Integration: Accelerate sales cycle for high-ticket deals',
      'Speed Optimization: Prevent bounce rate on paid ad campaigns'
    ],
    suggestedSolutions: [
      'Develop embedded interactive ROI and cost estimator sandbox',
      'Launch 6 dedicated comparison landing pages with transparent feature grids',
      'Implement video testimonial carousel with schema markup',
      'Refactor scripts and assets to achieve sub-1.5s mobile speed'
    ],
    beforeAfter: {
      beforeMetric: 'Zero Comparison Search Traffic',
      beforeState: 'Competitors were intercepting buyers searching for alternative solutions.',
      afterMetric: 'Rank #1 for 12 Comparison Queries',
      afterState: 'Comparison hub captured qualified high-intent buyers ready to switch providers.',
      revenueLift: '+$31,500 Monthly Recurring Revenue'
    },
    agencyRoi: {
      closedRetainer: '$28,000 Retainer Expansion Sprint',
      pitchTimeSaved: '7 hours of competitive research',
      winRate: 'Approved Within 24 Hours of QBR'
    }
  }
};

// Aliases for backwards compatibility with earlier URLs
CASE_STUDIES['saas-scale-website-revamp'] = CASE_STUDIES['watermark-resize-studio'];
CASE_STUDIES['ecommerce-conversion-audit'] = CASE_STUDIES['marketing-agency-retainer-expansion'];
CASE_STUDIES['healthcare-seo-expansion'] = CASE_STUDIES['dental-practice-audit'];

module.exports = { CASE_STUDIES };
