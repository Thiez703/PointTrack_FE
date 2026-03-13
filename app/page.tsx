"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Sparkles, Rocket } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 p-6 overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center z-10"
      >
        {/* Icon Badge */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-bold mb-8 shadow-sm"
        >
          <Sparkles size={16} className="animate-pulse" />
          <span>PointTrack Academy</span>
        </motion.div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
          Chào mừng các em đến với <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400">
            Bộ môn React
          </span>
        </h1>

        {/* Subtitle / Good luck */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4 mb-12"
        >
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
            Hành trình chinh phục Frontend bắt đầu từ đây <Rocket size={20} className="text-orange-500" />
          </p>
          <span className="text-2xl md:text-3xl font-serif italic text-teal-600 dark:text-teal-400 font-bold tracking-widest">
            " Good luck! "
          </span>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex justify-center items-center"
        >
          <Link 
            href="/login" 
            className="group flex items-center justify-center gap-3 w-full sm:w-64 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-teal-200 dark:shadow-teal-900/20 active:scale-95"
          >
            <LogIn size={20} />
            Đăng nhập hệ thống
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] font-black">
            Powered by PointTrack Tech
          </p>
          <div className="w-8 h-1 bg-teal-500/30 rounded-full" />
        </div>
      </motion.div>

    </div>
  );
}
