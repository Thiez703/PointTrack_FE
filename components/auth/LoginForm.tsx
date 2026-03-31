"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Turnstile from "react-turnstile";
import { motion } from "framer-motion";

import { LoginSchema, LoginFormValues } from "@/app/types/auth.schema";
import { AuthService } from "@/app/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";
import { getErrorMessage } from "@/lib/errorMessages";
import { tokenUtils } from "@/lib/tokenUtils";

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);

  // Clear any existing tokens on mount for a fresh session
  useEffect(() => {
    tokenUtils.removeToken();
  }, []);

  // Sử dụng Key thử nghiệm "Always Pass" của Cloudflare để tránh lỗi xác minh thất bại ở localhost
  // Link ref: https://developers.cloudflare.com/turnstile/troubleshooting/#testing-locally-and-in-ci
  const SITE_KEY = "1x00000000000000000000AA"; 
  
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    mode: "all",
    defaultValues: {
      phoneNumber: "",
      password: "",
      captchaToken: "",
    },
  });

  const captchaToken = watch("captchaToken");

  const mutation = useMutation({
    mutationFn: (data: LoginFormValues) => AuthService.login(data),
    onSuccess: (data) => {
      // Store token for direct Java API calls via apiJava interceptor
      tokenUtils.setToken(data.accessToken);
      tokenUtils.setRefreshToken(data.refreshToken);
      
      setAuth(data);
      toast.success("Đăng nhập thành công!");

      if (data.forcePasswordChange) {
        router.push("/auth/first-change-password");
      } else {
        if (data.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const detail = getErrorMessage(error);

      if (status === 400) {
        toast.error(detail || "Xác thực Captcha không hợp lệ hoặc dữ liệu sai định dạng");
      } else if (status === 401) {
        if (detail.toLowerCase().includes("vô hiệu hóa")) {
          toast.error("Tài khoản đã bị vô hiệu hóa");
        } else {
          toast.error("Thông tin đăng nhập không hợp lệ (SĐT hoặc mật khẩu)");
        }
      } else {
        toast.error(detail || `Lỗi hệ thống (${status || 'Network Error'}), vui lòng thử lại.`);
      }

      resetCaptcha();
    },
  });

  const resetCaptcha = () => {
    setValue("captchaToken", "", { shouldValidate: true });
    if (typeof window !== "undefined" && (window as any).turnstile) {
      (window as any).turnstile.reset();
    }
  };

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 lg:space-y-6 w-full">
      {/* Phone input */}
      <div>
        <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5 lg:mb-2 block ml-1">Số điện thoại</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
             <Phone className={`w-5 h-5 ${errors.phoneNumber ? "text-red-500" : "text-gray-400 dark:text-slate-500"}`} />
          </div>
          <input
            type="tel"
            placeholder="Nhập số điện thoại"
            disabled={mutation.isPending}
            className={`login-input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.phoneNumber ? "border-red-500 ring-1 ring-red-100" : ""}`}
            {...register("phoneNumber")}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-[11px] text-red-500 font-medium ml-1 mt-1.5">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Password input */}
      <div>
        <label className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5 lg:mb-2 block ml-1">Mật khẩu</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Lock className={`w-5 h-5 ${errors.password ? "text-red-500" : "text-gray-400 dark:text-slate-500"}`} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            disabled={mutation.isPending}
            className={`login-input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.password ? "border-red-500 ring-1 ring-red-100" : ""}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors z-10"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-red-500 font-medium ml-1 mt-1.5">{errors.password.message}</p>
        )}
      </div>

      {/* Captcha - Cloudflare Turnstile */}
      <div className="flex flex-col items-center py-2 lg:py-4 min-h-[70px] relative w-full overflow-hidden">
        {isCaptchaLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-white dark:bg-slate-900 rounded-xl">
            <div className="w-full h-full min-h-[65px] bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-center gap-3 px-4">
              <div className="w-4 h-4 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin flex-shrink-0" />
              <span className="text-[11px] sm:text-[12px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-tight truncate">Đang xác thực...</span>
            </div>
          </div>
        )}
        <div className={`w-full flex justify-center transition-opacity duration-500 ${isCaptchaLoading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="scale-[0.85] xs:scale-100 transition-transform duration-300 origin-center">
            <Turnstile
              sitekey={SITE_KEY}
              onLoad={() => setIsCaptchaLoading(false)}
              onVerify={(token) => {
                setValue("captchaToken", token, { shouldValidate: true });
                clearErrors("captchaToken");
              }}
              onExpire={() => setValue("captchaToken", "", { shouldValidate: true })}
              onError={() => {
                  setIsCaptchaLoading(false);
                  toast.error("Lỗi tải Captcha. Vui lòng làm mới trang.");
              }}
            />
          </div>
        </div>
        {errors.captchaToken && !isCaptchaLoading && (
          <p className="text-[11px] text-red-500 font-medium mt-1.5">{errors.captchaToken.message}</p>
        )}
      </div>

      {/* Login button */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.98 }}
        disabled={mutation.isPending || !captchaToken}
        className="login-btn-primary w-full !py-4 lg:!py-5 !rounded-2xl !text-base lg:!text-lg !font-black disabled:opacity-60 shadow-xl shadow-orange-100 dark:shadow-none transition-all duration-300"
      >
        {mutation.isPending ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="tracking-widest">ĐANG XỬ LÝ...</span>
          </div>
        ) : (
          <span className="tracking-widest uppercase">Đăng nhập</span>
        )}
      </motion.button>
    </form>
  );
}
