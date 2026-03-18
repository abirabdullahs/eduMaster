import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = new URL(request.nextUrl);

  // Allow /exam/[accessLink] for logged-in users of any role
  if (url.pathname.startsWith('/exam/')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Protect Dashboard Routes
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/teacher') || url.pathname.startsWith('/student')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based protection
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', session.user.id)
      .single();

    if (!profile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = profile.role;
    const status = profile.status;

    // Admin protection
    if (url.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }

    // Teacher protection (must be active)
    if (url.pathname.startsWith('/teacher')) {
      if (role !== 'teacher') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      if (status !== 'active') {
        // Sign out if not active to prevent dashboard access
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=pending', request.url));
      }
    }

    // Student protection
    if (url.pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  // Redirect logged in users away from auth pages
  if (session && (url.pathname.startsWith('/login') || url.pathname.startsWith('/signup') || url.pathname.startsWith('/teacher-signup'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profile) {
      return NextResponse.redirect(new URL(`/${profile.role}`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
