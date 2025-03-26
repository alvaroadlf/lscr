import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get the URL from query parameters
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Ensure URL has a protocol
    let targetUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = `https://${url}`;
    }

    // Validate the URL format
    try {
      new URL(targetUrl);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // List of sites that will use Googlebot and Flask-like behavior
    const googlebotSites = [
      'nytimes.com',
      'ft.com',
      'washingtonpost.com',
      // Add more sites here as needed
    ];

    // Headers for generic User-Agent and Googlebot
    const genericHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
    };

    const googlebotHeaders = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.119 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
    };

    // Fetch function with retries
    const fetchPage = async (url: string, headers: object, retries: number = 3): Promise<string> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(url, { headers, timeout: 10000 });
          return response.data;
        } catch (error: unknown) {
          // Log warning for each failed attempt, casting error as Error
          console.warn(`Attempt ${attempt} failed:`, (error as Error).message || String(error));
          if (attempt === retries) throw error;
          // Exponential delay between retries
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      throw new Error('Failed to fetch content after retries');
    };

    // Decide which behavior to use based on the domain
    const useGooglebot = googlebotSites.some(site => targetUrl.includes(site));
    let processedHtml;

    if (useGooglebot) {
      // Flask-like behavior for specified sites
      const html = await fetchPage(targetUrl, googlebotHeaders);
      const $ = cheerio.load(html);

      // Add <base> tag for relative URLs (mimicking Flask's add_base_tag)
      const parsedUrl = new URL(targetUrl);
      let baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;
      if (parsedUrl.pathname && !parsedUrl.pathname.endsWith('/')) {
        baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1)}`;
      }
      if (!$('base').length) {
        $('head').prepend(`<base href="${baseUrl}">`);
      }

      // Add attribution banner
      $('body').append(`
        <div style="position: fixed; bottom: 0; right: 0; z-index: 9999; margin: 0 1rem 0 0; padding: 0.5rem 1rem; background-color: #6ee7b7; border: 1px solid #10b981; border-bottom: none; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; color: #374151; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);">
          <strong>Website cleaned by <a href="https://lscr.xyz" target="_blank">{lscr}</a></strong>
        </div>
      `);

      processedHtml = $.html();
    } else {
      // Original Next.js behavior for other sites
      const html = await fetchPage(targetUrl, genericHeaders);
      const $ = cheerio.load(html);

      // Add <base> tag for relative URLs
      const parsedUrl = new URL(targetUrl);
      let baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}/`;
      if (parsedUrl.pathname && !parsedUrl.pathname.endsWith('/')) {
        baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1)}`;
      }
      if (!$('base').length) {
        $('head').prepend(`<base href="${baseUrl}">`);
      }

      // Remove unwanted elements (paywalls, ads, etc.)
      const unwantedSelectors = [
        '.paywall', '.modal', '.overlay', '.subscription', '.login-form', '.register-form', '.limited-access',
        '[id*="verify"]', '[class*="verify"]', '[id*="access"]', '[class*="access"]',
        '.ad', '.advertisement', '[data-ad]', '[data-paywall]', '#paywall', '#ads', '.banner-ad', '.promo',
        '#gateway-content', '.css-1bd8bfl', '[data-testid="inline-subscription-module"]', '.meteredContent',
      ];
      unwantedSelectors.forEach(selector => {
        $(selector).remove();
      });

      // Remove scripts but preserve styles
      $('script').remove();

      // Remove JS event attributes from all elements
      $('*').each(function () {
        const element = $(this);
        if (element[0] && 'attribs' in element[0]) {
          const attributes = element[0].attribs;
          for (const attr in attributes) {
            if (attr.startsWith('on')) {
              element.removeAttr(attr);
            }
          }
        }
      });

      // Process links to point to the proxy
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseProxyUrl = `${protocol}://${host}`;
      $('a').each(function () {
        const href = $(this).attr('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) return;
        try {
          let absoluteUrl;
          if (href.startsWith('http://') || href.startsWith('https://')) {
            absoluteUrl = href;
          } else if (href.startsWith('/')) {
            absoluteUrl = `${new URL(targetUrl).origin}${href}`;
          } else {
            absoluteUrl = new URL(href, targetUrl).href;
          }
          $(this).attr('href', `${baseProxyUrl}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`);
        } catch (error) {
          // Log error if link processing fails
          console.error(`Error processing link: ${href}`, error);
        }
      });

      // Make images and CSS absolute to maintain styling
      $('img').each(function () {
        const src = $(this).attr('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          $(this).attr('src', src.startsWith('/') ? `${new URL(targetUrl).origin}${src}` : new URL(src, targetUrl).href);
        }
      });
      $('link[rel="stylesheet"]').each(function () {
        const href = $(this).attr('href');
        if (href && !href.startsWith('http')) {
          $(this).attr('href', href.startsWith('/') ? `${new URL(targetUrl).origin}${href}` : new URL(href, targetUrl).href);
        }
      });

      // Add attribution banner
      $('body').append(`
        <div style="position: fixed; bottom: 0; right: 0; z-index: 9999; margin: 0 1rem 0 0; padding: 0.5rem 1rem; background-color: #6ee7b7; border: 1px solid #10b981; border-bottom: none; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; color: #374151; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);">
          <strong>Website cleaned by <a href="https://lscr.xyz" target="_blank">{lscr}</a></strong>
        </div>
      `);

      processedHtml = $.html();
    }

    // Return the processed HTML
    return NextResponse.json({ html: processedHtml });
  } catch (error) {
    // Log proxy error
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}