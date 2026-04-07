import { z } from "zod";

// Theo đặc tả: Định dạng số điện thoại VN ^0\d{9}$
const phoneRegex = /^0\d{9}$/;

export const LoginSchema = z.object({
  contact: z
    .string()
    .min(1, { message: "Vui lòng nhập Email hoặc Số điện thoại" }),

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

// FIX: Password policy đúng BR-05 (≥8 chars, có hoa, có số)
export const newPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số')

/** Used when the user follows the reset link and enters a new password */
export const ConfirmResetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Token không hợp lệ'),
  newPassword: newPasswordSchema,
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu không khớp',
  path: ['confirmPassword'],
})

export type ConfirmResetPasswordFormValues = z.infer<typeof ConfirmResetPasswordSchema>

// THÊM: OTP schemas
export const ForgotPasswordSchema = z.object({
  phoneNumber: z.string()
    .regex(/^0\d{9}$/, 'SĐT không hợp lệ (10 số, bắt đầu 0)'),
})

export const VerifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^0\d{9}$/),
  otp: z.string().length(6, 'OTP gồm 6 chữ số').regex(/^\d{6}$/),
})

export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>
export type VerifyOtpFormValues = z.infer<typeof VerifyOtpSchema>

