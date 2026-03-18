import { AuthResponse } from '@/app/types/auth.schema'
import { create } from 'zustand'

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
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setAuth: (data: AuthResponse) => void
  setUserInfo: (info?: UserInfo) => void
  setAccessAndRefreshToken: (data: AuthResponse) => void
  setUserDetail: (info: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  userInfo: undefined,
  accessToken: null,
  refreshToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
  setRefreshToken: (refreshToken) => set({ refreshToken }),
  setAuth: (data: AuthResponse) =>
    set({ 
      accessToken: data.accessToken, 
      refreshToken: data.refreshToken,
      userInfo: {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        avatarUrl: data.avatarUrl,
        role: data.role
      }
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
        role: info.role || 'USER'
      }
    }),
  logout: () => set({ userInfo: undefined, accessToken: null, refreshToken: null })
}))
