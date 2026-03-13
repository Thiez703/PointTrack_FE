"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Turnstile from "react-turnstile";

import { LoginSchema, LoginFormValues } from "@/app/types/auth.schema";
import { AuthService } from "@/app/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACqPbo4Qy-JfhL5U";
  
  const {
    register,
    handleSubmit,
    setValue,
    setError,
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
      setAuth(data);
      toast.success("Đăng nhập thành công!");

      if (data.forcePasswordChange) {
        router.push("/auth/first-change-password");
      } else {
        if (data.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/user");
        }
      }
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail || error?.response?.data?.message || "";

      if (status === 400) {
        toast.error("Xác thực Captcha không hợp lệ hoặc dữ liệu sai định dạng");
      } else if (status === 401) {
        if (detail.toLowerCase().includes("vô hiệu hóa")) {
          toast.error("Tài khoản đã bị vô hiệu hóa");
        } else {
          toast.error("Thông tin đăng nhập không hợp lệ (SĐT hoặc mật khẩu)");
        }
      } else {
        toast.error("Lỗi hệ thống, vui lòng thử lại.");
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

  const getInputClass = (hasError: boolean) =>
    `group flex items-center bg-gray-50 border rounded-xl transition-all duration-200 ${
      hasError
        ? "border-red-500 ring-1 ring-red-100"
        : "border-gray-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-50"
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-700 ml-1">Số điện thoại</label>
        <div className={getInputClass(!!errors.phoneNumber)}>
          <div className={`pl-4 ${errors.phoneNumber ? "text-red-500" : "text-slate-400"}`}>
            <Phone size={20} />
          </div>
          <input
            type="tel"
            placeholder="Ví dụ: 0912345678"
            className="w-full bg-transparent py-3.5 px-3 text-[15px] focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
            disabled={mutation.isPending}
            autoComplete="tel"
            {...register("phoneNumber")}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-[11px] text-red-500 font-medium ml-1 mt-1">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center px-1">
          <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
          <Link href="/reset-password" name="reset-password" className="text-xs text-teal-600 hover:text-teal-700 font-bold active:scale-95 transition-transform">
            Quên mật khẩu?
          </Link>
        </div>
        <div className={getInputClass(!!errors.password)}>
          <div className={`pl-4 ${errors.password ? "text-red-500" : "text-slate-400"}`}>
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            className="w-full bg-transparent py-3.5 px-3 text-[15px] focus:outline-none text-slate-800 font-medium"
            disabled={mutation.isPending}
            autoComplete="current-password"
            {...register("password")}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            className="pr-4 text-slate-400 active:text-teal-600 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[11px] text-red-500 font-medium ml-1 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="w-full scale-90 sm:scale-100 flex justify-center overflow-hidden min-h-[65px]">
          <Turnstile
            sitekey={SITE_KEY}
            onVerify={(token) => {
              setValue("captchaToken", token, { shouldValidate: true });
              clearErrors("captchaToken");
            }}
            onExpire={() => setValue("captchaToken", "", { shouldValidate: true })}
          />
        </div>
        {errors.captchaToken && (
          <p className="text-[11px] text-red-500 font-medium mt-2">{errors.captchaToken.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending || !captchaToken}
        className={`w-full py-4 font-bold rounded-2xl transition-all duration-300 shadow-md ${
          (mutation.isPending || !captchaToken)
            ? "bg-slate-200 text-slate-400 cursor-not-allowed scale-[0.98] shadow-none"
            : "bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white shadow-teal-200"
        } text-base tracking-wide`}
      >
        {mutation.isPending ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
      </button>

      <div className="text-center pt-4">
        <p className="text-sm text-slate-500">
          Người dùng mới?{" "}
          <Link href="/signup" className="text-teal-600 font-extrabold hover:underline ml-1">
            Đăng ký tài khoản
          </Link>
        </p>
      </div>
    </form>
  );
}
