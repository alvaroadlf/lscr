/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add rewrites to handle direct URL access
  async rewrites() {
    return [
      // Redirect URLs that start with https:// or https/
      {
        source: '/https:/:path*',
        destination: '/proxy?url=https://:path*',
      },
      {
        source: '/https/:path*',
        destination: '/proxy?url=https://:path*',
      },
      // Redirect URLs that start with http:// or http/
      {
        source: '/http:/:path*',
        destination: '/proxy?url=http://:path*',
      },
      {
        source: '/http/:path*',
        destination: '/proxy?url=http://:path*',
      },
      // Handle URLs without protocol (e.g., lscr.xyz/example.com)
      {
        source: '/:url((?!proxy|api|_next|favicon.ico|images|icons)[^/]+\\.[^/]+)/:path*',
        destination: '/proxy?url=https://:url/:path*',
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
