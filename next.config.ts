import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // Tüm sitelerden resim kabul et (Test için)
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "*.app.github.dev", 
        "*.github.dev"
      ],
    },
  },
};

export default nextConfig;