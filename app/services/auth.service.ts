import { apiJava } from '@/lib/axios'
import { RegisterRequest, UserResponse, AuthResponse, LoginFormValues } from "@/app/types/auth.schema";

export class AuthService {
  private static readonly PREFIX = '/v1/auth'

  static async login(userData: LoginFormValues): Promise<AuthResponse> {
    // Gọi API với cấu trúc dữ liệu mới: phoneNumber, password, captchaToken
    const response = await apiJava.post<AuthResponse>(`${this.PREFIX}/login`, userData)
    return response.data
  }

  static async register(userData: RegisterRequest): Promise<UserResponse> {
    const response = await apiJava.post<UserResponse>(`${this.PREFIX}/signup`, userData);
    return response.data;
  }

  // Giữ lại các method cần thiết cho interceptor nếu có
  static async refreshAuthTokenNext(): Promise<AuthResponse> {
    // Giả định endpoint refresh (có thể cần cập nhật theo đặc tả BE sau)
    const response = await apiJava.post<AuthResponse>(`${this.PREFIX}/refresh`)
    return response.data
  }
}
