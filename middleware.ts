import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')
  const isFurnitureProtected = request.nextUrl.pathname.startsWith('/furniture-requirements/dashboard') || request.nextUrl.pathname.startsWith('/furniture-requirements/entry')
  const isFurnitureAuthPage = request.nextUrl.pathname === '/furniture-requirements' || request.nextUrl.pathname === '/furniture-requirements/'
  
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (isFurnitureProtected && !user) {
    console.log("Middleware blocking furniture protected route! !user is true. Path:", request.nextUrl.pathname)
    const url = request.nextUrl.clone()
    url.pathname = '/furniture-requirements'
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login pages, redirect to appropriate dashboard
  if (request.nextUrl.pathname.startsWith('/admin/login') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  if (isFurnitureAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/furniture-requirements/entry'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
