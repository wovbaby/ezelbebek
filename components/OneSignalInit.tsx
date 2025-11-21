"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const runOneSignal = async () => {
        try {
          await OneSignal.init({
            appId: "3d11c397-1c73-4949-a1e9-5f9d206d7218", // ID'n burada
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
            // Otomatik dosya yolu bulmaya bırakalım
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