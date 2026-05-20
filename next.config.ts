import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pocketbase uses node-only APIs; keep it out of the browser bundle
  serverExternalPackages: ["pocketbase"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.taj-biz.com",
      },
    ],
  },
};

export default nextConfig;
