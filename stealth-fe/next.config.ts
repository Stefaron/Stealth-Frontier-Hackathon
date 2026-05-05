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
};

export default nextConfig;
