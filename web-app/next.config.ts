<<<<<<< HEAD
/** @type {import('next').NextConfig} */
const nextConfig = {
=======
const withTM = require('next-transpile-modules')(['dyad-sh-core']);

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
>>>>>>> 4afa930ebcfaa619ba03940ff300e851fa9831f9
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*', // Proxy to Backend
      },
    ];
  },
});

module.exports = nextConfig;