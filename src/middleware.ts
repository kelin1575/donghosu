import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 로그인 필요한 페이지만 체크
  const protectedPaths = ['/mypage']
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected) {
    const token = request.cookies.get('sb-access-token') ||
                  request.cookies.getAll().find(c => c.name.includes('auth-token'))

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/mypage/:path*'],
}