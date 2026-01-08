import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: execSync('git rev-parse HEAD').toString().trim(),
  },
  reactStrictMode: true,
  // Add rewrites to handle direct URL access
  async rewrites() {
    return [
      // Redirect URLs like /https:/www.example.com to /proxy?url=https:/www.example.com
      {
        source: '/https/:path*',
        destination: '/proxy?url=:path*', // Do not encode the URL
      },
      {
        source: '/http/:path*',
        destination: '/proxy?url=:path*', // Do not encode the URL
      },
      // Handle URLs without protocol (e.g., /www.example.com)
      {
        source: '/:url([^/]+\\.[^/]+.*)',
        destination: '/proxy?url=:url', // Default to http
      },
    ];
  },
  // Configure headers to allow cross-origin requests
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
