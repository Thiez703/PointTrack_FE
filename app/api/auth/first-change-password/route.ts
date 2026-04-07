import { AuthService } from '@/app/services/auth.service'
import { AxiosError } from 'axios'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type FirstChangePasswordRequest = {
  newPassword: string
  confirmPassword: string
}

export async function PUT(request: Request) {
  const body = (await request.json()) as FirstChangePasswordRequest
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await AuthService.firstChangePasswordJava(body, accessToken)

    const accessDecoded = jwtDecode<JwtPayload>(res.accessToken)
    const accessExpiry =
      typeof accessDecoded.exp === 'number'
        ? new Date(accessDecoded.exp * 1000)
        : new Date(Date.now() + 60 * 60 * 1000)

    const refreshDecoded = jwtDecode<JwtPayload>(res.refreshToken)
    const refreshExpiry =
      typeof refreshDecoded.exp === 'number'
        ? new Date(refreshDecoded.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

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

    response.cookies.set({
      name: 'refreshToken',
      value: res.refreshToken,
      path: '/',
      httpOnly: true,
      expires: refreshExpiry,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    response.cookies.delete('forcePasswordChange')
    return response
  } catch (e) {
    if (e instanceof AxiosError) {
      return NextResponse.json(
        e.response?.data || { message: e.message },
        { status: e.response?.status || 500 }
      )
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
