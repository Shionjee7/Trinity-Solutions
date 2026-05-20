import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pocketbase"],
  },
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
