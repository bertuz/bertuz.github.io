/** @type {import('next').NextConfig} */
const withStylus = require("next-stylus");
const nextConfig = withStylus({
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3870],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
  },
  swcMinify: true,
});

module.exports = nextConfig;
