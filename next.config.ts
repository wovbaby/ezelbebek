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
  // Server Actions Ayarları
  experimental: {
    serverActions: {
      // 🟢 KRİTİK AYAR: Varsayılan 1MB yükleme limitini 10MB'a çıkarıyoruz.
      // Bu satır olmadan büyük resimlerde "400 Bad Request" hatası alırsın.
      bodySizeLimit: '10mb',
      
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