import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false, // BU KAPATILDI (Hafıza dostu)
  reloadOnOnline: true,
  swMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Derlemede tip hatalarını yoksay
  },
  eslint: {
    ignoreDuringBuilds: true, // Derlemede lint hatalarını yoksay
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
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

export default withPWA(nextConfig);