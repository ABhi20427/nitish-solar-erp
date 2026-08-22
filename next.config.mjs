/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
      {
        source: '/erp',
        destination: '/',
        permanent: false,
      },
      {
        source: '/erp/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
