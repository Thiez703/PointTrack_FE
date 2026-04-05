import { apiJava, apiNext } from '@/lib/axios'
import {
  AuthResponse,
  LoginFormValues,
  UserMeResponse,
} from "@/app/types/auth.schema";

export class AuthService {
  private static readonly PREFIX = 'auth'

  // ─── Direct Java BE calls (used in Next.js server-side proxy routes) ───

  static async loginJava(userData: LoginFormValues): Promise<AuthResponse> {
    const response = await apiJava.post<AuthResponse>(`${this.PREFIX}/login`, userData)
    return response.data
  }

  /** Called by /api/auth/refresh route — sends refreshToken, gets new tokens back */
  static async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await apiJava.post<AuthResponse>(`${this.PREFIX}/token/refresh`, { refreshToken })
    return response.data
  }

  /** Called by /api/auth/logout route — requires token for server-side proxy */
  static async logout(token?: string): Promise<void> {
    await apiJava.post(
      `${this.PREFIX}/logout`,
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
      `${this.PREFIX}/me`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    )
    return response.data
  }

  /** GET /api/auth/profile — returns the object directly (no wrapper) */
  static async getProfile(): Promise<UserMeResponse> {
    const response = await apiJava.get<UserMeResponse>(`${this.PREFIX}/profile`)
    return response.data
  }

  static async updateProfile(data: {
    phoneNumber?: string
    avatarUrl?: string
  }): Promise<UserMeResponse> {
    const response = await apiJava.put<UserMeResponse>(`${this.PREFIX}/profile`, data)
    return response.data
  }

  // ─── Password management ───

  // UPDATE: forgotPassword dùng phoneNumber thay email
  static async forgotPassword(phoneNumber: string): Promise<{ message: string }> {
    const response = await apiJava.post<{ message: string }>(
      `${this.PREFIX}/password/forgot`,
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
      `${this.PREFIX}/password/verify-otp`,
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
    await apiJava.put(`${this.PREFIX}/password/reset`, data)
  }

  static async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<void> {
    await apiJava.put(`${this.PREFIX}/password/change`, data)
  }

  /** Called when forcePasswordChange === true — returns new AuthResponse */
  static async firstChangePassword(data: {
    newPassword: string
    confirmPassword: string
  }): Promise<AuthResponse> {
    const response = await apiJava.put<AuthResponse>(
      `${this.PREFIX}/password/first-change`,
      data
    )
    return response.data
  }
}
