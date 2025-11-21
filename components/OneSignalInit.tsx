"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const runOneSignal = async () => {
        try {
          await OneSignal.init({
            appId: "3d11c397-1c73-4949-a1e9-5f9d206d7218",
            // allowLocalhostAsSecureOrigin: true, // Canlıda buna gerek yok
            notifyButton: {
              enable: true,
            },
            // Service worker yollarını sildik, otomatik bulsun
          });
        } catch (error) {
          console.error("OneSignal Başlatma Hatası:", error);
        }
      };

      runOneSignal();
    }
  }, []);

  return null;
}