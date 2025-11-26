import { NextResponse } from 'next/server';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    
    // Cron-job.org'dan geldiğini doğrula
    if (source !== 'cronjob') {
      return NextResponse.json({ 
        error: 'Unauthorized access' 
      }, { status: 401 });
    }

    const simdi = new Date();
    const saat = simdi.getUTCHours() + 3;

    console.log(`Cron çalıştı - Saat: ${saat}`);

    // 09:00 - 23:00 arası kontrol
    if (saat < 9 || saat > 23) {
      return NextResponse.json({
        success: false,
        message: 'Gece saati, bildirim gönderilmedi.',
        saat: saat
      });
    }

    // OneSignal bildirimi
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

    return NextResponse.json({ 
      success: true, 
      message: 'Bildirim gönderildi',
      saat: saat,
      result: result
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}