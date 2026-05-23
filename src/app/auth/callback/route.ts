import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Extract locale from NEXT_LOCALE cookie or fallback to 'en'
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'
  
  // next is the URL to redirect to after sign in.
  const nextParam = searchParams.get('next') ?? '/dashboard'
  
  // Ensure the next path starts with the locale prefix
  // e.g. if next is /dashboard, it becomes /en/dashboard
  const next = nextParam.startsWith(`/${locale}`) ? nextParam : `/${locale}${nextParam.startsWith('/') ? '' : '/'}${nextParam}`

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Successfully authenticated via email link or OAuth code
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions if auth fails
  return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`)
}
