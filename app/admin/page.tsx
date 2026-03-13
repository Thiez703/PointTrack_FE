"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  Heart, 
  CalendarCheck, 
  ClipboardList, 
  Clock,
  UserCheck,
  Menu,
  X
} from 'lucide-react';

export default function AdminPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: ClipboardList, label: 'Bảng công chi tiết' },
    { icon: UserCheck, label: 'Quản lý nhân viên' },
    { icon: BarChart3, label: 'Thống kê & Báo cáo' },
    { icon: Clock, label: 'Cấu hình ca làm' },
    { icon: Settings, label: 'Cài đặt hệ thống' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row font-sans overflow-x-hidden">
      
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
            <CalendarCheck size={18} />
          </div>
          <span className="font-black text-slate-800 dark:text-white text-sm tracking-tight">POINTTRACK</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Đã hạ thấp xuống bằng padding và căn chỉnh top trên mobile */}
      <AnimatePresence>
        {(isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6
              lg:relative lg:translate-x-0 lg:opacity-100 lg:flex lg:pt-14
              ${isMobileMenuOpen ? 'flex shadow-2xl top-[65px]' : 'hidden'}
            `}
          >
            {/* Logo Section - Chỉ hiện trên Desktop */}
            <div className="hidden lg:flex items-center gap-3 mb-12 px-2">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-200 dark:shadow-none">
                <CalendarCheck size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-800 dark:text-white tracking-tight leading-none text-xl">POINTTRACK</span>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest mt-1">Timekeeping</span>
              </div>
            </div>
            
            <nav className="flex-1 space-y-1.5 overflow-y-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">Menu Chính</p>
              {menuItems.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                    item.active 
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-100 dark:shadow-none' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </div>
              ))}
            </nav>

            <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 lg:mb-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">AD</div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-slate-800 dark:text-white truncate">Administrator</span>
                        <span className="text-[10px] text-slate-500 truncate">admin@pointtrack.vn</span>
                    </div>
                </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Backdrop for Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden top-[65px]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-white dark:bg-slate-950 min-h-[calc(100vh-64px)] lg:min-h-screen">
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] aspect-square bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="z-10 text-center w-full max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-teal-100 dark:border-teal-800 shadow-sm">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></span>
            Attendance Online
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight sm:leading-none">
            Cố lên <br className="sm:hidden" /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 animate-gradient-x">
              các em!
            </span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg md:text-2xl font-medium mb-10 flex items-center justify-center gap-2 sm:gap-3">
            Hệ thống đã sẵn sàng <Heart className="fill-red-500 text-red-500 animate-bounce w-5 h-5 sm:w-7 sm:h-7" />
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mx-auto px-2">
            {[
                { label: 'Đúng giờ', value: '85%', color: 'text-teal-600' },
                { label: 'Đi muộn', value: '12', color: 'text-orange-500' },
                { label: 'Vắng mặt', value: '03', color: 'text-red-500' }
            ].map((stat, i) => (
              <div key={i} className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 lg:absolute lg:bottom-8 text-center px-6">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed">
            Hệ thống Quản lý Chấm công PointTrack <br className="lg:hidden" />
            Phát triển cho bộ môn React • 2026
          </p>
        </div>
      </main>

      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
