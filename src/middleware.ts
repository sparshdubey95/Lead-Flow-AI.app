import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip intl middleware for auth routes (OAuth callback, signout)
  // These are NOT under [locale] and should not be rewritten
  if (pathname.startsWith('/auth/')) {
    // Still need to refresh Supabase session cookies on auth routes
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    );

    // Refresh session
    await supabase.auth.getUser();

    return response;
  }

  // 1. Run the internationalization middleware for all other routes
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
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 3. Protect the localized dashboard routes (e.g. /en/dashboard, /es/dashboard)
  const locales = routing.locales.join('|');
  const isDashboard = pathname.match(new RegExp(`^/(${locales})/dashboard`));

  if (!user && isDashboard) {
    const url = request.nextUrl.clone();
    const locale = pathname.split('/')[1] || 'en';
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // 4. Redirect logged-in users away from login page
  const isLoginPage = pathname.match(new RegExp(`^/(${locales})/login$`));
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    const locale = pathname.split('/')[1] || 'en';
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Match all paths except static assets and API routes
  // Note: /auth/* routes are handled inside the middleware function above
  matcher: ['/', '/(en|es|fr|de|it)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)', '/auth/:path*']
};
