import type { NextConfig } from 'next';
import path from 'node:path';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

const ogStub = path.resolve(process.cwd(), 'lib/og-stub.js');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.animepahe.si',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'animepahe.ru',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  experimental: {},
  turbopack: {
    resolveAlias: {
      'next/dist/compiled/@vercel/og/index.node.js': ogStub,
      'next/dist/compiled/@vercel/og/index.edge.js': ogStub,
    },
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/dist/compiled/@vercel/og/index.node.js': ogStub,
      'next/dist/compiled/@vercel/og/index.edge.js': ogStub,
    };
    return config;
  },
};

export default nextConfig;
