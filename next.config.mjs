/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add rewrites to handle direct URL access
  async rewrites() {
    return [
      // Handle URLs like lscr.xyz/https://example.com
      {
        source: '/:url(https?://.*)',
        destination: '/proxy?url=:url',
      },
      // Also handle URLs without protocol
      {
        source: '/:url([^/]+\\.[^/]+.*)',
        destination: '/proxy?url=:url',
        has: [
          {
            type: 'header',
            key: 'host',
          }
        ]
      }
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
    domains: ['*'], // Allow images from any domain
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
