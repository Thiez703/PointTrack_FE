"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    LogIn, Rocket, Clock, AlertTriangle, Bell,
    ChevronRight, MapPin, Calendar, Shield, Smartphone, Users, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/app/services/user.service';
import { cn } from '@/lib/utils';

export default function Home() {
    const { userInfo: authUser } = useAuthStore();
    const router = useRouter();

    const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: () => UserService.getMe(),
        enabled: !!authUser,
    });

    const user = profileResponse?.data;
    
    // Debug log to check API data in browser console
    if (user) {
        console.log("Dashboard - User workStatistics:", user.workStatistics);
    }

    const stats = user?.workStatistics;
    const weeklyChartData = Array.isArray(stats?.history) ? stats.history : [
        { month: 'T2', days: 0 }, { month: 'T3', days: 0 }, { month: 'T4', days: 0 },
        { month: 'T5', days: 0 }, { month: 'T6', days: 0 }, { month: 'T7', days: 0 }, { month: 'CN', days: 0 },
    ];

    const maxHours = Math.max(...weeklyChartData.map(d => Number(d.days) || 0), 1);

    const notifications = [
        { id: 1, title: 'Ca làm việc mới được phân công', message: 'Bạn được phân công ca sáng ngày 17/03/2026 tại KCN Tân Bình.', time: '10 phút trước', read: false, type: 'shift' },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const statCards = [
        { 
            label: 'Lương dự kiến', 
            value: formatCurrency(stats?.summary?.estimatedSalaryThisMonth || 0), 
            icon: Zap, 
            color: 'from-green-400 to-green-500' 
        },
        { 
            label: 'Tổng giờ làm', 
            value: `${(stats?.summary?.totalHoursThisMonth || 0).toFixed(2)} giờ`, 
            icon: Clock, 
            color: 'from-blue-400 to-blue-500' 
        },
        { 
            label: 'Đi muộn', 
            value: `${stats?.summary?.lateDaysThisMonth || 0} lần`, 
            icon: AlertTriangle, 
            color: 'from-red-400 to-red-500' 
        },
    ];

    // Chỉnh sửa điều kiện Loading: Hiển thị loading cho đến khi có dữ liệu user chi tiết
    if (!!authUser && (isLoadingProfile || !user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-orange-500 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // --- CASE 1: NOT LOGGED IN ---
    if (!authUser) {
        return (
            <div className="login-app-container min-h-screen flex flex-col bg-white overflow-x-hidden relative">
                {/* Background Decor - Trải rộng trên Desktop */}
                <div className="absolute top-0 left-0 right-0 h-[40vh] lg:h-[60vh] bg-gradient-to-br from-orange-500 to-orange-600 rounded-b-[40px] lg:rounded-b-[100px] z-0" />
                
                <div className="relative z-10 flex flex-col items-center px-6 pt-4 lg:pt-16 pb-10 flex-1 max-w-7xl mx-auto w-full">
                    {/* Hero Section */}
                    <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 mb-12 -mt-2 lg:-mt-10">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div 
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="w-20 h-20 bg-white rounded-[24px] shadow-2xl flex items-center justify-center mb-8 mx-auto lg:mx-0"
                            >
                                <Shield className="w-10 h-10 text-orange-500" />
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                                <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                                    PointTrack <br />
                                    <span className="text-white text-2xl lg:text-3xl font-black uppercase tracking-[0.2em] drop-shadow-sm">Smart Management</span>
                                </h1>
                                <p className="text-orange-600 lg:text-orange-50 text-base lg:text-lg max-w-[450px] mx-auto lg:mx-0 font-bold lg:font-normal opacity-100 lg:opacity-90 leading-relaxed mb-8">
                                    Giải pháp chấm công GPS & quản lý ca làm di động thông minh. Tối ưu hiệu suất cho doanh nghiệp hiện đại.
                                </p>
                                <div className="hidden lg:block">
                                    <Link href="/login" className="inline-flex items-center justify-center gap-3 bg-white text-orange-600 font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-orange-50 active:scale-[0.98] transition-all" prefetch={false}>
                                        <LogIn size={20} /> ĐĂNG NHẬP HỆ THỐNG
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* App Preview - Chỉ hiện trên Desktop */}
                        <div className="hidden lg:flex flex-1 justify-end">
                            <motion.div 
                                initial={{ opacity: 0, y: 100 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden ring-1 ring-white/20"
                            >
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl" />
                                <div className="w-full h-full bg-orange-500 p-4 pt-10">
                                    <div className="w-full h-full bg-white rounded-2xl p-4">
                                        <div className="w-12 h-1 bg-gray-100 rounded-full mb-4 mx-auto" />
                                        <div className="w-full h-32 bg-orange-100 rounded-xl mb-4 animate-pulse" />
                                        <div className="grid grid-cols-2 gap-2 mb-4">
                                            <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                                            <div className="h-20 bg-gray-50 rounded-xl animate-pulse" />
                                        </div>
                                        <div className="h-12 bg-orange-500 rounded-xl animate-pulse" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Feature Cards - Grid Responsive */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-12">
                        {[
                            { icon: Smartphone, label: 'Chấm công GPS', desc: 'Chính xác & Minh bạch' },
                            { icon: Zap, label: 'Tính công nhanh', desc: 'Tự động & Bảo mật' },
                            { icon: Users, label: 'Đổi ca linh hoạt', desc: 'Thao tác một chạm' },
                            { icon: Rocket, label: 'Hiệu suất cao', desc: 'Tối ưu hóa vận hành' }
                        ].map((f, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 hover:shadow-md transition-shadow"
                            >
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-orange-500">
                                    <f.icon size={22} />
                                </div>
                                <p className="text-sm lg:text-base font-bold text-gray-800 mb-1">{f.label}</p>
                                <p className="text-[11px] lg:text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Only Login Button */}
                    <div className="lg:hidden w-full space-y-6 mt-auto">
                        <Link href="/login" className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all" prefetch={false}>
                            <LogIn size={20} /> BẮT ĐẦU NGAY
                        </Link>
                        <p className="text-[10px] text-gray-400 text-center font-bold tracking-widest uppercase">
                            © 2026 PointTrack Technology
                        </p>
                    </div>

                    {/* Desktop Footer */}
                    <div className="hidden lg:block w-full border-t border-gray-100 pt-8 mt-12 text-center">
                        <p className="text-xs text-gray-400 font-bold tracking-[0.2em] uppercase">
                            Hệ thống quản lý tích hợp hàng đầu dành cho doanh nghiệp
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- CASE 2: LOGGED IN (DASHBOARD) ---
    return (
        <div className="flex-1 w-full pb-32 lg:pb-12">
            <div className="w-full relative">
                {/* Header Section - Modern Gradient & Responsive Design */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-16 sm:pt-24 pb-32 sm:pb-48 px-6 sm:px-12 rounded-b-[60px] lg:rounded-b-[100px] relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="flex items-center gap-6 sm:gap-8">
                            <motion.button 
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.push('/profile')} 
                                className="w-20 h-20 sm:w-28 sm:h-28 rounded-[32px] sm:rounded-[40px] bg-white/20 p-1.5 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden group"
                            >
                                <div className="w-full h-full rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center text-3xl sm:text-4xl font-black text-orange-600 transition-transform group-hover:scale-110">
                                    {(user?.fullName || 'P').charAt(0)}
                                </div>
                            </motion.button>
                            <div>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 0.8, y: 0 }}
                                    className="text-orange-50 text-xs sm:text-sm font-black uppercase tracking-[0.3em] mb-2"
                                >
                                    Chào buổi sáng ✨
                                </motion.p>
                                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none mb-3">{user?.fullName || 'Người dùng'}</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-black text-white border border-white/10 uppercase tracking-widest">{user?.role || 'USER'}</span>
                                    <div className="flex items-center gap-2 text-orange-100 text-xs sm:text-sm font-bold opacity-90">
                                        <Smartphone size={14} className="opacity-70" />
                                        {user?.phoneNumber || '--'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Highlights - Stats that look good on Desktop */}
                        <div className="hidden lg:grid grid-cols-2 gap-6 min-w-[360px]">
                             <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-lg group hover:bg-white/15 transition-all">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Công trong tháng</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-white text-3xl font-black tracking-tighter">{stats?.summary?.totalWorkDaysThisMonth ?? 0}</p>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Ngày</p>
                                </div>
                             </div>
                             <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-lg group hover:bg-white/15 transition-all">
                                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Giờ tăng ca</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-white text-3xl font-black tracking-tighter">{stats?.summary?.otHoursThisMonth ?? 0}</p>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Giờ</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Dashboard */}
                <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-20 sm:-mt-28 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                    
                    {/* LEFT COLUMN: Main Actions & Charts */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Quick Stats Grid - Better Balance */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
                            {statCards.map((stat, i) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div 
                                        key={stat.label} 
                                        initial={{ y: 20, opacity: 0 }} 
                                        animate={{ y: 0, opacity: 1 }} 
                                        transition={{ delay: i * 0.1, type: 'spring' }} 
                                        className="bg-white dark:bg-slate-900 rounded-[32px] p-5 lg:p-7 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-50 dark:border-slate-800 group hover:border-orange-200 transition-all cursor-default"
                                    >
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-gray-100 dark:shadow-none`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <p className="text-[10px] lg:text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-xl lg:text-2xl font-black text-gray-800 dark:text-white tracking-tighter">{stat.value}</p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* HIGH IMPACT ACTION: Check-in */}
                        <motion.button
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => router.push('/checkin')} 
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-[32px] p-5 sm:p-6 flex items-center gap-4 sm:gap-6 shadow-xl shadow-orange-200 dark:shadow-none border border-white/10 group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-white/10 transition-all" />
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-[24px] flex items-center justify-center backdrop-blur-xl border border-white/30 group-hover:rotate-6 transition-all shadow-lg">
                                <MapPin className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <div className="flex-1 text-left relative z-10">
                                <p className="font-black text-xl sm:text-2xl tracking-tighter mb-1">Chấm công thông minh</p>
                                <p className="text-orange-100 text-[10px] sm:text-xs font-bold opacity-80 uppercase tracking-widest leading-tight">Hệ thống GPS Sẵn sàng • Nhấn để bắt đầu</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-lg">
                                <ChevronRight className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                        </motion.button>

                        {/* Activity Chart Container */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }} 
                            transition={{ delay: 0.3 }} 
                            className="bg-white dark:bg-slate-900 rounded-[40px] p-8 sm:p-12 border border-gray-50 dark:border-slate-800 shadow-2xl shadow-gray-200/50 dark:shadow-none"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
                                <div>
                                    <h3 className="font-black text-gray-800 dark:text-white text-2xl sm:text-3xl tracking-tighter">Biểu đồ công việc</h3>
                                    <p className="text-gray-400 text-xs sm:text-sm font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        Ghi nhận 7 ngày gần nhất
                                    </p>
                                </div>
                                <div className="px-5 py-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                                    <span className="text-sm font-black text-orange-600 dark:text-orange-500 uppercase tracking-widest">Tháng 3, 2026</span>
                                </div>
                            </div>
                            
                            <div className="flex items-end justify-between gap-4 sm:gap-8 h-64 sm:h-80 relative">
                                {/* Chart Horizontal Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
                                    {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-gray-900" />)}
                                </div>

                                {weeklyChartData.map((d, i) => {
                                    const height = d.days > 0 ? (d.days / maxHours) * 100 : 4;
                                    const isToday = i === 5;
                                    return (
                                        <div key={d.month} className="flex flex-col items-center flex-1 gap-4 group relative z-10">
                                            <div className="w-full relative">
                                                <motion.div 
                                                    initial={{ height: 0 }} 
                                                    animate={{ height: `${height}%` }} 
                                                    transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 80 }} 
                                                    className={cn(
                                                        "w-full rounded-2xl sm:rounded-3xl transition-all duration-500 relative overflow-hidden",
                                                        isToday 
                                                            ? 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-2xl shadow-orange-200 dark:shadow-none' 
                                                            : d.days > 0 
                                                                ? 'bg-gray-100 dark:bg-slate-800 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/10' 
                                                                : 'bg-gray-50 dark:bg-slate-900 border border-dashed border-gray-100 dark:border-slate-800'
                                                    )} 
                                                >
                                                    {isToday && <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />}
                                                </motion.div>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] sm:text-xs font-black uppercase tracking-widest transition-colors",
                                                isToday ? 'text-orange-600 dark:text-orange-500' : 'text-gray-400 dark:text-slate-600 group-hover:text-gray-600'
                                            )}>
                                                {d.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Notifications & Services */}
                    <div className="lg:col-span-4 space-y-8">
                        
                        {/* Modern Notifications Section */}
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-gray-50 dark:border-slate-800 shadow-2xl shadow-gray-200/50 dark:shadow-none">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-gray-800 dark:text-white text-xl tracking-tight flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-orange-500" />
                                    Bản tin Point
                                </h3>
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                            </div>
                            <div className="space-y-5">
                                {notifications.map((noti, i) => (
                                    <motion.div 
                                        key={noti.id} 
                                        initial={{ x: 20, opacity: 0 }} 
                                        animate={{ x: 0, opacity: 1 }} 
                                        transition={{ delay: 0.5 + i * 0.1 }} 
                                        className={cn(
                                            "group rounded-[28px] p-5 border transition-all cursor-pointer relative overflow-hidden",
                                            !noti.read 
                                                ? 'border-orange-50 bg-orange-50/20 dark:border-orange-500/10 dark:bg-orange-500/5' 
                                                : 'border-gray-50 bg-gray-50/50 dark:border-slate-800 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 shadow-sm text-orange-500 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-gray-800 dark:text-white leading-tight mb-1">{noti.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-2">{noti.message}</p>
                                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100/50 dark:border-slate-800/50">
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{noti.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <button className="w-full mt-6 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-orange-500 transition-colors">
                                Xem tất cả thông báo
                            </button>
                        </div>

                        {/* Quick Help / Community Card */}
                        <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-transform">
                                <Shield className="w-32 h-32" />
                            </div>
                            <h4 className="text-2xl font-black mb-3 tracking-tighter">Hỗ trợ 24/7</h4>
                            <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">Bạn gặp sự cố kỹ thuật? Chúng tôi luôn sẵn sàng hỗ trợ bất cứ lúc nào.</p>
                            <button className="w-full py-5 bg-orange-500 text-white font-black rounded-[20px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">LIÊN HỆ QUẢN TRỊ VIÊN</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

