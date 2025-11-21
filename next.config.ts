import type { NextConfig } from "next";

// PWA Eklentisini Çağır
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",       // Dosyaları public klasörüne çıkar
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: process.env.NODE_ENV === "development", // Geliştirme yaparken PWA kapalı olsun (hata vermesin diye)
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // Tüm resimlere izin ver
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

// Config'i PWA ile sarmalayarak dışarı aktar
export default withPWA(nextConfig);