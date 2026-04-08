import { useQuery } from '@tanstack/react-query'
import { AuthService } from '@/app/services/auth.service'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { tokenUtils } from '@/lib/tokenUtils'
import { usePathname } from 'next/navigation'

export function useCurrentUser() {
  const { setUserDetail, setAccessAndRefreshToken } = useAuthStore()
  const pathname = usePathname()

  // Danh sách các trang không cần check token ngay lập tức
  const isAuthPage = ['/login', '/signup', '/reset-password', '/forgot-password'].some(p => pathname.startsWith(p))

  const { data: token, isLoading: isLoadingToken } = useQuery({
    queryKey: ['tokenNext'],
    queryFn: () => AuthService.meTokenNext(),
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !isAuthPage, // Chỉ gọi khi không phải trang auth
  })

  const { data, isLoading } = useQuery({
    queryKey: ['currentUser', token?.accessToken],
    queryFn: () => AuthService.me(token?.accessToken ?? undefined),
    staleTime: 300000,
    enabled: !!token?.accessToken,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  useEffect(() => {
    if (data) {
      const userData = (data as any)?.data ?? data
      setUserDetail({
        id: userData.id,
        userId: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        avatarUrl: userData.avatarUrl,
        role: typeof userData.role === 'object' ? userData.role?.slug : userData.role,
      })
    }
  }, [data, setUserDetail])

  useEffect(() => {
    if (token) {
      setAccessAndRefreshToken(token)
      tokenUtils.setToken(token.accessToken)
      tokenUtils.setRefreshToken(token.refreshToken)
    }
  }, [token, setAccessAndRefreshToken])

  return {
    user: data,
    isLoading: isLoadingToken || isLoading || (!!token?.accessToken && !data),
  }
}