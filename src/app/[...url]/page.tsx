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
    if (!params.url) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    // Join the URL segments from params
    let segments: string[];
    if (Array.isArray(params.url)) {
      segments = params.url;
    } else {
      segments = [params.url];
    }
    let fullUrl = segments.join('/');

    // Ensure the URL has a valid protocol, but do not add one if it already exists
    const urlPattern = /^https?:\/\//i; // Matches valid protocol prefixes
    const url = urlPattern.test(fullUrl) ? fullUrl : `https://${fullUrl}`;

    // Clean up duplicate slashes after protocol
    const cleanedUrl = url.replace(/(https?:\/\/)\/+/g, '$1');
    setTargetUrl(cleanedUrl);

    const fetchPageContent = async () => {
      try {
        console.log('Fetching URL:', cleanedUrl); // Debug log
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(cleanedUrl)}`);
        if (!response.ok) {
          const errorText = await response.text(); // Obtener detalles del error
          throw new Error(`Failed to fetch content from proxy: ${response.status} - ${errorText}`);
        }
        const { html } = await response.json();
        setContent(html);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(`Failed to fetch or process the requested URL: ${errorMessage}`);
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
            <Image src="/images/lscr-logo-without-tag.svg" alt="{lscr} Logo" width={120} height={60} />
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
          <Image src="/images/lscr-logo-without-tag.svg" alt="{lscr} Logo" width={120} height={60} />
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

  return (
    <div className="w-full h-screen">
      {content && (
        <iframe
          srcDoc={content}
          className="w-full h-full border-none"
          title={`{lscr} - ${targetUrl}`}
        />
      )}
    </div>
  );
}