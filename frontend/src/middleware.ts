import { NextResponse, type NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface SessionUser {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'MANAGER'
  factoryId: string
  departmentId?: string
}

async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const token = request.cookies.get('__session')?.value
  const path = request.nextUrl.pathname

  const isOwnerRoute = path.startsWith('/owner')
  const isManagerRoute = path.startsWith('/manager')
  const isLoginRoute = path.startsWith('/login')
  const isPublicRoute =
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/api')

  if (isPublicRoute) return response

  const user = token ? await verifySession(token) : null

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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
