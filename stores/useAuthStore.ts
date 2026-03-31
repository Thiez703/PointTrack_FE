import { AuthResponse } from '@/app/types/auth.schema'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenUtils } from '@/lib/tokenUtils'

export interface UserInfo {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  role: string;
}

interface AuthStore {
  userInfo?: UserInfo
  accessToken: string | null
  refreshToken?: string | null
  forcePasswordChange: boolean
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setAuth: (data: AuthResponse) => void
  setUserInfo: (info?: UserInfo) => void
  setAccessAndRefreshToken: (data: AuthResponse) => void
  setUserDetail: (info: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userInfo: undefined,
      accessToken: null,
      refreshToken: null,
      forcePasswordChange: false,

      setAccessToken: (accessToken) => set({ accessToken }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),

      setAuth: (data: AuthResponse) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          forcePasswordChange: data.forcePasswordChange ?? false,
          userInfo: {
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            avatarUrl: data.avatarUrl,
            role: data.role,
          },
        }),

      setUserInfo: (userInfo?: UserInfo) => set({ userInfo }),

      setAccessAndRefreshToken: (data: AuthResponse) =>
        set({ accessToken: data.accessToken, refreshToken: data.refreshToken }),

      setUserDetail: (info: any) =>
        set({
          userInfo: {
            userId: info.userId || info.id,
            fullName: info.fullName || info.displayName || info.fullname,
            email: info.email,
            phoneNumber: info.phoneNumber || info.phone,
            avatarUrl: info.avatarUrl || (info.avatar && info.avatar.imageUrl),
            role: (typeof info.role === 'object' ? info.role?.slug : info.role) || 'USER',
          },
        }),

      logout: () => {
        tokenUtils.removeToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        set({ userInfo: undefined, accessToken: null, refreshToken: null, forcePasswordChange: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        userInfo: state.userInfo,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
