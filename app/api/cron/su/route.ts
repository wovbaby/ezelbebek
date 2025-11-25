import { NextResponse } from 'next/server';

export async function GET() {
  // 1. SAAT KONTROLÜ (Gece rahatsız etmeyelim)
  // Türkiye saati (UTC+3) için ayar
  const simdi = new Date();
  const saat = simdi.getUTCHours() + 3; // Vercel sunucusu UTC çalışır, biz +3 ekliyoruz

  // Eğer saat 09:00'dan küçükse VEYA 23:00'ten büyükse gönderme
  if (saat < 9 || saat > 23) {
    return NextResponse.json({ message: 'Gece saati, bildirim gönderilmedi.', saat });
  }

  // 2. ONESIGNAL'A EMRİ VER
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, // REST Key buraya gelecek
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      included_segments: ["All"], // İzin veren HERKES
      headings: { en: "💧 Su İçme Zamanı", tr: "💧 Su İçme Zamanı" },
      contents: { en: "Hadi bir bardak su iç ve sağlığını koru! 🥤", tr: "Hadi bir bardak su iç ve sağlığını koru! 🥤" },
      // Bildirime tıklayınca anneyi su takip sayfasına atalım
      url: "https://ezelbebek.vercel.app/anne" 
    }),
  });

  const result = await response.json();

  return NextResponse.json({ success: true, result });
}