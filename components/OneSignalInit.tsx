"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    // Sadece tarayıcı tarafında çalışsın
    if (typeof window !== "undefined") {
      const runOneSignal = async () => {
        try {
          await OneSignal.init({
            appId: "3d11c397-1c73-4949-a1e9-5f9d206d7218", // Senin ID'n
            
            // --- EKLENEN AYARLAR (HATAYI ÇÖZER) ---
            serviceWorkerPath: "OneSignalSDKWorker.js", // Dosya adını elle gösterdik
            serviceWorkerParam: { scope: "/" }, // Tüm siteyi kapsasın
            // --------------------------------------

            notifyButton: {
              enable: true, // Sağ altta kırmızı zil butonu çıkar
            },
            promptOptions: {
              slidedown: {
                prompts: [
                  {
                    type: "push",
                    autoPrompt: true,
                    text: {
                      actionMessage: "Aşı ve ilaç hatırlatmaları için bildirimleri açmak ister misin?",
                      acceptButton: "Evet, Aç",
                      cancelButton: "Hayır",
                    },
                    delay: {
                      pageViews: 1,
                      timeDelay: 5, // 5 saniye sonra sor
                    },
                  },
                ],
              },
            },
          });
        } catch (error) {
          console.error("OneSignal Hatası:", error);
        }
      };

      runOneSignal();
    }
  }, []);

  return null; // Bu bileşen ekranda görünmez, sadece arkada çalışır
}