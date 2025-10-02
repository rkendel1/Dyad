/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['dyad-sh-core'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Proxy to Backend
      },
    ];
  },
};

module.exports = nextConfig;