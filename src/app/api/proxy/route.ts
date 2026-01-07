import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import dns from 'dns/promises';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    console.log('Received URL:', url); // Debug log
    if (!url || url === '/:path*') { // Verifica si el parámetro es inválido
      console.log('No URL provided or invalid URL parameter');
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Ensure the URL has a valid protocol, default to https:// if missing
    const urlPattern = /^https?:\/\//i;
    let targetUrl = urlPattern.test(url) ? url : `https://${url}`;
    targetUrl = targetUrl.replace(/(https?:\/\/)\/+/g, '$1'); // Clean duplicate slashes
    console.log('Processed targetUrl:', targetUrl);

    try {
      const parsedUrl = new URL(targetUrl);
      if (!parsedUrl.hostname || parsedUrl.hostname.split('.').length < 2) {
        console.log('Invalid hostname:', parsedUrl.hostname);
        return NextResponse.json({ error: 'Invalid hostname in URL' }, { status: 400 });
      }

      // Verificar si el hostname es resolvible
      try {
        await dns.lookup(parsedUrl.hostname);
      } catch {
        console.log('Unresolvable hostname:', parsedUrl.hostname);
        return NextResponse.json({ error: 'Hostname cannot be resolved' }, { status: 400 });
      }
    } catch (error) {
      console.log('Invalid URL:', targetUrl);
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const googlebotSites = ['nytimes.com', 'ft.com', 'washingtonpost.com'];
    const genericHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    };
    const googlebotHeaders = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.119 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    };

    const fetchPage = async (url: string, headers: object, retries: number = 3): Promise<string> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(url, { headers, timeout: 10000 });
          return response.data;
        } catch (error: unknown) {
          console.warn(`Attempt ${attempt} failed:`, (error as Error).message || String(error));
          if (attempt === retries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      throw new Error('Failed to fetch content after retries');
    };

    const useGooglebot = googlebotSites.some(site => targetUrl.includes(site));
    const html = await fetchPage(targetUrl, useGooglebot ? googlebotHeaders : genericHeaders);
    const $ = cheerio.load(html);

    // Try to extract content from JSON-LD (NewsArticle or Article)
    let extractedContent = '';
    try {
      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).text() || '{}');
          // Handle array of objects or single object
          const items = Array.isArray(json) ? json : [json];

          for (const item of items) {
            const type = item['@type'];
            // Check if it's a NewsArticle or Article and has articleBody
            if (
              (type === 'NewsArticle' || type === 'Article' || (Array.isArray(type) && (type.includes('NewsArticle') || type.includes('Article')))) &&
              item.articleBody
            ) {
              extractedContent = item.articleBody;
              return false; // Break loop
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      });
    } catch (e) {
      console.log('Error extracting JSON-LD:', e);
    }

    // If we extracted content, format it and prepare to inject
    if (extractedContent) {
      console.log('Extracted content length:', extractedContent.length);

      // Create a clean container for the extracted content
      // Use whitespace-pre-line to preserve newlines if they exist, and try to match the site's basic typography
      // We add 'cuerpo-texto' class if it exists in the site css to reuse styles, otherwise our generic prose
      const bypassContainer = `
         <div id="lscr-bypass-content" class="lscr-injected-content max-w-screen-md mx-auto px-4 py-8 bg-white" style="text-align: left !important;">
           <div class="mb-8 flex items-center justify-center">
             <span class="inline-flex items-center gap-x-3 rounded-full bg-emerald-50 px-6 py-2.5 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 shadow-md">
               &nbsp;
               <span class="animate-pulse text-base">🔓</span>
               <span>Premium Article Unlocked by <strong>{lscr}</strong></span>
              &nbsp;
               </span>
           </div>
           <article class="prose lg:prose-xl max-w-none whitespace-pre-line leading-relaxed text-gray-900 font-serif text-lg">
             ${extractedContent}
           </article>
         </div>
       `;

      // Strategy: Remove potential paywall/content containers
      // Common content containers
      $('article, [role="main"], .main-content, .article-body, .entry-content').not(':has(h1)').remove();

      // ABC.es specific cleanup: Remove the "faded" text and paywall overlay
      // The teaser text usually lives in paragraphs inside .voc-d or .voc-c-container
      $('.voc-d p').remove();
      $('div[class*="paywall"]').remove();
      $('div[class*="subscriber"]').remove();
      $('div[class*="premium"]').remove();
      $('section[class*="paywall"]').remove();

      // Smart Injection: Try to find where the content should go
      let injected = false;

      // 1. ABC.es specific anchor: .voc-d (Author/Date section)
      // We want to inject AFTER the author/social sharing info, which is inside .voc-d
      // The author info is typically in 'div.voc-author'

      const authorSection = $('.voc-author').last();
      if (authorSection.length) {
        authorSection.after(bypassContainer);
        injected = true;
      } else {
        const abcAnchor = $('.voc-d');
        if (abcAnchor.length) {
          abcAnchor.append(bypassContainer);
          injected = true;
        }
      }

      // 2. Generic anchors: After the main heading or header
      if (!injected) {
        const header = $('header').first();
        if (header.length) {
          header.after(bypassContainer);
          injected = true;
        }
      }

      // 3. Generic anchors: After H1
      if (!injected) {
        const h1 = $('h1').first();
        if (h1.length) {
          h1.parent().after(bypassContainer); // Try parent first
          injected = true;
        }
      }

      // Fallback: Prepend to body if nothing else matched
      if (!injected) {
        $('body').prepend(bypassContainer);
      }
    }

    // Add script to block alerts and dialogs before content
    // Add meta tags for cookies and permissions
    $('head').prepend(`
      <meta http-equiv="permissions-policy" content="interest-cohort=(), payment=(), camera=(), microphone=()">
      <meta name="referrer" content="no-referrer">
    `);

    // Remove dialogs and alerts from DOM
    $('div[class*="cookie"]').remove();
    $('div[class*="consent"]').remove();
    $('div[class*="alert"]').remove();
    $('div[id*="cookie"]').remove();
    $('div[id*="consent"]').remove();
    $('div[id*="alert"]').remove();
    $('div[aria-label*="cookie"]').remove();
    $('div[role="alert"]').remove();
    $('[data-cookieconsent]').remove();

    // Remove paywall elements - more specific selectors
    $('div.paywall, .paywall').remove();
    $('div.subscription-wall, .subscription-wall').remove();
    $('div.premium-overlay, .premium-overlay').remove();
    $('div.login-required, .login-required').remove();
    $('div.register-wall, .register-wall').remove();
    $('div.signup-modal, .signup-modal').remove();
    $('div.modal-backdrop, .modal-backdrop').remove();
    $('div.overlay-mask, .overlay-mask').remove();
    $('div.popup-container, .popup-container').remove();
    $('div.banner-adblock, .banner-adblock').remove();
    $('div.content-wall, .content-wall').remove();
    $('[data-paywall="true"]').remove();
    $('[data-subscription="required"]').remove();
    $('[data-premium="overlay"]').remove();

    // Remove common paywall classes from Spanish newspapers - more specific
    $('div.suscripcion-overlay, .suscripcion-overlay').remove();
    $('div.abono-modal, .abono-modal').remove();
    $('div.plus-wall, .plus-wall').remove();
    $('div.pro-banner, .pro-banner').remove();

    // Remove ABC.es specific paywall elements - more specific
    $('div.subscriber-only, .subscriber-only').remove();
    $('div.premium-content-gate, .premium-content-gate').remove();
    $('[data-testid="paywall-overlay"]').remove();
    $('[data-testid="subscription-modal"]').remove();

    // Remove scripts related to paywalls and tracking
    $('script[src*="paywall"]').remove();
    $('script[src*="subscription"]').remove();
    $('script[src*="premium"]').remove();
    $('script[src*="login"]').remove();
    $('script[src*="modal"]').remove();
    $('script[src*="overlay"]').remove();
    $('script[src*="popup"]').remove();
    $('script[src*="banner"]').remove();
    $('script[src*="adblock"]').remove();
    $('script[src*="wall"]').remove();
    $('script:contains("paywall")').remove();
    $('script:contains("subscription")').remove();
    $('script:contains("premium")').remove();
    $('script:contains("login")').remove();

    const parsedUrl = new URL(targetUrl);
    let baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;
    if (parsedUrl.pathname && !parsedUrl.pathname.endsWith('/')) {
      baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1)}`;
    }
    if (!$('base').length) {
      $('head').prepend(`<base href="${baseUrl}">`);
    }
    $('body').append(`
      <div style="position: fixed !important; bottom: 0 !important; right: 0 !important; z-index: 9999 !important; margin: 0 1rem 0 0 !important; padding: 0.5rem 1rem !important; background-color: #6ee7b7 !important; border: 1px solid #10b981 !important; border-bottom: none !important; border-top-left-radius: 0.5rem !important; border-top-right-radius: 0.5rem !important; font-size: 0.875rem !important; line-height: 1.25rem !important; color: #374151 !important; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06) !important;">
        <strong>Website cleaned by <a href="https://lscr.xyz" target="_blank" style="color: inherit !important; text-decoration: none !important; font-weight: inherit !important;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">{lscr}</a></strong>
      </div>
    `);

    const processedHtml = $.html();
    return NextResponse.json({ html: processedHtml });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}