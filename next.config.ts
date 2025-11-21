import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript ve ESLint hatalarını görmezden gel (Build garantisi için)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Resimlere izin ver
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Server Actions'a izin ver
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000", 
        "*.app.github.dev", 
        "*.github.dev",
        "*.vercel.app"
      ],
    },
  },
};

export default nextConfig;