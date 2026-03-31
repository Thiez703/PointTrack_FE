import { useQuery } from '@tanstack/react-query'
import { AuthService } from '@/app/services/auth.service'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { tokenUtils } from '@/lib/tokenUtils'

export function useCurrentUser() {
  const { setUserDetail, setAccessAndRefreshToken } = useAuthStore()

  const { data: token, isLoading: isLoadingToken } = useQuery({
    queryKey: ['tokenNext'],
    queryFn: () => AuthService.meTokenNext(),
    staleTime: Infinity,
    retry: false,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['currentUser', token?.accessToken],
    queryFn: () => AuthService.me(token?.accessToken ?? undefined),
    staleTime: 30000,
    enabled: !!token?.accessToken,
    refetchOnMount: true,
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