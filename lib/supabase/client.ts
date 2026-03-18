import { createBrowserClient } from '@supabase/ssr'
import { parse, serialize } from 'cookie'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // tokens-only = smaller cookies, user in localStorage – avoids "Cannot create property 'user' on string"
      cookies: {
        encode: 'tokens-only',
        getAll:
          typeof document !== 'undefined'
            ? () =>
                Object.entries(parse(document.cookie)).map(([name, value]) => ({
                  name,
                  value: value ?? '',
                }))
            : () => [],
        setAll: (cookies) => {
          if (typeof document === 'undefined') return
          cookies.forEach(({ name, value, options }) => {
            document.cookie = serialize(name, value || '', { ...options, path: '/' })
          })
        },
      },
    }
  )
}
