import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Yanıt nesnesini oluştur
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase Client'ı oluştur (Cookie okumak için)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Kullanıcıyı kontrol et
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- YÖNLENDİRME KURALLARI ---

  // 1. Eğer kullanıcı GİRİŞ YAPMAMIŞSA ve Login sayfasında DEĞİLSE -> Login'e at
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Eğer kullanıcı GİRİŞ YAPMIŞSA ve Login sayfasındaysa -> Ana sayfaya at
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

// Middleware hangi sayfalarda çalışsın?
export const config = {
  matcher: [
    /*
     * Aşağıdaki dosyalar HARİÇ tüm sayfalarda çalış:
     * - _next/static (resimler, stiller)
     * - _next/image (resim optimizasyonu)
     * - favicon.ico
     * - .png, .jpg, .svg, .json (PWA dosyaları, resimler)
     * - OneSignal scriptleri
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|manifest.json|OneSignal).*)',
  ],
}