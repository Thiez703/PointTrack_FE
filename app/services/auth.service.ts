import { apiJava, apiNext } from '@/lib/axios'
import { RegisterRequest, UserResponse, AuthResponse, LoginFormValues } from "@/app/types/auth.schema";

export class AuthService {
  private static readonly PREFIX = '/v1/auth'

  // 1. Gọi trực tiếp Java BE (Dùng cho Server-side Proxy)
  static async loginJava(userData: LoginFormValues): Promise<AuthResponse> {
    const response = await apiJava.post<AuthResponse>(`${this.PREFIX}/login`, userData)
    return response.data
  }

  static async signupJava(userData: RegisterRequest): Promise<UserResponse> {
    const response = await apiJava.post<UserResponse>(`${this.PREFIX}/signup`, userData);
    return response.data;
  }

  // 2. Gọi qua Next.js Proxy (Dùng cho LoginForm để set Cookie HttpOnly)
  static async login(userData: LoginFormValues): Promise<AuthResponse> {
    const response = await apiNext.post<AuthResponse>('/auth/login', userData)
    return response.data
  }

  static async register(userData: RegisterRequest): Promise<UserResponse> {
    const response = await apiNext.post<UserResponse>('/auth/signup', userData);
    return response.data;
  }

  // 3. Các hàm lấy thông tin phiên
  static async meTokenNext(): Promise<AuthResponse> {
    const response = await fetch('/api/auth/me-token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }
    return response.json();
  }

  static async me(): Promise<AuthResponse> {
    const response = await apiJava.get<AuthResponse>(`${this.PREFIX}/me`)
    return response.data
  }
}
