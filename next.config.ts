import type { NextConfig } from "next";

/**
 * QuickKit is a static-export product.
 *
 * The production artifact is `/out`. No Node.js server, edge runtime,
 * serverless functions, API routes, database, or runtime SSR are required.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // App Router file tracing for static export; no runtime needed.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
