import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
            // Ensure cookies work in serverless/Vercel
            sameSite: options?.sameSite || 'lax',
            secure: options?.secure ?? process.env.NODE_ENV === 'production',
            httpOnly: options?.httpOnly ?? false,
            path: options?.path || '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
            // Ensure cookies work in serverless/Vercel
            sameSite: options?.sameSite || 'lax',
            secure: options?.secure ?? process.env.NODE_ENV === 'production',
            httpOnly: options?.httpOnly ?? false,
            path: options?.path || '/',
            maxAge: 0, // Expire immediately
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
