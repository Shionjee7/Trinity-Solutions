/** @type {import('next').NextConfig} */
const nextConfig = {
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
