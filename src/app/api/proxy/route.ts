import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameters
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    let targetUrl = url;

    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      targetUrl = `https://${url}`;
    }

    try {
      // Validate the URL
      new URL(targetUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the original webpage with retries
    const fetchWithRetries = async (url: string, retries: number = 3): Promise<string> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Connection': 'keep-alive',
            },
            timeout: 10000, // 10 seconds timeout
          });
          return response.data;
        } catch (error) {
          console.warn(`Attempt ${attempt} failed:`, error.message);
          if (attempt === retries) throw error;
        }
      }
      throw new Error('Failed to fetch content after retries');
    };

    const html = await fetchWithRetries(targetUrl);

    const $ = cheerio.load(html);

    // Remove verification messages or overlays
    const verificationSelectors = [
      '[id*="verify"]', // IDs containing "verify"
      '[class*="verify"]', // Classes containing "verify"
      '[id*="access"]', // IDs containing "access"
      '[class*="access"]', // Classes containing "access"
    ];
    verificationSelectors.forEach(selector => {
      $(selector).remove();
    });

    // Remove all script tags
    $('script').remove();

    // Remove JS event attributes from all elements
    $('*').each(function() {
      const element = $(this);
      // Check if the element has attributes and is an Element type
      if (element[0] && 'attribs' in element[0]) {
        const attributes = element[0].attribs;

        for (const attr in attributes) {
          // Remove all on* event handlers
          if (attr.startsWith('on')) {
            element.removeAttr(attr);
          }
        }
      }
    });

    // Get the host from the request to make the app work regardless of domain
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseProxyUrl = `${protocol}://${host}`;

    // Process links to make them absolute and point to our proxy
    $('a').each(function() {
      const href = $(this).attr('href');
      if (!href) return;

      // Skip fragment-only links or javascript: links
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
        return;
      }

      try {
        // Convert relative URLs to absolute
        let absoluteUrl;
        if (href.startsWith('http://') || href.startsWith('https://')) {
          absoluteUrl = href;
        } else if (href.startsWith('/')) {
          // Absolute path relative to domain
          const baseUrl = new URL(targetUrl).origin;
          absoluteUrl = `${baseUrl}${href}`;
        } else {
          // Relative path
          absoluteUrl = new URL(href, targetUrl).href;
        }

        // Modify the link to point to our proxy - use the same domain as the request
        $(this).attr('href', `${baseProxyUrl}/proxy?url=${encodeURIComponent(absoluteUrl)}`);
      } catch (error) {
        // If there's an error processing the URL, just leave it as is
        console.error(`Error processing link: ${href}`, error);
      }
    });

    // Process images to make them absolute
    $('img').each(function() {
      const src = $(this).attr('src');
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        if (src.startsWith('/')) {
          // Absolute path relative to domain
          const baseUrl = new URL(targetUrl).origin;
          $(this).attr('src', `${baseUrl}${src}`);
        } else {
          // Relative path
          $(this).attr('src', new URL(src, targetUrl).href);
        }
      }
    });

    // Process CSS links to make them absolute
    $('link[rel="stylesheet"]').each(function() {
      const href = $(this).attr('href');
      if (href && !href.startsWith('http')) {
        if (href.startsWith('/')) {
          // Absolute path relative to domain
          const baseUrl = new URL(targetUrl).origin;
          $(this).attr('href', `${baseUrl}${href}`);
        } else {
          // Relative path
          $(this).attr('href', new URL(href, targetUrl).href);
        }
      }
    });

    // Add &#123;lscr&#125; attribution in a meta tag
    $('head').append('<meta name="librescroll" content="This page was viewed via &#123;lscr&#125;">');

    // Add base target _self
    $('head').append('<base target="_self">');

    // Add the original URL as a meta tag for reference
    $('head').append(`<meta name="original-url" content="${targetUrl}">`);

    // Add &#123;lscr&#125; banner at the bottom
    $('body').append(`
      <div style="position: fixed; bottom: 0; right: 0; z-index: 9999; margin: 0 1rem 0 0; padding: 0.5rem 1rem; background-color: #6ee7b7; border: 1px solid #10b981; border-bottom: none; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; font-size: 0.875rem; line-height: 1.25rem; color: #374151; box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);">
        <strong>Website cleaned by <a href="https://lscr.xyz" target="_blank">&#123;lscr&#125;</a></strong>
      </div>
    `);

    // Get the modified HTML
    const processedHtml = $.html();

    return NextResponse.json({ html: processedHtml });
  } catch (error) {
    console.error('Proxy error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}
