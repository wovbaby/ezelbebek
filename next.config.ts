import type { NextConfig } from "next";

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
  // TypeScript hatalarını görmezden gel
  typescript: {
    ignoreBuildErrors: true,
  },
  // DİKKAT: eslint ayarını buradan kaldırdık (Next.js 16 kuralı)
  
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    // Bu boş turbopack ayarı, hatayı susturmak için gereklidir
    turbopack: {
      rules: {}, 
    },
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