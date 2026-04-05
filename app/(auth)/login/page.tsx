"use client";

import { motion } from "framer-motion";
import { Shield, ChevronLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* Visual Side - Hidden on Mobile, shown from MD up */}
      <div className="hidden md:flex md:w-[40%] lg:w-1/2 relative bg-gradient-to-br from-orange-500 to-orange-600 items-center justify-center p-6 lg:p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-200 rounded-full blur-[100px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-white max-w-lg"
        >
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-md rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-10 border border-white/30 shadow-2xl">
            <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black mb-4 lg:mb-6 leading-[1.1] tracking-tight">
            Nền tảng <br className="hidden lg:block" /> Chấm công <br /> Thế hệ mới
          </h1>
          <p className="text-orange-50 text-base lg:text-xl leading-relaxed font-medium opacity-90">
            Giải pháp quản lý nhân sự thông minh, chính xác và bảo mật tuyệt đối cho doanh nghiệp hiện đại.
          </p>
        </motion.div>

        {/* Decorative element */}
        <div className="absolute bottom-8 lg:bottom-12 left-8 lg:left-12 right-8 lg:right-12 flex justify-between items-end">
            <div className="flex gap-2">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white/40" />)}
            </div>
            <p className="text-white/60 text-[10px] lg:text-xs font-bold tracking-[0.3em] uppercase">PointTrack Dashboard v2.0</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col relative min-h-[100dvh] overflow-y-auto">
        
        {/* Mobile Header Background */}
        <div className="md:hidden absolute top-0 left-0 right-0 h-[25vh] sm:h-[30vh] bg-gradient-to-br from-orange-500 to-orange-600 rounded-b-[40px] z-0 shadow-lg" />

        {/* Top Navigation */}
        <div className="relative z-20 flex justify-between items-center p-6 lg:p-8">
            <Link 
                href="/" 
                className="flex items-center gap-2 text-white md:text-slate-500 hover:opacity-80 transition-all font-bold text-sm"
            >
                <ChevronLeft size={18} />
                <span>Trang chủ</span>
            </Link>
            <div className="md:hidden w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Shield className="w-5 h-5 text-white" />
            </div>
        </div>

        {/* Main Form Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 relative z-10">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] transition-all duration-300"
            >
                <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-6 sm:p-10 lg:p-12 border border-slate-100 dark:border-slate-800">
                    <div className="mb-8 lg:mb-10">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Đăng nhập</h2>
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-12 bg-orange-500 rounded-full" />
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium uppercase tracking-wider">Hệ thống PointTrack</p>
                        </div>
                    </div>

                    <LoginForm />

                    <div className="mt-8 lg:mt-10 pt-6 lg:pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
                        <p className="text-[10px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-[0.3em]">
                            © 2026 PointTrack Technology
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Footer info for Desktop */}
        <div className="hidden md:flex justify-center p-6 lg:p-8">
            <p className="text-slate-300 text-[10px] lg:text-[11px] font-medium text-center">Bảo mật bởi Cloudflare Turnstile & SSL mã hóa 256-bit</p>
        </div>
      </div>
    </div>
  );
}

