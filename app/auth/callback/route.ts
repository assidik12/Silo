import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard' // Arahkan ke dashboard secara default
  const refSource = searchParams.get('ref')

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

      // Save signup source if present and user doesn't have one yet
      if (refSource && data.session?.user?.id) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("signup_source")
          .eq("id", data.session.user.id)
          .single();
          
        if (existingUser && !existingUser.signup_source) {
          await supabase
            .from("users")
            .update({ signup_source: refSource })
            .eq("id", data.session.user.id);
        }
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
