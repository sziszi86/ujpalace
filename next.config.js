/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'palace-poker.hu',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/**/*'],
  },
};

module.exports = nextConfig;