import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard' // Arahkan ke dashboard secara default

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Jika berhasil, redirect ke dashboard (atau halaman next)
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth callback error:', error)
    }
  }

  // Jika gagal, kembalikan ke login
  return NextResponse.redirect(`${origin}/login?error=auth-failed`)
}
