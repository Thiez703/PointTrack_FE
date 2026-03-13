import Link from "next/link";
import { X, ShieldCheck } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập - PointTrack",
  description: "Đăng nhập vào hệ thống PointTrack của bạn.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[100dvh] w-full flex font-sans text-slate-900 overflow-hidden bg-white">
    
      {/* --- LEFT SIDE (Desktop Styling) - Ẩn trên Mobile --- */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden group">
        
        {/* CSS Pattern Background instead of broken image */}
        <div className="absolute inset-0 opacity-20 transition-transform duration-[20000ms] ease-in-out group-hover:scale-110" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #14b8a6 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-teal-950/95 via-teal-900/70 to-teal-900/30" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 text-white">
            <div className="flex items-center gap-5">
                <div className="relative group/logo cursor-default">
                    <div className="absolute -inset-1 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl blur-md opacity-50 group-hover/logo:opacity-100 transition duration-500"></div>
                    <div className="relative w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                         <ShieldCheck className="w-8 h-8 text-teal-300" />
                    </div>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
                        Point<span className="text-teal-300">Track</span>
                    </h1>
                    <span className="text-[10px] text-teal-100 uppercase tracking-[0.2em] font-medium border-l-2 border-teal-400 pl-2 opacity-80">
                        Smart Management
                    </span>
                </div>
            </div>

            <div className="mb-4 relative">
                <div className="w-16 h-1.5 bg-gradient-to-r from-teal-400 to-transparent mb-6 rounded-full"></div>
                <h2 className="text-4xl lg:text-[3rem] font-extrabold tracking-tight mb-4 leading-[1.1]">
                  Quản lý <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-white to-teal-200">
                    Thông minh & Hiệu quả
                  </span>
                </h2>
                <p className="text-teal-50/80 text-base max-w-lg leading-relaxed font-light border-l border-white/20 pl-6">
                  "Chào mừng đến với PointTrack. Hệ thống quản lý tích hợp hàng đầu."
                </p>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-teal-200/50 font-medium tracking-wide">
                <span>© 2026 POINTTRACK INC.</span>
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE (FORM) - Luôn hiển thị, chiếm 100% trên Mobile --- */}
      <div className="w-full lg:w-1/2 bg-white relative overflow-y-auto h-screen flex flex-col">
        
        {/* Nút X thoát */}
        <div className="flex justify-end p-4 lg:p-6">
           <Link 
              href="/" 
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-200 z-50 bg-slate-50 lg:bg-transparent"
            >
              <X size={24} />
            </Link>
        </div>

        {/* Wrapper chính */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 pb-12">
            
            <div className="w-full max-w-[400px]">
                
                {/* Mobile Logo & Title */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative w-20 h-20 rounded-2xl shadow-xl shadow-teal-100 bg-teal-600 flex items-center justify-center border-4 border-white mb-4 lg:hidden">
                      <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Chào mừng bạn!</h2>
                        <p className="text-[15px] text-slate-500 font-medium">Đăng nhập để tiếp tục quản lý</p>
                    </div>
                </div>

                {/* LOGIN FORM */}
                <LoginForm />

                {/* Footer links */}
                <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-slate-400 font-medium">
                    <Link href="#" className="hover:text-teal-600 transition-colors">Điều khoản</Link>
                    <Link href="#" className="hover:text-teal-600 transition-colors">Bảo mật</Link>
                    <Link href="#" className="hover:text-teal-600 transition-colors">Hỗ trợ</Link>
                </div>

                <div className="mt-8 lg:hidden text-center">
                   <p className="text-[11px] text-slate-300 uppercase tracking-widest font-bold">© 2026 POINTTRACK INC.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
