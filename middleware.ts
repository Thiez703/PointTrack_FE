import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages only for unauthenticated users
const AUTH_PATHS = [
  '/login',
  '/signup',
  '/reset-password',
  '/forgot-password',
]

// Pages that require authentication
const PROTECTED_PATHS = [
  '/profile',
  '/checkin',
  '/calendar',
  '/exchange',
  '/holiday',
  '/auth/first-change-password',
]

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // Skip static files and Next.js internals
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/images') ||
    path === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const token =
    req.cookies.get('accessToken')?.value ??
    req.cookies.get('refreshToken')?.value

  const isAuthPath = AUTH_PATHS.some(p => path === p || path.startsWith(p + '/'))

  // Always allow auth pages through (avoid redirect loops)
  if (isAuthPath) return NextResponse.next()

  const isProtectedPath =
    PROTECTED_PATHS.some(p => path === p || path.startsWith(p + '/')) ||
    path.startsWith('/admin')

  // Redirect unauthenticated users to login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If forcePasswordChange cookie is set, lock user to the first-change-password page
  if (token) {
    const forceChange = req.cookies.get('forcePasswordChange')?.value
    if (forceChange === 'true' && path !== '/auth/first-change-password') {
      return NextResponse.redirect(new URL('/auth/first-change-password', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
