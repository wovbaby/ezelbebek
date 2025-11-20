import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL ve Key bulunamadı. .env.local dosyasını kontrol et.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)