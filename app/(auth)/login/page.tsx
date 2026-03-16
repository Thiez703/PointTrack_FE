"use client";

import { motion } from "framer-motion";
import { Shield, ChevronLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="login-app-container min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-x-hidden relative">
      
      {/* Background Decor - Full screen on Desktop */}
      <div className="absolute top-0 left-0 right-0 h-72 lg:h-96 bg-gradient-to-br from-orange-500 to-orange-600 rounded-b-[40px] lg:rounded-b-[80px] overflow-hidden z-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full" />
          <div className="absolute top-20 -left-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-24 h-24 bg-white rounded-full" />
        </div>
      </div>

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-bold">Quay lại</span>
      </Link>

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-[1200px] lg:flex-row lg:gap-20 lg:-mt-40">
        
        {/* Text Section - Only visible or prominent on Desktop */}
        <div className="hidden lg:flex flex-1 flex-col text-white relative lg:-top-32">
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8">
                    <Shield className="w-10 h-10 text-orange-500" />
                </div>
                <h1 className="text-5xl font-black mb-4 leading-tight drop-shadow-lg">
                    Chào mừng bạn đến với <br /> PointTrack
                </h1>
                <p className="text-orange-50 text-lg max-w-md leading-relaxed font-medium drop-shadow-md">
                    Hệ thống quản lý chấm công di động hàng đầu. <br /> 
                    Bắt đầu phiên làm việc của bạn chỉ với vài thao tác.
                </p>
            </motion.div>
        </div>

        {/* Login Card - Responsive Width */}
        <div className="w-full max-w-[450px] mt-14 lg:mt-0">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-white rounded-[40px] shadow-2xl p-8 lg:p-10"
            >
                <div className="text-center mb-8 lg:hidden">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800">Đăng nhập</h2>
                    <p className="text-sm text-gray-400 mt-1">Nhập thông tin tài khoản của bạn</p>
                </div>

                <div className="hidden lg:block mb-8">
                    <h2 className="text-3xl font-black text-gray-800">Đăng nhập</h2>
                    <p className="text-sm text-gray-400 mt-2 font-medium">Nhập thông tin để truy cập hệ thống quản lý</p>
                </div>

                <LoginForm />

                <div className="mt-8 text-center border-t border-gray-50 pt-6">
                    <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">
                        © 2026 PointTrack Technology
                    </p>
                </div>
            </motion.div>
        </div>

      </div>
    </div>
  );
}
