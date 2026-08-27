import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapeResult {
  url: string;
  title: string;
  text: string;
}

export interface CrawlData {
  companyName: string;
  websiteUrl: string;
  pages: ScrapeResult[];
  combinedContent: string;
}

// Set a browser-like User Agent to avoid basic scrapers blocks
const AXIOS_CONFIG = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
  timeout: 8000,
  validateStatus: () => true // Do not throw on 4xx/5xx responses
};

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  // Remove script, style, head, nav, footer, iframe, and noscript elements to keep only content-rich text
  $('script, style, head, nav, footer, iframe, noscript, svg, img, header').remove();
  
  // Replace spacing elements with spaces
  $('br, hr, p, div, li, h1, h2, h3, h4, h5, h6').each(function() {
    $(this).append(' ');
  });

  return $.text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000); // Limit to 3000 chars per page to avoid token waste
}

function normalizeUrl(inputUrl: string): string {
  let url = inputUrl.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  return url;
}

export async function scrapeUrl(url: string): Promise<ScrapeResult | null> {
  const normalized = normalizeUrl(url);
  try {
    const response = await axios.get(normalized, AXIOS_CONFIG);
    if (response.status >= 400) {
      console.warn(`Scrape failed for ${normalized} with status ${response.status}`);
      return null;
    }
    const html = response.data;
    const $ = cheerio.load(html);
    const title = $('title').text().trim() || new URL(normalized).hostname;
    const text = cleanText(html);
    return { url: normalized, title, text };
  } catch (error: any) {
    console.error(`Error scraping URL ${normalized}:`, error.message);
    return null;
  }
}

export async function crawlWebsite(targetUrl: string): Promise<CrawlData> {
  const normalizedBase = normalizeUrl(targetUrl);
  const baseDomain = new URL(normalizedBase).hostname.replace('www.', '');
  
  // 1. Scrape Homepage
  const homepageResult = await scrapeUrl(normalizedBase);
  if (!homepageResult) {
    // If homepage fails, return minimal stub
    const fallbackName = baseDomain.split('.')[0] || 'Target Company';
    return {
      companyName: fallbackName,
      websiteUrl: normalizedBase,
      pages: [],
      combinedContent: `Homepage Scrape Failed. URL: ${normalizedBase}`
    };
  }

  const pages: ScrapeResult[] = [homepageResult];
  
  // 2. Discover Internal Links
  const $ = cheerio.load(homepageResult.text); // Note: homepageResult.text is stripped text, we need the original HTML for links!
  // Wait, let's fetch homepage html again or parse links from the response. Let's do it right.
  let homepageHtml = '';
  try {
    const res = await axios.get(normalizedBase, AXIOS_CONFIG);
    homepageHtml = res.data;
  } catch {
    homepageHtml = '';
  }

  const internalLinks = new Set<string>();
  if (homepageHtml) {
    const $html = cheerio.load(homepageHtml);
    $html('a').each((_, element) => {
      const href = $html(element).attr('href');
      if (!href) return;

      try {
        let absoluteUrl = new URL(href, normalizedBase).toString();
        // Remove hash fragments
        absoluteUrl = absoluteUrl.split('#')[0];
        
        const urlObj = new URL(absoluteUrl);
        const linkDomain = urlObj.hostname.replace('www.', '');

        // Match base domain and check if it is a relevant subpage
        if (linkDomain === baseDomain) {
          const path = urlObj.pathname.toLowerCase();
          const matchKeywords = ['about', 'service', 'career', 'hiring', 'jobs', 'contact', 'solution', 'product', 'team'];
          if (matchKeywords.some(keyword => path.includes(keyword))) {
            internalLinks.add(absoluteUrl);
          }
        }
      } catch (err) {
        // Invalid URL
      }
    });
  }

  // 3. Select top 4 secondary pages
  const urlsToScrape = Array.from(internalLinks).slice(0, 4);
  
  // 4. Scrape concurrently
  const scrapePromises = urlsToScrape.map(url => scrapeUrl(url));
  const results = await Promise.all(scrapePromises);
  
  for (const res of results) {
    if (res && res.text.length > 50) {
      pages.push(res);
    }
  }

  // 5. Build Combined Context
  let combinedContent = `WEBSITE CRAWLED: ${normalizedBase}\n\n`;
  pages.forEach(p => {
    combinedContent += `--- PAGE: ${p.title} (${p.url}) ---\n`;
    combinedContent += `${p.text}\n\n`;
  });

  // Extract company name candidate
  const companyNameCandidate = homepageResult.title.split('|')[0].split('-')[0].trim() || baseDomain.split('.')[0];

  return {
    companyName: companyNameCandidate,
    websiteUrl: normalizedBase,
    pages,
    combinedContent
  };
}
