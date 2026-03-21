import { AuthService } from '@/app/services/auth.service'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { AxiosError } from 'axios'

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const response = await AuthService.me(accessToken)
    return NextResponse.json(response, { status: 200 })
  } catch (e) {
    if (e instanceof AxiosError) {
      return NextResponse.json(
        { message: e.response?.data?.message || e.message },
        { status: e.response?.status || 500 }
      )
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
