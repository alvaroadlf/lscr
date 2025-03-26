'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CleanPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get the URL from the path params
    if (!params.url) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    // Join the URL segments
    let segments: string[];

    if (Array.isArray(params.url)) {
      segments = params.url;
    } else {
      segments = [params.url];
    }

    // Process URL
    let url: string;
    if (segments[0] === 'http:' || segments[0] === 'https:') {
      // URL was passed like /http:/example.com or /https:/example.com
      url = segments.join('/');
    } else if (segments[0].startsWith('http')) {
      // URL was passed like /http://example.com or /https://example.com
      url = segments.join('/');
    } else {
      // Add https:// as default protocol
      url = `https://${segments.join('/')}`;
    }

    // Remove duplicate slashes after protocol
    url = url.replace(/(https?:\/\/)\/+/g, '$1');

    setTargetUrl(url);

    // Function to fetch the page content
    const fetchPageContent = async () => {
      try {
        const response = await fetch(url);
        const html = await response.text();

        // Create a new DOM parser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Remove all script tags
        const scripts = doc.getElementsByTagName('script');
        while (scripts.length > 0) {
          scripts[0].parentNode?.removeChild(scripts[0]);
        }

        // Disable all event handlers
        const allElements = doc.querySelectorAll('*');
        allElements.forEach(el => {
          const attrs = el.attributes;
          for (let i = attrs.length - 1; i >= 0; i--) {
            const attrName = attrs[i].name;
            if (attrName.startsWith('on')) {
              el.removeAttribute(attrName);
            }
          }
        });

        // Add the &#123;lscr&#125; banner
        const banner = doc.createElement('div');
        banner.style.position = 'fixed';
        banner.style.bottom = '0';
        banner.style.right = '0';
        banner.style.zIndex = '9999';
        banner.style.margin = '0 1rem 0 0';
        banner.style.padding = '0.5rem 1rem';
        banner.style.backgroundColor = 'rgb(110 231 183 / var(--tw-bg-opacity, 1))';
        banner.style.border = '1px solid rgb(16 185 129 / var(--tw-border-opacity, 1))';
        banner.style.borderBottom = 'none';
        banner.style.borderTopLeftRadius = '0.5rem';
        banner.style.borderTopRightRadius = '0.5rem';
        banner.style.fontSize = '0.875rem';
        banner.style.lineHeight = '1.25rem';
        banner.style.color = '#854d0e';
        banner.style.boxShadow = '0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)';

        const strong = doc.createElement('strong');
        strong.textContent = 'Website cleaned by &#123;lscr&#125;';
        banner.appendChild(strong);

        const link = doc.createElement('a');
        link.href = '/';
        link.textContent = 'Return to Homepage';
        link.style.textDecoration = 'underline';
        link.style.fontWeight = '600';
        link.style.marginLeft = '0.25rem';
        banner.appendChild(link);

        doc.body.appendChild(banner);

        // Convert back to HTML string
        setContent(doc.documentElement.outerHTML);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to fetch or process the requested URL');
        setLoading(false);
      }
    };

    fetchPageContent();
  }, [params]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="bg-emerald-300 rounded-lg p-4 px-6 border flex flex-col items-center">
        <Link href="/" className="mb-8 inline-block">
          <Image src="/images/lscr-logo-without-tag.svg" alt="&#123;lscr&#125; Logo" width={120} height={60} />
        </Link>
          <h3 className="text-gray-600 text-sm flex items-center">
            Cleaning Webpage
            <Image src="/spinner-dark.svg" alt="Loading" width={24} height={24} className="ml-2" style={{ fill: '#6ee7b7' }} />
          </h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center">
        <Link href="/" className="mb-8 inline-block">
          <Image src="/images/lscr-logo-without-tag.svg" alt="&#123;lscr&#125; Logo" width={120} height={60} />
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-red-700 text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-4">
            <Link href="/" className="text-blue-600 hover:underline">
              Return to homepage
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Create an iframe with the processed content
  return (
    <div className="w-full h-screen">
      {content && (
        <iframe
          srcDoc={content}
          className="w-full h-full border-none"
          title={`&#123;lscr&#125; - ${targetUrl}`}
        />
      )}
    </div>
  );
}
