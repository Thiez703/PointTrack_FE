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

// --- Các Schema khác ---
export const RegisterSchema = z.object({
  fullName: z.string().min(5, { message: "Họ tên phải có ít nhất 5 ký tự" }),
  contact: z.string().min(1, { message: "Vui lòng nhập Email hoặc SĐT" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});
