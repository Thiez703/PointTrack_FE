import { AuthService } from '@/app/services/auth.service'
import { LoginFormValues } from '@/app/types/auth.schema'
import { AxiosError } from 'axios'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const req = (await request.json()) as LoginFormValues
  try {
    const res = await AuthService.loginJava(req)

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

    // Signal middleware to lock the user into the password-change page
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
      // Clear any stale forcePasswordChange cookie
      response.cookies.delete('forcePasswordChange')
    }

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

