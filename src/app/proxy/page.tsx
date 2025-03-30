'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

function ProxyContent() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      setError('No URL provided');
      setLoading(false);
      return;
    }

    setOriginalUrl(targetUrl);

    const fetchContent = async () => {
      try {
        setLoading(true);

        // Fetch the web page content through our API
        const response = await axios.get('/api/proxy', {
          params: { url: targetUrl }
        });

        if (response.data && response.data.html) {
          setContent(response.data.html);
        } else {
          setError('Failed to retrieve content');
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {/* Iframe to display the original page */}
        {originalUrl && (
          <iframe
            src={originalUrl}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none' }}
          />
        )}
        {/* Transparency layer simulating progressive cleaning */}
        <div
          className="absolute inset-0 bg-white"
          style={{
            opacity: 0.75,
            animation: 'cleaningEffect 6s linear forwards', // Duration increased to 6 seconds
          }}
        />
        {/* Overlay message */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-emerald-300 rounded-lg p-4 px-6 border flex flex-col items-center">
            <Link href="/" className="mb-8 inline-block">
              <Image src="/images/lscr-logo-without-tag.svg" alt="&#123;lscr&#125; Logo" width={120} height={60} />
            </Link>
            <h3 className="text-gray-600 text-sm flex items-center">
              Cleaning Webpage
              <Image src="/images/spinner-dark.svg" alt="Loading" width={24} height={24} className="ml-2" style={{ fill: '#6ee7b7' }} />
            </h3>
          </div>
        </div>
        {/* CSS animation for the cleaning effect */}
        <style jsx>{`
          @keyframes cleaningEffect {
            from {
              opacity: 0.75;
            }
            to {
              opacity: 0;
            }
          }
        `}</style>
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

  return (
    <div
      className="proxy-content w-full min-h-screen"
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
}

export default function ProxyPage() {
  return (
    <Suspense fallback={<div>Loading content...</div>}>
      <ProxyContent />
    </Suspense>
  );
}
