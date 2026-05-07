import type { NextConfig } from "next";

const INDEXER_URL =
  process.env.NEXT_PUBLIC_UMBRA_INDEXER_URL ??
  "https://utxo-indexer.api-devnet.umbraprivacy.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/proxy/data-indexer/:path*",
        destination: `${INDEXER_URL}/:path*`,
      },
    ];
  },
  turbopack: {
    ignoreIssue: [
      { path: "**/node_modules/web-worker/**" },
      { path: "**/node_modules/ffjavascript/**" },
      { path: "**/node_modules/snarkjs/**" },
    ],
  },
  webpack: (config) => {
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    return config;
  },
};

export default nextConfig;
