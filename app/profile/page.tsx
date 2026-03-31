"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Phone, MapPin, Pencil, Check, X,
    KeyRound, LogOut, BarChart3, Shield, ChevronRight, Calendar, Users, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '@/app/services/user.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { userInfo: authUser, logout } = useAuthStore();
    const router = useRouter();
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const { data: profileResponse, isLoading } = useQuery({
        queryKey: ['user', 'me'],
        queryFn: () => UserService.getMe(),
        enabled: !!authUser,
    });

    const user = profileResponse?.data;
    const monthlyWorkHistory = user?.workStatistics.history || [];
    const maxDays = Math.max(...monthlyWorkHistory.map(d => d.days), 1);

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất');
        router.push('/login');
    };

    if (isLoading && !!authUser) {
        return (
            <div className="flex-1 min-h-[60vh] flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-orange-500 font-bold animate-pulse uppercase tracking-widest text-xs">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex-1 w-full pb-32 lg:pb-12">
            <div className="w-full relative">
                {/* Header Section - Modern Gradient */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-16 sm:pt-24 pb-32 sm:pb-48 px-6 sm:px-12 rounded-b-[60px] lg:rounded-b-[100px] relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-10">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-28 h-28 sm:w-40 sm:h-40 rounded-[40px] sm:rounded-[56px] bg-white/20 p-2 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-2xl relative group"
                            >
                                <div className="w-full h-full rounded-[32px] sm:rounded-[48px] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center text-5xl sm:text-7xl font-black text-orange-600 overflow-hidden shadow-inner">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        (user.fullName || 'P').charAt(0)
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-orange-500 hover:scale-110 transition-transform">
                                    <Pencil size={20} strokeWidth={3} />
                                </button>
                            </motion.div>
                            <div>
                                <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tighter leading-tight">{user.fullName}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white border border-white/10 uppercase tracking-[0.2em]">ID: {user.employeeCode}</span>
                                    <span className="px-4 py-1.5 bg-orange-400/30 backdrop-blur-md rounded-full text-xs font-black text-white border border-white/10 uppercase tracking-[0.2em]">{user.position}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="px-8 py-4 bg-white text-orange-600 hover:bg-orange-50 rounded-[24px] font-black text-sm transition-all flex items-center gap-3 shadow-xl uppercase tracking-widest"
                            >
                                <LogOut size={20} strokeWidth={3} /> Đăng xuất
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Content Grid - Responsive 12-column system */}
                <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-20 sm:-mt-28 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                    
                    {/* LEFT COLUMN: Summary & Details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Highlights Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                            {[
                                { label: 'Lương dự tính', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.workStatistics.summary.estimatedSalary || 0), icon: BarChart3, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Tổng giờ công', value: `${user.workStatistics.summary.totalWorkHours || 0} Giờ`, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Ngày công tháng', value: `${user.workStatistics.summary.totalWorkDaysThisMonth || 0} Ngày`, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ y: 20, opacity: 0 }} 
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-gray-50 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
                                >
                                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm", stat.bg, stat.color)}>
                                        <stat.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                    <p className="text-xl font-black text-gray-800 dark:text-white tracking-tight">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Basic Info Card */}
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-slate-900 rounded-[40px] p-8 sm:p-12 border border-gray-50 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
                        >
                            <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mb-10 tracking-tighter flex items-center gap-4">
                                <div className="w-2 h-8 bg-orange-500 rounded-full" />
                                Thông tin hồ sơ
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                                {[
                                    { label: 'Họ và tên', value: user.fullName, icon: User },
                                    { label: 'Số điện thoại', value: user.phoneNumber, icon: Phone },
                                    { label: 'Email cá nhân', value: user.email || 'Chưa cập nhật', icon: MapPin },
                                    { label: 'Ngày vào làm', value: user.hiredDate ? format(new Date(user.hiredDate), 'dd/MM/yyyy', { locale: vi }) : 'Chưa cập nhật', icon: Calendar },
                                    { label: 'Bộ phận', value: user.department, icon: Users },
                                    { label: 'Trạng thái', value: user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Nghỉ phép', icon: Shield, status: user.status }
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-2 group">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{item.label}</label>
                                        <div className="flex items-center gap-4 py-1 transition-transform group-hover:translate-x-1">
                                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-orange-500/70">
                                                <item.icon size={18} />
                                            </div>
                                            <p className={cn(
                                                "text-base font-bold",
                                                item.status === 'ACTIVE' ? "text-green-600" : item.status ? "text-orange-500" : "text-gray-800 dark:text-white"
                                            )}>
                                                {item.value}
                                            </p>
                                        </div>
                                        <div className="h-px w-full bg-gray-50 dark:bg-slate-800" />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 dark:border-slate-800">
                                <motion.button 
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full sm:w-auto px-10 py-5 bg-slate-900 dark:bg-orange-500 text-white font-black rounded-[20px] flex items-center justify-center gap-4 hover:opacity-90 transition-all shadow-xl uppercase tracking-widest text-xs"
                                >
                                    <KeyRound size={20} /> Thay đổi mật khẩu
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Statistics & Security */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Mini Chart Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-gray-50 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-gray-800 dark:text-white text-lg tracking-tight flex items-center gap-3">
                                    <BarChart3 className="text-orange-500" /> Lịch sử 6 tháng
                                </h3>
                            </div>
                            <div className="flex items-end justify-between gap-3 h-40">
                                {monthlyWorkHistory.map((d, i) => (
                                    <div key={d.month} className="flex flex-col items-center flex-1 gap-3 group">
                                        <motion.div 
                                            initial={{ height: 0 }} 
                                            animate={{ height: `${(d.days / maxDays) * 100}%` }} 
                                            className={cn(
                                                "w-full rounded-lg transition-all duration-500",
                                                i === monthlyWorkHistory.length - 1 
                                                    ? 'bg-orange-500 shadow-lg shadow-orange-200' 
                                                    : 'bg-gray-100 dark:bg-slate-800 group-hover:bg-orange-100'
                                            )} 
                                        />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{d.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Security Info */}
                        <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                                <Shield className="w-32 h-32" />
                            </div>
                            <h4 className="text-2xl font-black mb-4 tracking-tighter">Bảo mật</h4>
                            <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">Tài khoản được bảo vệ bởi công nghệ mã hóa PointTrack Shield v2.0</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                                    <span className="text-xs font-black uppercase tracking-widest">Xác thực vân tay</span>
                                    <div className="w-10 h-6 bg-green-500 rounded-full relative p-1 shadow-inner">
                                        <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-md" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 opacity-50">
                                    <span className="text-xs font-black uppercase tracking-widest">Thiết bị tin cậy</span>
                                    <span className="text-[10px] font-black text-orange-400 uppercase">iPhone 15</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showPasswordModal && (
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }} 
                                onClick={() => setShowPasswordModal(false)} 
                                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
                            />
                            <motion.div 
                                initial={{ y: 100, opacity: 0, scale: 0.95 }} 
                                animate={{ y: 0, opacity: 1, scale: 1 }} 
                                exit={{ y: 100, opacity: 0, scale: 0.95 }} 
                                className="relative w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 sm:p-10">
                                    <div className="w-12 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                                    <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">Đổi mật khẩu</h2>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để tiếp tục.</p>
                                    
                                    <form className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mật khẩu hiện tại</label>
                                            <input type="password" placeholder="••••••••" className="login-input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                                            <input type="password" placeholder="••••••••" className="login-input-field dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                            <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-100 dark:bg-slate-800 py-4 rounded-2xl font-black text-gray-600 dark:text-slate-400 hover:bg-gray-200 transition-colors">HỦY BỎ</button>
                                            <button type="button" className="flex-1 login-btn-primary !py-4 shadow-xl shadow-orange-100 dark:shadow-none font-black">XÁC NHẬN</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
