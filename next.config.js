/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chat-webapp-nghiadev.s3.ap-southeast-1.amazonaws.com'
      }
    ]
  }
}

module.exports = nextConfig
