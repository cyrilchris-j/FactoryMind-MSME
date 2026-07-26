import { NextResponse, type NextRequest } from 'next/server'

interface JWTPayload {
  uid?: string
  sub?: string
  email?: string
  role?: string
  factoryId?: string
  exp?: number
}

/**
 * Decode a Firebase JWT without verification (verification happens
 * on the client via Firebase SDK and on the backend for API calls).
 * This is safe for routing decisions only – not for data access.
 */
function decodeJwt(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8')
    const data = JSON.parse(payload) as JWTPayload
    // Check expiry
    if (data.exp && data.exp * 1000 < Date.now()) return null
    return data
  } catch {
    return null
  }
}

interface SessionUser {
  id: string
  email: string
  role: 'OWNER' | 'MANAGER'
  factoryId?: string
}

/**
 * Try backend first (gives us role from Firestore). If backend is
 * unavailable fall back to reading a role cookie set by the client.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function verifySession(token: string, roleCookie?: string): Promise<SessionUser | null> {
  // 1️⃣ Try backend (has Firestore role data)
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(1500), // don't block the page for long
    })
    if (res.ok) return res.json()
  } catch {
    // backend offline – fall through
  }

  // 2️⃣ Fallback: decode JWT + use role cookie set by client
  const decoded = decodeJwt(token)
  if (!decoded) return null

  const uid = decoded.uid || decoded.sub
  if (!uid) return null

  // Role cookie: client sets "user_role" cookie after login
  const role = (roleCookie as 'OWNER' | 'MANAGER') || 'OWNER'

  return {
    id: uid,
    email: decoded.email || '',
    role,
    factoryId: decoded.factoryId,
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const token = request.cookies.get('__session')?.value
  const roleCookie = request.cookies.get('user_role')?.value
  const path = request.nextUrl.pathname

  const isOwnerRoute = path.startsWith('/owner')
  const isManagerRoute = path.startsWith('/manager')
  const isLoginRoute = path.startsWith('/login')
  const isRegisterRoute = path.startsWith('/register')
  const isPublicRoute =
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/api')

  if (isPublicRoute || isRegisterRoute) return response

  const user = token ? await verifySession(token, roleCookie) : null

  if (!user && (isOwnerRoute || isManagerRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (!user && (path === '/' || path === '/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isLoginRoute) {
    if (user.role === 'MANAGER') {
      return NextResponse.redirect(new URL('/manager/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/owner/dashboard', request.url))
  }

  if (user && (path === '/' || path === '/dashboard')) {
    if (user.role === 'MANAGER') {
      return NextResponse.redirect(new URL('/manager/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/owner/dashboard', request.url))
  }

  if (isOwnerRoute && user?.role === 'MANAGER') {
    return NextResponse.redirect(new URL('/manager/dashboard', request.url))
  }

  if (isManagerRoute && user?.role === 'OWNER') {
    return NextResponse.redirect(new URL('/owner/dashboard', request.url))
  }

  return response
}

export const runtime = 'nodejs'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
