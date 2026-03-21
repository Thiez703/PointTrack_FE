"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { AuthService } from "@/app/services/auth.service";
import { useAuthStore } from "@/stores/useAuthStore";

const Schema = z
  .object({
    newPassword: z
      .string()
      .length(6, "Mật khẩu phải đúng 6 chữ số")
      .regex(/^\d{6}$/, "Mật khẩu phải gồm 6 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof Schema>;

export default function FirstChangePasswordPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => AuthService.firstChangePassword(data),
    onSuccess: async (data) => {
      setAuth(data);
      // Clear the server-side forcePasswordChange cookie
      await fetch("/api/auth/clear-force-password", { method: "POST" });
      toast.success("Đổi mật khẩu thành công! Chào mừng bạn.");
      router.push(data.role === "ADMIN" ? "/admin" : "/");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || "Đổi mật khẩu thất bại, thử lại.";
      toast.error(msg);
    },
  });

  return (
    <div className="login-app-container min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-x-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-orange-500 to-orange-600 rounded-b-[40px] overflow-hidden z-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full" />
          <div className="absolute top-20 -left-10 w-40 h-40 bg-white rounded-full" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-[440px] px-5 mt-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white rounded-[36px] shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800">
              Đổi mật khẩu lần đầu
            </h2>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Tài khoản của bạn yêu cầu đặt mật khẩu mới
              <br />
              trước khi sử dụng hệ thống.
            </p>
          </div>

          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            {/* New password */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block ml-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock
                    className={`w-5 h-5 ${errors.newPassword ? "text-red-500" : "text-gray-400"}`}
                  />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  inputMode="numeric"
                  placeholder="6 chữ số"
                  disabled={mutation.isPending}
                  className={`login-input-field ${errors.newPassword ? "border-red-500 ring-1 ring-red-100" : ""}`}
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors z-10"
                >
                  {showNew ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-[11px] text-red-500 font-medium ml-1 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block ml-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Lock
                    className={`w-5 h-5 ${errors.confirmPassword ? "text-red-500" : "text-gray-400"}`}
                  />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  inputMode="numeric"
                  placeholder="Nhập lại mật khẩu"
                  disabled={mutation.isPending}
                  className={`login-input-field ${errors.confirmPassword ? "border-red-500 ring-1 ring-red-100" : ""}`}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors z-10"
                >
                  {showConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-500 font-medium ml-1 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={mutation.isPending}
              className="login-btn-primary w-full !py-4 !rounded-2xl !text-base !font-black disabled:opacity-60 shadow-xl shadow-orange-100 mt-2"
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>ĐANG XỬ LÝ...</span>
                </div>
              ) : (
                "XÁC NHẬN ĐỔI MẬT KHẨU"
              )}
            </motion.button>
          </form>

          <p className="text-center text-[11px] text-gray-300 font-bold uppercase tracking-widest mt-8">
            © 2026 PointTrack Technology
          </p>
        </motion.div>
      </div>
    </div>
  );
}
