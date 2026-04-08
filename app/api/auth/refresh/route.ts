import { AuthService } from '@/app/services/auth.service'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(_request: Request) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')

  if (!refreshToken) {
    return NextResponse.json(
      { detail: 'Không nhận được refreshToken', status: 401 },
      { status: 401 }
    )
  }

  try {
    const res = await AuthService.refresh(refreshToken.value)

    const accessDecoded = jwtDecode<JwtPayload>(res.accessToken)
    const accessExpiry =
      typeof accessDecoded.exp === 'number'
        ? new Date(accessDecoded.exp * 1000)
        : new Date(Date.now() + 60 * 60 * 1000) // 1h fallback

    const response = NextResponse.json(res, { status: 200 })

    response.cookies.set({
      name: 'accessToken',
      value: res.accessToken,
      path: '/',
      httpOnly: true,
      expires: accessExpiry,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    // Token rotation — save the new refreshToken too
    if (res.refreshToken) {
      const refreshDecoded = jwtDecode<JwtPayload>(res.refreshToken)
      const refreshExpiry =
        typeof refreshDecoded.exp === 'number'
          ? new Date(refreshDecoded.exp * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

      response.cookies.set({
        name: 'refreshToken',
        value: res.refreshToken,
        path: '/',
        httpOnly: true,
        expires: refreshExpiry,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }

    if (res.forcePasswordChange) {
      response.cookies.set({
        name: 'forcePasswordChange',
        value: 'true',
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    } else {
      response.cookies.delete('forcePasswordChange')
    }

    return response
  } catch {
    return NextResponse.json(
      { detail: 'Refresh token không hợp lệ hoặc đã hết hạn', status: 401 },
      { status: 401 }
    )
  }
}

