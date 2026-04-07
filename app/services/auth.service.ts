import { apiJava, apiNext } from '@/lib/axios'
import { API_ENDPOINTS } from '@/lib/endpoints'
import {
  AuthResponse,
  LoginFormValues,
  UserMeResponse,
} from "@/app/types/auth.schema";

export class AuthService {
  // ─── Direct Java BE calls (used in Next.js server-side proxy routes) ───

  static async loginJava(userData: LoginFormValues): Promise<AuthResponse> {
    const response = await apiJava.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, userData)
    return response.data
  }

  /** Called by /api/auth/refresh route — sends refreshToken, gets new tokens back */
  static async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await apiJava.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken })
    return response.data
  }

  /** Called by /api/auth/logout route — requires token for server-side proxy */
  static async logout(token?: string): Promise<void> {
    await apiJava.post(
      API_ENDPOINTS.AUTH.LOGOUT,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    )
  }

  // ─── Via Next.js proxy (client-side, sets/clears HttpOnly cookies) ───

  static async login(userData: LoginFormValues): Promise<AuthResponse> {
    const response = await apiNext.post<AuthResponse>('auth/login', userData)
    return response.data
  }

  /** Called by axios interceptor when 401 — proxy handles cookie refresh */
  static async refreshAuthTokenNext(): Promise<AuthResponse> {
    const response = await apiNext.post<AuthResponse>('auth/refresh')
    return response.data
  }

  static async logoutNext(): Promise<void> {
    await apiNext.post('auth/logout')
  }

  // ─── Session info ───

  static async meNext(): Promise<UserMeResponse> {
    const response = await apiNext.get<UserMeResponse>('auth/me')
    return response.data
  }

  static async meTokenNext(): Promise<AuthResponse> {
    const response = await fetch('/api/auth/me-token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error('Failed to fetch token')
    return response.json()
  }

  /** Returns the logged-in user's profile (direct object per v1 spec) */
  static async me(token?: string): Promise<UserMeResponse> {
    const response = await apiJava.get<UserMeResponse>(
      API_ENDPOINTS.AUTH.ME,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    )
    return response.data
  }

  /** GET /api/auth/profile — returns the object directly (no wrapper) */
  static async getProfile(): Promise<UserMeResponse> {
    const response = await apiJava.get<UserMeResponse>(API_ENDPOINTS.AUTH.PROFILE)
    return response.data
  }

  static async updateProfile(data: {
    phoneNumber?: string
    avatarUrl?: string
  }): Promise<UserMeResponse> {
    const response = await apiJava.put<UserMeResponse>(API_ENDPOINTS.AUTH.PROFILE, data)
    return response.data
  }

  // ─── Password management ───

  // UPDATE: forgotPassword dùng phoneNumber thay email
  static async forgotPassword(phoneNumber: string): Promise<{ message: string }> {
    const response = await apiJava.post<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { phoneNumber }
    )
    return response.data
  }

  // ADD: verifyOtp — bước 2 sau khi nhận OTP qua SMS
  static async verifyOtp(
    phoneNumber: string, 
    otp: string
  ): Promise<{ data: { resetToken: string }; message: string }> {
    const response = await apiJava.post(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      { phoneNumber, otp }
    )
    return response.data
  }

  // UPDATE: resetPassword nhận resetToken thay vì email token
  static async resetPasswordWithToken(data: {
    resetToken: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    await apiJava.put(API_ENDPOINTS.AUTH.RESET_PASSWORD, data)
  }

  static async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    await apiJava.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  }

  /** Called when forcePasswordChange === true — returns new AuthResponse */
  static async firstChangePasswordJava(data: {
    newPassword: string
    confirmPassword: string
  }, token?: string): Promise<AuthResponse> {
    const response = await apiJava.put<AuthResponse>(
      API_ENDPOINTS.AUTH.FIRST_CHANGE_PASSWORD,
      data,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    )
    return response.data
  }

  static async firstChangePassword(data: {
    newPassword: string
    confirmPassword: string
  }): Promise<AuthResponse> {
    const response = await apiNext.put<AuthResponse>('auth/first-change-password', data)
    return response.data
  }
}
