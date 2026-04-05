import { AuthService } from '@/app/services/auth.service'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')
  
  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.delete('accessToken')
  response.cookies.delete('refreshToken')

  if (accessToken) {
    try {
      await AuthService.logout(accessToken.value)
    } catch (error) {
      console.error('Logout error from backend:', error)
      // Vẫn tiếp tục để xóa cookie ở client
    }
  }

  return response
}

