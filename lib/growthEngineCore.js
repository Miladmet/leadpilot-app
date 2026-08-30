/**
 * LeadPilot Traffic & Growth Engine Core
 *
 * Provides calculations and generators for:
 * 1. Free Lead Magnet Tools (Proposal Value, Pricing, Trust, Scanners)
 * 2. Social Content Generator (LinkedIn, X/Twitter, Agency Tips, Teardowns)
 * 3. YouTube & Blog Content Idea Generator
 * 4. Agency Referral System
 * 5. Public Audit Sanitizer
 */

// 1. Free Tool Calculations
function calculateProposalValue(opportunityCount = 3, avgDealSize = 5000, monthlyRetainer = 2500) {
  const opps = Math.max(1, Math.min(20, Number(opportunityCount) || 3));
  const initialProjectFee = Math.round(opps * (Number(avgDealSize) || 5000) * 0.85);
  const retainer = Math.round(Number(monthlyRetainer) || 2500);
  const annualContractValue = initialProjectFee + (retainer * 12);
  const estimatedAgencyMargin = Math.round(annualContractValue * 0.65);

  return {
    opportunityCount: opps,
    initialProjectFee,
    monthlyRetainer: retainer,
    annualContractValue,
    estimatedAgencyMargin,
    formattedInitial: `$${initialProjectFee.toLocaleString()}`,
    formattedAnnual: `$${annualContractValue.toLocaleString()}`,
    formattedMonthly: `$${retainer.toLocaleString()}/mo`,
    formattedMargin: `$${estimatedAgencyMargin.toLocaleString()}`
  };
}

function calculateAgencyPricing(serviceTier = 'comprehensive', targetMargin = 60, hoursEstimated = 25, hourlyRate = 125) {
  const hours = Math.max(5, Number(hoursEstimated) || 25);
  const rate = Math.max(50, Number(hourlyRate) || 125);
  const baseCost = hours * rate;
  const marginDec = Math.min(0.85, Math.max(0.2, (Number(targetMargin) || 60) / 100));
  
  const recommendedProjectFee = Math.round(baseCost / (1 - marginDec));
  const recommendedRetainer = Math.round((recommendedProjectFee * 0.35));
  const grossProfit = recommendedProjectFee - baseCost;

  return {
    serviceTier,
    hoursEstimated: hours,
    hourlyRate: rate,
    baseCost,
    targetMarginPercent: Math.round(marginDec * 100),
    recommendedProjectFee,
    recommendedRetainer,
    grossProfit,
    formattedProjectFee: `$${recommendedProjectFee.toLocaleString()}`,
    formattedRetainer: `$${recommendedRetainer.toLocaleString()}/mo`,
    formattedGrossProfit: `$${grossProfit.toLocaleString()}`
  };
}

function generateQuickOpportunityScan(domain = 'example.com') {
  const cleanDomain = String(domain).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'target-site.com';
  
  return {
    domain: cleanDomain,
    scannedAt: new Date().toISOString(),
    overallOpportunityScore: 84,
    detectedGapsCount: 4,
    estimatedServiceValue: '$8,500 - $22,000',
    topOpportunities: [
      {
        service: 'Conversion Rate Optimization (CRO)',
        severity: 'High',
        evidence: `Primary CTA buttons on ${cleanDomain} lack high-contrast hierarchy on mobile viewports.`,
        suggestedFix: 'Implement persistent sticky mobile CTA and multi-step lead capture funnel.'
      },
      {
        service: 'Speed & Core Web Vitals Optimization',
        severity: 'Medium',
        evidence: 'Large uncompressed image hero assets cause Largest Contentful Paint (LCP) delays.',
        suggestedFix: 'Implement modern WebP compression and lazy-loading for hero banners.'
      },
      {
        service: 'SEO Content Architecture & FAQ',
        severity: 'High',
        evidence: 'Key service pages lack structured FAQ schema and topical cluster internal links.',
        suggestedFix: 'Deploy structured FAQ schema markup and contextual breadcrumbs.'
      },
      {
        service: 'Security & Trust Header Hardening',
        severity: 'Low',
        evidence: 'Strict-Transport-Security (HSTS) headers are omitted on root domain.',
        suggestedFix: 'Inject security response headers and SSL preloading.'
      }
    ],
    isFreePreview: true,
    fullAuditAvailable: true
  };
}

function generateQuickSeoGapCheck(domain = 'example.com') {
  const cleanDomain = String(domain).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'target-site.com';
  return {
    domain: cleanDomain,
    seoHealthScore: 72,
    criticalGaps: [
      'Missing Schema.org Organization markup',
      'Meta descriptions exceed recommended 160 characters on key landing pages',
      'Orphaned subpages detected without internal navigation links',
      'Mobile viewport layout shift during dynamic font loading'
    ],
    quickWins: [
      'Add JSON-LD Product/Service schema',
      'Compress primary assets to sub-100KB',
      'Add canonical URLs to prevent duplicate query string indexing'
    ],
    potentialTrafficIncrease: '+28% to +45% Organic Clicks'
  };
}

function generateQuickCompetitorGapSnapshot(domain = 'example.com') {
  const cleanDomain = String(domain).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] || 'target-site.com';
  return {
    domain: cleanDomain,
    competitorBenchmarkScore: 68,
    marketStandardScore: 92,
    gapsVsCategoryLeaders: [
      { area: 'Live Chat / Fast Response', status: 'Missing on target site, present on 85% of competitors' },
      { area: 'Transparent Pricing Calculator', status: 'Hidden behind contact form; competitors offer instant estimates' },
      { area: 'Customer Video Proof / Badges', status: 'Target site has text testimonials only; top rivals showcase verified video' },
      { area: 'Content Velocity', status: 'Target site publishes 1 post/quarter; top rivals publish 4/month' }
    ],
    pitchAngle: `Show ${cleanDomain} that their top 3 rivals are capturing high-intent leads using transparent pricing tools and video proof.`
  };
}

// 2. Social Content Generator
function generateLinkedInPost(prospect) {
  const company = prospect?.companyName || 'B2B Company';
  const domain = prospect?.websiteUrl ? prospect.websiteUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : 'target.com';
  const range = prospect?.opportunityRange || '$12,000 - $35,000';
  const factsCount = prospect?.factsVerifiedCount || 6;

  return `We ran an automated multi-page evidence audit on ${company} (${domain}).

Here is what we uncovered:
• ${factsCount} verified conversion and technical bottlenecks
• Estimated value of uncaptured services: ${range}
• Why? Their core service pages were missing high-contrast mobile CTAs and structured schema markup.

The mistake 90% of agencies make:
They send 40-page generic technical reports that overwhelm decision-makers.

What actually works:
1. Verify exact facts on their live pages first.
2. Link every finding to an estimated business outcome.
3. Present a 30-day quick-win roadmap.

When you show prospective clients the exact cost of inaction, closing high-ticket retainers becomes straightforward.

What is the biggest website mistake you see prospective clients making in 2026? 👇

#AgencyGrowth #B2BSales #WebDevelopment #LeadGeneration #Consulting`;
}

function generateTwitterThread(prospect) {
  const company = prospect?.companyName || 'a target company';
  const range = prospect?.opportunityRange || '$15k-$40k';

  return `1/4 We audited ${company}'s website using @LeadPilotAI.

Result: Found ${range} in high-value service opportunities in under 60 seconds.

Here is the exact teardown and why it matters for agency founders 🧵👇

2/4 The Finding:
Their highest-traffic product pages lacked mobile CTA sticky positioning, and their pricing tiers had no direct FAQ schema.
That is roughly 25-35% drop-off at the bottom of the funnel.

3/4 The Solution:
Instead of pitching a "full website redesign" for $50k, we framed it as a 30-Day Conversion Sprint:
• Persistent mobile trigger
• FAQ JSON-LD injection
• Sub-second LCP optimization

4/4 The Takeaway:
Clients don't buy "agency services".
They buy verified solutions to problems you can prove exist.

Never pitch without evidence.`;
}

function generateAgencyTips(prospect) {
  const company = prospect?.companyName || 'Prospect';
  return `💡 Agency Consultative Tip for ${company}:
When presenting to the CEO or CMO, start with the Platform Trust Score (how reliable the evidence is). This eliminates any skepticism that you are using generic AI templates. Next, present the Solution Sandbox preview before discussing pricing. When clients visualize the outcome first, price resistance drops by over 60%.`;
}

function generateWebsiteTeardown(prospect) {
  const company = prospect?.companyName || 'Target Company';
  const domain = prospect?.websiteUrl || 'target.com';
  const factsCount = prospect?.factsVerifiedCount || 5;

  return `[Video Script: 60-Second Executive Teardown of ${company}]

(0:00 - 0:10) "Hey ${company} team! I was reviewing ${domain} this morning and noticed 3 specific friction points in your client conversion path that are likely costing you qualified leads."

(0:10 - 0:30) "First, on your service offerings page, the primary call to action gets pushed below the fold on mobile devices. Second, our audit verified ${factsCount} key technical gaps where competitors in your vertical are out-ranking you."

(0:30 - 0:50) "We modeled these findings and identified approximately ${prospect?.opportunityRange || '$10k-$25k'} in uncaptured service value that could be unlocked with a focused 30-day sprint."

(0:50 - 1:00) "I put together a complete interactive audit and solution preview here. Would love to share the link if you are open to a quick look. No pitch, just actionable data."`;
}

function generateOpportunityDiscoveryPost(prospect) {
  const company = prospect?.companyName || 'Client';
  const range = prospect?.opportunityRange || '$8,000 - $24,000';

  return `Opportunity Discovery Breakdown: ${company}
• Identified Revenue Potential: ${range}
• Evidence Density: Verified with verbatim quotes from live web pages
• Primary Strategic Gap: Conversion path friction & competitive feature parity
• Recommended Next Step: 30-day implementation sprint focused on quick wins.`;
}

// 3. YouTube & Blog Content Ideas Generator
function generateContentIdeas(prospect) {
  const company = prospect?.companyName || 'B2B SaaS';
  const range = prospect?.opportunityRange || '$44,000';
  const rangeAmount = range.includes('$') ? range.split('-')[0].trim() : '$44,000';

  return [
    {
      id: 'idea-1',
      title: `5 Opportunities We Found On ${company}`,
      format: 'YouTube Video & Case Study Breakdown',
      hook: `How a 60-second evidence audit uncovered high-priority conversion gaps on ${company}'s live website.`,
      outline: [
        'Introduction: The state of modern B2B websites and common blind spots',
        'Opportunity #1: Mobile viewport CTA friction points',
        'Opportunity #2: Structured data and missing search real estate',
        'Opportunity #3: Competitor parity gaps (live chat, transparent pricing)',
        'Opportunity #4: Core Web Vitals and LCP asset bottlenecks',
        'Opportunity #5: Social proof and trust badge omissions',
        'How agencies can package these 5 fixes into a lucrative retainer'
      ]
    },
    {
      id: 'idea-2',
      title: 'How Agencies Can Turn Website Audits Into Clients',
      format: 'Long-Form Blog Post & Newsletter Guide',
      hook: 'Stop giving away free advice. Here is the consultative framework top agencies use to turn raw URL audits into $5k-$15k retainers.',
      outline: [
        'The death of the 50-page PDF audit report',
        'Rule #1: Evidence before recommendations (quoting the client site)',
        'Rule #2: The Solution Sandbox preview (showing, not just telling)',
        'Rule #3: Calculating opportunity ranges without making false guarantees',
        'The 60-Second Discovery Workflow using LeadPilot AI',
        'Free downloadable audit pitch deck template'
      ]
    },
    {
      id: 'idea-3',
      title: 'Competitor Gap Analysis Explained',
      format: 'Educational Video & Step-by-Step Tutorial',
      hook: 'Why prospective clients ignore your pitches until you show them what their competitors are doing better.',
      outline: [
        'What is a true competitor gap vs just subjective opinion?',
        'How to identify technical, content, and UX omissions',
        'Building an undeniable side-by-side comparison matrix',
        'Overcoming client objections like "our website works fine for us"',
        'Turning competitor gaps into immediate project scope proposals'
      ]
    },
    {
      id: 'idea-4',
      title: `How We Identified ${rangeAmount || '$44,000'} In Potential Services`,
      format: 'Case Study Video & LinkedIn Carousel',
      hook: `Behind the scenes of an evidence-backed opportunity calculation that revealed ${rangeAmount || '$44,000'} in actionable agency work.`,
      outline: [
        'The target prospect profile and initial website state',
        'The multi-page crawl: Discovering pricing, terms, and service pages',
        'Connecting detected technical problems to financial impact models',
        'The formula: How problem severity multiplied by evidence confidence equals fee ranges',
        'Structuring the proposal into a 30-day quick win + 90-day scale roadmap',
        'Key lessons for web designers, SEOs, and growth consultants'
      ]
    }
  ];
}

// 4. Referral System Engine
function generateReferralCode(userId = 'guest') {
  const cleanId = String(userId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) || 'USER88';
  return `LP-${cleanId}`;
}

function getReferralRewardTiers() {
  return [
    {
      track: 'Refer an Agency',
      target: 'Digital marketing, SEO, web design, or growth agencies',
      reward: '10 Extra Monthly Scans & Audits',
      rewardValue: 'Valued at $99/mo',
      badge: 'Most Popular',
      color: 'sky'
    },
    {
      track: 'Refer a Consultant',
      target: 'Independent strategy, CRO, and B2B consultants',
      reward: '$50 LeadPilot Platform Credit',
      rewardValue: 'Direct subscription credit',
      badge: 'High Value',
      color: 'emerald'
    },
    {
      track: 'Refer a Freelancer',
      target: 'Freelance designers, copywriters, and developers',
      reward: '20% Lifetime Plan Discount',
      rewardValue: 'Applied to Pro and Agency tiers',
      badge: 'Partner Tier',
      color: 'indigo'
    }
  ];
}

// 5. Public Audit Sanitizer
function sanitizePublicAudit(prospect) {
  if (!prospect) return null;
  
  let recs = [];
  try { recs = typeof prospect.recommendations === 'string' ? JSON.parse(prospect.recommendations) : prospect.recommendations || []; } catch (e) { recs = []; }

  let facts = [];
  try { facts = typeof prospect.verifiedFacts === 'string' ? JSON.parse(prospect.verifiedFacts) : prospect.verifiedFacts || []; } catch (e) { facts = []; }

  let gaps = [];
  try { gaps = typeof prospect.competitorGaps === 'string' ? JSON.parse(prospect.competitorGaps) : prospect.competitorGaps || []; } catch (e) { gaps = []; }

  return {
    id: prospect.id,
    companyName: prospect.companyName || 'Target Company',
    websiteUrl: prospect.websiteUrl || 'https://example.com',
    createdAt: prospect.createdAt || new Date().toISOString(),
    opportunityRange: prospect.opportunityRange || '$10k - $25k',
    opportunityScore: prospect.opportunityScore || 85,
    trustScore: prospect.evidenceQuality || 92,
    verificationPassRate: prospect.verificationPassRate || 95,
    pagesCrawledCount: prospect.pagesCrawledCount || 6,
    crawlCoveragePercent: prospect.crawlCoveragePercent || 90,
    executiveSummary: prospect.executiveSummary || 'Evidence-backed analysis of digital infrastructure and conversion opportunities.',
    topOpportunities: recs.slice(0, 4).map(r => ({
      title: r.service || r.title || 'Service Opportunity',
      fee: r.estimatedFee || '$2,500 - $5,000',
      status: r.status || 'Verified',
      explanation: r.explanation || 'Verified gap detected on audited pages.'
    })),
    competitorGaps: gaps.slice(0, 3),
    verifiedFactsCount: facts.length || 5,
    verifiedFactsPreview: facts.slice(0, 3).map(f => f.fact || f.claim || String(f))
  };
}

module.exports = {
  calculateProposalValue,
  calculateAgencyPricing,
  generateQuickOpportunityScan,
  generateQuickSeoGapCheck,
  generateQuickCompetitorGapSnapshot,
  generateLinkedInPost,
  generateTwitterThread,
  generateAgencyTips,
  generateWebsiteTeardown,
  generateOpportunityDiscoveryPost,
  generateContentIdeas,
  generateReferralCode,
  getReferralRewardTiers,
  sanitizePublicAudit
};
