import { NextResponse } from 'next/server';

export const runtime = "nodejs";          // Redirect’i KESER
export const dynamic = "force-dynamic";   // Statik algılanmasını engeller

export async function GET() {
  const simdi = new Date();
  const saat = simdi.getUTCHours() + 3;

  if (saat < 9 || saat > 23) {
    return NextResponse.json({
      message: 'Gece saati, bildirim gönderilmedi.',
      saat,
    });
  }

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: "💧 Su İçme Zamanı", tr: "💧 Su İçme Zamanı" },
      contents: { en: "Drink water! 🥤", tr: "Hadi bir bardak su iç ve sağlığını koru! 🥤" },
      url: "https://ezelbebek.vercel.app/anne"
    }),
  });

  const result = await response.json();

  return NextResponse.json({ success: true, result });
}
