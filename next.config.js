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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'content-eu.drive.amazonaws.com',
        port: '',
        pathname: '**',
      },
    ],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [400, 500, 600, 700, 1000],
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
    emotion: {
      sourceMap: true,
      autoLabel: 'dev-only',
    },
  },
};

module.exports = nextConfig;
