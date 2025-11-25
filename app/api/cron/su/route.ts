import { NextResponse } from 'next/server';

// Bu satır REDIRECT'i tamamen engeller. Route tam API mode olur.
export const dynamic = "force-dynamic";

export async function GET() {
  // 1. SAAT KONTROLÜ (Gece rahatsız etmeyelim)
  const simdi = new Date();
  const saat = simdi.getUTCHours() + 3; // UTC → Türkiye saati

  // Eğer saat 09:00'dan küçükse veya 23:00'ten büyükse bildirim gönderme
  if (saat < 9 || saat > 23) {
    return NextResponse.json({ 
      message: 'Gece saati, bildirim gönderilmedi.', 
      saat 
    });
  }

  // 2. ONESIGNAL BİLDİRİMİ GÖNDER
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: "💧 Drink Water", tr: "💧 Su İçme Zamanı" },
      contents: { en: "Time to drink some water! 🥤", tr: "Hadi bir bardak su iç ve sağlığını koru! 🥤" },
      url: "https://ezelbebek.vercel.app/anne"
    }),
  });

  const result = await response.json();

  return NextResponse.json({ success: true, result });
}
