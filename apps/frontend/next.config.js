/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'placehold.co', 'images.unsplash.com', 'via.placeholder.com'],
  },
}

module.exports = nextConfig
