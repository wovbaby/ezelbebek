import type { NextConfig } from "next";

// PWA Eklentisini Çağır
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // 1. Bellek Hatasını Çözen Ayarlar (Çok Önemli)
  eslint: {
    ignoreDuringBuilds: true, // Derlemede lint hatasına bakma
  },
  typescript: {
    ignoreBuildErrors: true, // Derlemede tip hatasına bakma
  },
  // ------------------------------------------------

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
        "*.vercel.app" // Vercel adresini de ekledik
      ],
    },
  },
};

export default withPWA(nextConfig);