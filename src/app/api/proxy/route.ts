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

    // Añadir script para bloquear alertas y diálogos antes del contenido
    // Añadir meta tags para cookies y permisos
    $('head').prepend(`
      <meta http-equiv="permissions-policy" content="interest-cohort=(), payment=(), camera=(), microphone=()">
      <meta name="referrer" content="no-referrer">
    `);

    // Eliminar diálogos y alertas del DOM
    $('div[class*="cookie"]').remove();
    $('div[class*="consent"]').remove();
    $('div[class*="alert"]').remove();
    $('div[id*="cookie"]').remove();
    $('div[id*="consent"]').remove();
    $('div[id*="alert"]').remove();
    $('div[aria-label*="cookie"]').remove();
    $('div[role="alert"]').remove();
    $('[data-cookieconsent]').remove();
    
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