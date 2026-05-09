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
    
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (data.session?.provider_token) {
        const cookieStoreAwaited = await cookies();
        cookieStoreAwaited.set('g_provider_token', data.session.provider_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 3500, // Token Google valid 1 jam
          path: '/',
        });
      }

      // Pastikan menggunakan https untuk production, dan http untuk local
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = request.url.includes('localhost')
      
      let base = origin
      if (forwardedHost) {
        base = isLocal ? `http://${forwardedHost}` : `https://${forwardedHost}`
      }

      return NextResponse.redirect(`${base}${next}`)
    } else {
      console.error('Auth callback error:', error)
    }
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = request.url.includes('localhost')
  
  let base = origin
  if (forwardedHost) {
    base = isLocal ? `http://${forwardedHost}` : `https://${forwardedHost}`
  }
  
  return NextResponse.redirect(`${base}/login?error=auth-failed`)
}
