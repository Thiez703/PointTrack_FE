"use client";

import React, { useCallback } from 'react';
import { 
    Home, Calendar, MapPin, ArrowLeftRight, User, LogOut, 
    LayoutDashboard, Briefcase, Settings, Bell, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { toast } from 'sonner';

const navItems = [
    { id: '/', label: 'Trang chủ', icon: Home, short: 'Home' },
    { id: '/calendar', label: 'Lịch làm việc', icon: Calendar, short: 'Lịch' },
    { id: '/checkin', label: 'Chấm công', icon: MapPin, short: 'GPS', special: true },
    { id: '/exchange', label: 'Đổi ca làm', icon: ArrowLeftRight, short: 'Đổi ca' },
    { id: '/profile', label: 'Tài khoản', icon: User, short: 'Hồ sơ' },
];

const AUTH_PATHS = ['/login', '/signup', '/reset-password', '/forgot-password', '/auth/first-change-password'];

export default function Navigation() {
    const pathname = usePathname();
    const router = useRouter();
    const { userInfo: authUser, logout } = useAuthStore();
    const { isCollapsed, toggleCollapse, setIsOpen } = useSidebarStore();

    const handleLogout = useCallback(() => {
        logout();
        toast.success('Đã đăng xuất');
        router.push('/login');
    }, [logout, router]);

    const isAuthPath = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
    const isAdminPath = pathname.startsWith('/admin');

    if (!authUser || isAuthPath || isAdminPath) return null;

    return (
        <>
            {/* --- MOBILE BOTTOM NAV (< 1024px) --- */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[32px] flex items-center justify-around h-20 px-2 shadow-2xl shadow-gray-200 dark:shadow-none backdrop-blur-xl bg-opacity-90 dark:bg-opacity-90">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.id;
                        
                        if (item.special) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        router.push(item.id);
                                        setIsOpen(false);
                                    }}
                                    className="relative -top-6 flex flex-col items-center group"
                                >
                                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200 dark:shadow-none ring-4 ring-white dark:ring-slate-900 transition-transform group-active:scale-90">
                                        <MapPin className="w-7 h-7 text-white" />
                                    </div>
                                    <span className="text-[10px] mt-1.5 font-black text-orange-500 uppercase tracking-widest">GPS</span>
                                </button>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    router.push(item.id);
                                    setIsOpen(false);
                                }}
                                className="flex flex-col items-center justify-center flex-1 h-full relative"
                            >
                                <Icon className={cn("w-6 h-6 mb-1 transition-all", isActive ? "text-orange-500 scale-110" : "text-gray-400")} />
                                <span className={cn("text-[10px] font-bold uppercase tracking-tighter transition-colors", isActive ? "text-orange-500" : "text-gray-400")}>
                                    {item.short}
                                </span>
                                {isActive && (
                                    <motion.div layoutId="mobileIndicator" className="absolute -bottom-1 w-6 h-1 bg-orange-500 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- DESKTOP SIDEBAR (>= 1024px) --- */}
            <motion.aside
                initial={false}
                animate={{ width: !isCollapsed ? 280 : 88 }}
                className="hidden lg:flex fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 z-50 flex-col transition-all duration-500 ease-in-out"
            >
                {/* Logo & Toggle */}
                <div className="h-24 flex items-center px-6 justify-between border-b border-gray-50 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="min-w-[40px] h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100 dark:shadow-none">
                            <LayoutDashboard className="w-6 h-6" />
                        </div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="text-xl font-black text-gray-800 dark:text-white tracking-tighter"
                                >
                                    PointTrack
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <button 
                        onClick={toggleCollapse}
                        className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-colors"
                    >
                        {!isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-4 pt-8 space-y-2 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => router.push(item.id)}
                                className={cn(
                                    "w-full h-14 flex items-center gap-4 px-4 rounded-2xl transition-all group relative",
                                    isActive 
                                        ? "bg-orange-500 text-white shadow-xl shadow-orange-100 dark:shadow-none" 
                                        : "text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-500"
                                )}
                            >
                                <div className={cn("min-w-[24px] transition-transform", isActive ? "scale-110" : "group-hover:scale-110")}>
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="text-sm font-black uppercase tracking-widest whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && isCollapsed && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Profile Section Footer */}
                <div className="p-4 border-t border-gray-50 dark:border-slate-800">
                    <div className={cn(
                        "rounded-2xl bg-gray-50 dark:bg-slate-800 p-3 transition-all",
                        !isCollapsed ? "flex items-center gap-3" : "flex flex-col items-center"
                    )}>
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-orange-600 font-black text-sm border border-gray-100 dark:border-slate-600">
                            {authUser.fullName?.charAt(0) || 'U'}
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-gray-800 dark:text-white truncate uppercase tracking-tight">{authUser.fullName}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Nhân sự</p>
                            </div>
                        )}
                        <button 
                            onClick={handleLogout}
                            className={cn(
                                "rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors",
                                !isCollapsed ? "p-2" : "p-2 mt-2"
                            )}
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
