import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  title: string;
  text: string;
  html: string;
  status: number;
}

export interface DiscoveredPage {
  url: string;
  title: string;
  category: string;
  depth: number;
  status: 'Crawled' | 'Skipped (Capped)' | 'Failed';
  textLength: number;
  snippet?: string;
  discoveredFrom?: string;
}

export interface CrawlDiagnostics {
  pagesDiscovered: number;
  pagesCrawled: number;
  pagesSkipped: number;
  crawlDurationMs: number;
  totalTextExtracted: number;
  coveragePercentage: number;
  warningMessage?: string;
}

export interface CrawledPage {
  url: string;
  title: string;
  category: string;
  depth: number;
  text: string;
}

export interface CrawlData {
  companyName: string;
  websiteUrl: string;
  pages: CrawledPage[];
  discoveredPages: DiscoveredPage[];
  diagnostics: CrawlDiagnostics;
  combinedContent: string;
}

const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 4500,
  maxRedirects: 5,
  validateStatus: () => true
};

const PRIORITY_CATEGORIES: { category: string; weight: number; keywords: string[] }[] = [
  { category: 'Homepage', weight: 100, keywords: ['/'] },
  { category: 'Pricing', weight: 95, keywords: ['pricing', 'price', 'plans', 'plan', 'tier', 'cost', 'subscription', 'rates'] },
  { category: 'Products', weight: 92, keywords: ['product', 'products', 'app', 'apps', 'tool', 'tools', 'platform', 'software'] },
  { category: 'Services', weight: 90, keywords: ['service', 'services', 'offering', 'offerings', 'solution', 'solutions', 'consulting'] },
  { category: 'Features', weight: 88, keywords: ['feature', 'features', 'capability', 'capabilities', 'tech', 'technology', 'how-it-works'] },
  { category: 'About', weight: 82, keywords: ['about', 'about-us', 'company', 'story', 'mission', 'team', 'who-we-are', 'leadership'] },
  { category: 'Careers', weight: 78, keywords: ['career', 'careers', 'job', 'jobs', 'hiring', 'join-us', 'work-with-us', 'openings'] },
  { category: 'FAQ', weight: 75, keywords: ['faq', 'faqs', 'frequently-asked-questions', 'help', 'support', 'q-and-a'] },
  { category: 'Blog', weight: 70, keywords: ['blog', 'article', 'articles', 'post', 'posts', 'news', 'press', 'insights'] },
  { category: 'Resources', weight: 68, keywords: ['resource', 'resources', 'guide', 'guides', 'case-study', 'case-studies', 'whitepaper', 'docs', 'documentation'] },
  { category: 'Contact', weight: 65, keywords: ['contact', 'contact-us', 'reach-us', 'book', 'demo', 'get-in-touch', 'talk-to-us'] },
  { category: 'Terms', weight: 55, keywords: ['terms', 'terms-of-service', 'tos', 'terms-and-conditions', 'legal'] },
  { category: 'Privacy', weight: 50, keywords: ['privacy', 'privacy-policy', 'privacy-notice', 'gdpr'] }
];

const DISALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
  '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv',
  '.css', '.js', '.json', '.xml', '.rss',
  '.woff', '.woff2', '.ttf', '.eot',
  '.exe', '.dmg', '.pkg'
];

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, head, nav, footer, iframe, noscript, svg, img, header, aside, .cookie-banner, .banner').remove();
  
  $('br, hr, p, div, li, h1, h2, h3, h4, h5, h6').each(function() {
    $(this).append(' ');
  });

  return $.text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000); // 3000 chars per page provides high density without blowing token budget
}

export function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    // Strip trailing slash for consistency (unless root)
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

export function classifyUrl(url: string, anchorText?: string): { category: string; weight: number } {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase() + ' ' + (anchorText || '').toLowerCase();
    
    if (parsed.pathname === '/' || parsed.pathname === '') {
      return { category: 'Homepage', weight: 100 };
    }

    for (const item of PRIORITY_CATEGORIES) {
      if (item.category === 'Homepage') continue;
      for (const kw of item.keywords) {
        if (path.includes(kw)) {
          return { category: item.category, weight: item.weight };
        }
      }
    }
    return { category: 'General', weight: 20 };
  } catch (e) {
    return { category: 'General', weight: 10 };
  }
}

function isDisallowedExtension(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    return DISALLOWED_EXTENSIONS.some(ext => pathname.endsWith(ext));
  } catch (e) {
    return false;
  }
}

export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  const normalized = normalizeUrl(url);
  if (isDisallowedExtension(normalized)) {
    return null;
  }

  try {
    let finalUrl = normalized;
    let config = { ...AXIOS_CONFIG };

    const proxyApiKey = process.env.SCRAPING_PROXY_API_KEY;
    const proxyService = (process.env.SCRAPING_PROXY_SERVICE || 'scrapingbee').toLowerCase();

    if (proxyApiKey) {
      if (proxyService === 'scrapingbee') {
        finalUrl = `https://app.scrapingbee.com/api/v1/?api_key=${proxyApiKey}&url=${encodeURIComponent(normalized)}&render_js=false`;
        config.timeout = 15000;
      } else if (proxyService === 'zenrows') {
        finalUrl = `https://api.zenrows.com/v1/?apikey=${proxyApiKey}&url=${encodeURIComponent(normalized)}`;
        config.timeout = 15000;
      }
    }

    const response = await axios.get(finalUrl, config);
    if (response.status >= 400 || typeof response.data !== 'string') {
      return null;
    }

    const html = response.data;
    const $ = cheerio.load(html);
    const title = $('title').text().trim() || new URL(normalized).pathname || normalized;
    const text = cleanText(html);

    return {
      url: normalized,
      title,
      text,
      html,
      status: response.status
    };
  } catch (error: any) {
    return null;
  }
}

function extractLinksFromHtml(html: string, currentUrl: string, baseDomain: string): { url: string; anchorText: string }[] {
  const links: { url: string; anchorText: string }[] = [];
  if (!html) return links;

  try {
    const $ = cheerio.load(html);
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const anchorText = $(element).text().trim();
      if (!href) return;

      const lowerHref = href.toLowerCase().trim();
      if (lowerHref.startsWith('mailto:') || lowerHref.startsWith('tel:') || lowerHref.startsWith('javascript:') || lowerHref.startsWith('#')) {
        return;
      }

      try {
        let abs = new URL(href, currentUrl).toString();
        abs = abs.split('#')[0]; // Strip fragment
        const urlObj = new URL(abs);
        const linkDomain = urlObj.hostname.replace(/^www\./i, '');

        if (linkDomain === baseDomain && !isDisallowedExtension(abs)) {
          // Normalize trailing slash
          if (urlObj.pathname.length > 1 && urlObj.pathname.endsWith('/')) {
            urlObj.pathname = urlObj.pathname.slice(0, -1);
          }
          links.push({ url: urlObj.toString(), anchorText });
        }
      } catch (err) {
        // Skip invalid URL
      }
    });
  } catch (err) {
    // Cheerio parse error
  }

  return links;
}

export async function crawlWebsite(targetUrl: string, maxPages: number = 20, maxDepth: number = 2): Promise<CrawlData> {
  const startTime = Date.now();
  const normalizedBase = normalizeUrl(targetUrl);
  const baseDomain = new URL(normalizedBase).hostname.replace(/^www\./i, '');
  const fallbackName = baseDomain.split('.')[0].toUpperCase() || 'Target Company';

  // Tracking containers
  const discoveredMap = new Map<string, {
    url: string;
    title: string;
    category: string;
    weight: number;
    depth: number;
    discoveredFrom?: string;
  }>();

  const crawledPages: CrawledPage[] = [];
  const crawledUrls = new Set<string>();

  // 1. Initialize with Homepage (Depth 0)
  const homeCategory = classifyUrl(normalizedBase);
  discoveredMap.set(normalizedBase, {
    url: normalizedBase,
    title: 'Homepage',
    category: 'Homepage',
    weight: homeCategory.weight,
    depth: 0,
  });

  // 2. Scrape Homepage
  const homepageResult = await scrapeUrl(normalizedBase);
  if (!homepageResult || homepageResult.text.length < 50) {
    const elapsed = Date.now() - startTime;
    return {
      companyName: fallbackName,
      websiteUrl: normalizedBase,
      pages: [],
      discoveredPages: [
        {
          url: normalizedBase,
          title: fallbackName,
          category: 'Homepage',
          depth: 0,
          status: 'Failed',
          textLength: 0,
          snippet: 'Homepage request blocked or returned no content.'
        }
      ],
      diagnostics: {
        pagesDiscovered: 1,
        pagesCrawled: 0,
        pagesSkipped: 1,
        crawlDurationMs: elapsed,
        totalTextExtracted: 0,
        coveragePercentage: 0,
        warningMessage: 'Direct website crawler was blocked or returned no textual content.'
      },
      combinedContent: `<crawling_failed domain="${baseDomain}" companyName="${fallbackName}" url="${normalizedBase}" />`
    };
  }

  // Record successful homepage
  crawledPages.push({
    url: homepageResult.url,
    title: homepageResult.title,
    category: 'Homepage',
    depth: 0,
    text: homepageResult.text
  });
  crawledUrls.add(homepageResult.url);

  // Discover Level 1 internal links from Homepage
  const level1Links = extractLinksFromHtml(homepageResult.html, homepageResult.url, baseDomain);
  for (const link of level1Links) {
    if (!discoveredMap.has(link.url)) {
      const cls = classifyUrl(link.url, link.anchorText);
      discoveredMap.set(link.url, {
        url: link.url,
        title: link.anchorText || link.url,
        category: cls.category,
        weight: cls.weight,
        depth: 1,
        discoveredFrom: homepageResult.url
      });
    }
  }

  // Helper to get remaining un-crawled candidates sorted by priority
  const getSortedQueue = () => {
    return Array.from(discoveredMap.values())
      .filter(item => !crawledUrls.has(item.url) && item.depth <= maxDepth)
      .sort((a, b) => {
        // High priority weight first; if tied, lower depth first
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        return a.depth - b.depth;
      });
  };

  // 3. Multi-Page BFS Crawler Loop (Batches of 5, up to maxPages)
  const BATCH_SIZE = 5;
  while (crawledPages.length < maxPages) {
    const queue = getSortedQueue();
    if (queue.length === 0) break;

    const currentBatch = queue.slice(0, Math.min(BATCH_SIZE, maxPages - crawledPages.length));
    
    // Concurrently fetch the batch
    const scrapeTasks = currentBatch.map(async item => {
      const res = await scrapeUrl(item.url);
      return { item, res };
    });

    const batchResults = await Promise.allSettled(scrapeTasks);

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        const { item, res } = result.value;
        crawledUrls.add(item.url);

        if (res && res.text.length > 50) {
          crawledPages.push({
            url: res.url,
            title: res.title || item.title,
            category: item.category,
            depth: item.depth,
            text: res.text
          });

          // If this was a depth 1 page and depth limit allows, discover depth 2 links
          if (item.depth === 1 && maxDepth >= 2) {
            const level2Links = extractLinksFromHtml(res.html, res.url, baseDomain);
            for (const l2 of level2Links) {
              if (!discoveredMap.has(l2.url)) {
                const cls = classifyUrl(l2.url, l2.anchorText);
                discoveredMap.set(l2.url, {
                  url: l2.url,
                  title: l2.anchorText || l2.url,
                  category: cls.category,
                  weight: cls.weight,
                  depth: 2,
                  discoveredFrom: res.url
                });
              }
            }
          }
        }
      }
    }
  }

  const elapsed = Date.now() - startTime;
  const totalDiscovered = discoveredMap.size;
  const totalCrawled = crawledPages.length;
  const totalSkipped = Math.max(0, totalDiscovered - totalCrawled);
  const totalTextExtracted = crawledPages.reduce((acc, p) => acc + p.text.length, 0);
  const coveragePercentage = totalDiscovered > 0 ? Math.min(100, Math.round((totalCrawled / totalDiscovered) * 100)) : 100;

  // Build Discovered Pages Inventory for Evidence Vault
  const discoveredPages: DiscoveredPage[] = Array.from(discoveredMap.values()).map(item => {
    const isCrawled = crawledUrls.has(item.url);
    const crawledMatch = crawledPages.find(p => p.url === item.url);
    return {
      url: item.url,
      title: crawledMatch?.title || item.title,
      category: item.category,
      depth: item.depth,
      status: isCrawled ? 'Crawled' : 'Skipped (Capped)',
      textLength: crawledMatch?.text.length || 0,
      snippet: crawledMatch ? crawledMatch.text.slice(0, 160) + '...' : undefined,
      discoveredFrom: item.discoveredFrom
    };
  });

  // 4. Build Structured Multi-Page XML Context for Gemini
  let combinedContent = `<website url="${normalizedBase}" pagesDiscovered="${totalDiscovered}" pagesCrawled="${totalCrawled}" coverage="${coveragePercentage}%">\n\n`;
  crawledPages.forEach(p => {
    combinedContent += `<page url="${p.url}" title="${p.title}" category="${p.category}" depth="${p.depth}">\n`;
    combinedContent += `${p.text}\n`;
    combinedContent += `</page>\n\n`;
  });
  combinedContent += `</website>`;

  const companyNameCandidate = homepageResult.title.split('|')[0].split('-')[0].trim() || fallbackName;

  const warningMessage = totalCrawled <= 1
    ? 'Limited website coverage may reduce analysis quality.'
    : undefined;

  return {
    companyName: companyNameCandidate,
    websiteUrl: normalizedBase,
    pages: crawledPages,
    discoveredPages,
    diagnostics: {
      pagesDiscovered: totalDiscovered,
      pagesCrawled: totalCrawled,
      pagesSkipped: totalSkipped,
      crawlDurationMs: elapsed,
      totalTextExtracted,
      coveragePercentage,
      warningMessage
    },
    combinedContent
  };
}
