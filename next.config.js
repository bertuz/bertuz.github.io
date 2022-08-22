/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  images: {
    domains: ['content-eu.drive.amazonaws.com'],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [400, 500, 600, 700, 1000],
  },
  experimental: { images: { allowFutureImage: true } },
};

module.exports = nextConfig;
