"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
    LogIn, Rocket, Briefcase, Clock, AlertTriangle, Bell,
    ChevronRight, MapPin, Calendar, Shield, Smartphone, Users, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import BottomNav from '@/components/common/BottomNav';

// --- MOCK DATA ---
const monthlyStats = { totalWorkDays: 22, otHours: 14.5, lateDays: 2 };
const weeklyChartData = [
    { day: 'T2', hours: 8 }, { day: 'T3', hours: 9.5 }, { day: 'T4', hours: 8 },
    { day: 'T5', hours: 10 }, { day: 'T6', hours: 8 }, { day: 'T7', hours: 4 }, { day: 'CN', hours: 0 },
];
const notifications = [
    { id: 1, title: 'Ca làm việc mới được phân công', message: 'Bạn được phân công ca sáng ngày 17/03/2026 tại KCN Tân Bình.', time: '10 phút trước', read: false, type: 'shift' },
];
const statCards = [
    { label: 'Tổng công tháng', value: `${monthlyStats.totalWorkDays} ngày`, icon: Briefcase, color: 'from-orange-400 to-orange-500' },
    { label: 'Giờ OT', value: `${monthlyStats.otHours} giờ`, icon: Clock, color: 'from-blue-400 to-blue-500' },
    { label: 'Đi muộn', value: `${monthlyStats.lateDays} lần`, icon: AlertTriangle, color: 'from-red-400 to-red-500' },
];

export default function Home() {
    const { user } = useAuthStore();
    const router = useRouter();
    const maxHours = Math.max(...weeklyChartData.map(d => d.hours), 1);

    // --- CASE 1: NOT LOGGED IN (RESPONSIVE LANDING PAGE) ---
    if (!user) {
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
                                    <Link href="/login" className="inline-flex items-center justify-center gap-3 bg-white text-orange-600 font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-orange-50 active:scale-[0.98] transition-all">
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
                        <Link href="/login" className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all">
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

    // --- CASE 2: LOGGED IN (DASHBOARD) - Luôn giữa 480px trên desktop để giữ Mobile Feel ---
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="max-w-[480px] mx-auto bg-white min-h-screen shadow-2xl relative pb-24">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-20 px-5 rounded-b-[32px] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white rounded-full" />
                        <div className="absolute bottom-4 -left-8 w-32 h-32 bg-white rounded-full" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1">
                            <div>
                                <p className="text-orange-100 text-sm">Xin chào,</p>
                                <h1 className="text-xl font-bold text-white">{user.fullName || 'Người dùng'}</h1>
                                <p className="text-orange-200 text-xs mt-0.5">{user.role} · {user.phoneNumber}</p>
                            </div>
                            <button onClick={() => router.push('/profile')} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-orange-100 flex items-center justify-center text-sm font-bold text-orange-700">
                                    {(user.fullName || 'P').charAt(0)}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-5 -mt-12 relative z-20">
                    <div className="grid grid-cols-3 gap-3">
                        {statCards.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-50">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}><Icon className="w-4 h-4 text-white" /></div>
                                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="px-5 mt-5">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.push('/checkin')} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-orange-200/60">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"><MapPin className="w-6 h-6 text-white" /></div>
                        <div className="flex-1 text-left"><p className="font-bold text-base">Chấm công ngay</p><p className="text-orange-100 text-xs mt-0.5">Nhấn để Check-in / Check-out</p></div>
                        <ChevronRight className="w-5 h-5 text-orange-200" />
                    </motion.button>
                </div>

                <div className="px-5 mt-5">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-gray-800 text-sm">Sơ đồ công tuần này</h3><span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">Tháng 3/2026</span></div>
                        <div className="flex items-end justify-between gap-2 h-36">
                            {weeklyChartData.map((d, i) => {
                                const height = d.hours > 0 ? (d.hours / maxHours) * 100 : 4;
                                const isToday = i === 5;
                                return (
                                    <div key={d.day} className="flex flex-col items-center flex-1 gap-1.5">
                                        <span className="text-[10px] font-semibold text-gray-500">{d.hours > 0 ? `${d.hours}h` : '-'}</span>
                                        <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: 0.4 + i * 0.05 }} className={`w-full rounded-lg min-h-1 ${isToday ? 'bg-gradient-to-t from-orange-500 to-orange-400 shadow-sm shadow-orange-200' : d.hours > 0 ? 'bg-gradient-to-t from-orange-200 to-orange-100' : 'bg-gray-100'}`} />
                                        <span className={`text-[11px] font-medium ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>{d.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                <div className="px-5 mt-5">
                    <div className="flex items-center justify-between mb-3"><h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-orange-500" /> Thông báo mới</h3></div>
                    <div className="space-y-3">
                        {notifications.map((noti, i) => (
                            <motion.div key={noti.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }} className={`bg-white rounded-xl p-3 border flex gap-3 ${!noti.read ? 'border-orange-100 bg-orange-50/30' : 'border-gray-100'}`}>
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-orange-100 text-orange-600"><Calendar className="w-4 h-4" /></div>
                                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 leading-tight">{noti.title}</p><p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{noti.message}</p><p className="text-[10px] text-gray-400 mt-1">{noti.time}</p></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
