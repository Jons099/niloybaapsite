/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'niloybaapsite.onrender.com/', // Your Render URL
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // For faster deployment
  },
  typescript: {
    ignoreBuildErrors: true, // For faster deployment
  },
}

module.exports = nextConfig