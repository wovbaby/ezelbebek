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
            
            // --- DÜZELTME BURADA ---
            // Başlarına / koyduk ki her yerden bulabilsin
            serviceWorkerPath: "/OneSignalSDKWorker.js", 
            serviceWorkerParam: { scope: "/" },
            // -----------------------

            notifyButton: {
              enable: true, 
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
                      timeDelay: 5, 
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

  return null;
}