import { z } from "zod";

// Theo đặc tả: Định dạng số điện thoại VN ^0\d{9}$
const phoneRegex = /^0\d{9}$/;

export const LoginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, { message: "Vui lòng nhập Số điện thoại" })
    .regex(phoneRegex, { message: "Số điện thoại VN không hợp lệ (ví dụ: 0912345678)" }),

  password: z
    .string()
    .min(1, { message: "Mật khẩu không được để trống" }),

  captchaToken: z.string().min(1, {
    message: "Vui lòng xác nhận Captcha",
  }),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  role: "ADMIN" | "USER";
  forcePasswordChange: boolean;
};

export type UserMeResponse = {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl: string | null
  status: string
  role: { id: number; slug: string; displayName: string }
  salaryLevelId: number
  salaryLevelName: string
  createdAt: string
}

// --- Các Schema khác ---
export const RegisterSchema = z
  .object({
    fullName: z.string().min(5, { message: "Họ tên phải có ít nhất 5 ký tự" }),
    contact: z.string().min(1, { message: "Vui lòng nhập Email hoặc SĐT" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z.string().min(1, { message: "Vui lòng nhập lại mật khẩu" }),
    captchaToken: z.string().min(1, { message: "Vui lòng xác nhận Captcha" }),
    terms: z
      .boolean()
      .refine((v) => v === true, { message: "Vui lòng đồng ý với điều khoản dịch vụ" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof RegisterSchema>
/** Payload actually sent to the backend — excludes FE-only validation fields */
export type RegisterRequest = Omit<RegisterFormValues, 'confirmPassword' | 'terms'>
export type UserResponse = { id: number; fullName: string; email: string }

/** Used by the forgot-password UI form (just collects email) */
export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>

/** Used when the user follows the reset link and enters a new password */
export const ConfirmResetPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Token không hợp lệ" }),
    newPassword: z
      .string()
      .length(6, { message: "Mật khẩu phải đúng 6 chữ số" })
      .regex(/^\d{6}$/, { message: "Mật khẩu phải gồm 6 chữ số" }),
    confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type ConfirmResetPasswordFormValues = z.infer<typeof ConfirmResetPasswordSchema>
