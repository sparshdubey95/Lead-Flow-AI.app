import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Run the internationalization middleware first
  const response = intlMiddleware(request);

  // 2. Hook Supabase Auth into the response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. Protect the localized dashboard routes (e.g. /en/dashboard, /es/dashboard)
  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.match(/^\/(en|es|fr|de|it)\/dashboard/);

  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    const locale = pathname.split('/')[1] || 'en';
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Match all paths except static assets and API routes
  matcher: ['/', '/(en|es|fr|de|it)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
