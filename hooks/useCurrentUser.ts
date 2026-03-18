import { useQuery } from '@tanstack/react-query'
import { AuthService } from '@/app/services/auth.service'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

export function useCurrentUser() {
  const { setUserDetail, accessToken, setAccessAndRefreshToken } = useAuthStore()

  const { data: token, isLoading: isLoadingToken } = useQuery({
    queryKey: ['tokenNext'],
    queryFn: () => AuthService.meTokenNext(),
    staleTime: Infinity,
    retry: false
  })

  const { data, isLoading } = useQuery({
    queryKey: ['currentUser', accessToken],
    queryFn: () => AuthService.me(),
    staleTime: 30000,
    enabled: !!accessToken,
    refetchOnMount: true
  })

  useEffect(() => {
    if (data) {
      setUserDetail(data)
    }
  }, [data, setUserDetail])

  useEffect(() => {
    if (token) {
      setAccessAndRefreshToken(token)
    }
  }, [token, setAccessAndRefreshToken])

  return {
    user: data,
    isLoading: isLoadingToken || isLoading || (!!accessToken && !data)
  }
}
