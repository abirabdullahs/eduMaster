import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session cookie; do not put logic between createServerClient and getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = new URL(request.nextUrl);

  // Allow /exam/[accessLink] for logged-in users of any role
  if (url.pathname.startsWith('/exam/')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return supabaseResponse;
  }

  // Protect Dashboard Routes
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/teacher') || url.pathname.startsWith('/student')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = profile.role;
    const status = profile.status;

    if (url.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    if (url.pathname.startsWith('/teacher')) {
      if (role !== 'teacher') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      if (status !== 'active') {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=pending', request.url));
      }
    }

    if (url.pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  // Redirect logged in users away from auth pages
  if (user && (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup') || url.pathname.startsWith('/teacher-signup'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile) {
      return NextResponse.redirect(new URL(`/${profile.role}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
