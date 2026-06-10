/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/api/upload',
        destination: 'http://localhost:8080/upload',
        permanent: true,
      },
      {
        source: '/api/download/:port',
        destination: 'http://localhost:8080/download/:port',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig;
