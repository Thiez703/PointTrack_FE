"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gift, Calendar, Clock, MapPin, Building2,
    Star, ChevronLeft, TrendingUp, CheckCircle2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- MOCK DATA ---
const initialHolidays = [
    { id: 1, name: 'Giỗ Tổ Hùng Vương', date: '2026-04-06', shift: 'Sáng', time: '06:00 - 14:00', otRate: 3.0, location: 'KCN Tân Bình', client: 'Công ty TNHH ABC', registered: false },
    { id: 2, name: 'Ngày Thống nhất 30/4', date: '2026-04-30', shift: 'Chiều', time: '14:00 - 22:00', otRate: 3.0, location: 'Tòa nhà Bitexco', client: 'Tập đoàn XYZ', registered: false },
];

export default function HolidayPage() {
    const router = useRouter();
    const [holidays, setHolidays] = useState(initialHolidays);

    const handleRegister = (id: number) => {
        setHolidays(prev => prev.map(h => h.id === id ? { ...h, registered: true } : h));
        toast.success('Đăng ký thành công, đang chờ Admin duyệt!');
    };

    const groupedHolidays = holidays.reduce((acc: any, h) => {
        if (!acc[h.name]) acc[h.name] = [];
        acc[h.name].push(h);
        return acc;
    }, {});

    return (
        <div className="flex-1 w-full pb-32 lg:pb-12 bg-gray-50 dark:bg-slate-950 min-h-screen">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 pt-16 pb-20 px-6 sm:px-12 rounded-b-[60px] lg:rounded-b-[80px] relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 opacity-15">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-5 -left-10 w-48 h-48 bg-white rounded-full blur-2xl" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <button onClick={() => router.back()} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center mb-6 transition-all border border-white/10 backdrop-blur-md">
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2">Đăng ký làm thêm Lễ/Tết</h1>
                        <p className="text-purple-100 text-sm font-bold uppercase tracking-[0.2em] opacity-80 flex items-center gap-2">
                            <TrendingUp size={16} /> Thu nhập nhân 3.0x hệ số OT
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 shadow-lg">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Tổng ca đang chờ</p>
                        <p className="text-white text-3xl font-black">{holidays.filter(h => h.registered).length}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-10 relative z-20 space-y-10">
                {Object.entries(groupedHolidays).map(([name, shifts]: any) => (
                    <div key={name}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 shadow-sm">
                                <Gift size={20} />
                            </div>
                            <h2 className="font-black text-gray-800 dark:text-white text-lg sm:text-xl tracking-tight uppercase">{name}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shifts.map((holiday: any, i: number) => (
                                <motion.div 
                                    key={holiday.id} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: i * 0.1 }} 
                                    className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none group hover:border-purple-200 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-purple-500">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 dark:text-white tracking-tight">{holiday.date}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ca {holiday.shift}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-orange-600 dark:text-orange-400 font-black text-xs rounded-full border border-orange-100 dark:border-orange-900/30">
                                            x{holiday.otRate}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 mb-6 border border-gray-50 dark:border-slate-800">
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                            <Clock size={14} className="text-purple-400" />
                                            <span>{holiday.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                            <MapPin size={14} className="text-blue-400" />
                                            <span className="truncate">{holiday.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-gray-600 dark:text-gray-400">
                                            <Building2 size={14} className="text-green-400" />
                                            <span className="truncate">{holiday.client}</span>
                                        </div>
                                    </div>
                                    <motion.button 
                                        whileTap={{ scale: 0.97 }} 
                                        onClick={() => handleRegister(holiday.id)} 
                                        disabled={holiday.registered} 
                                        className={cn(
                                            "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-gray-100 dark:shadow-none",
                                            holiday.registered 
                                                ? "bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-100 dark:border-green-900/30 shadow-none cursor-default" 
                                                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 active:scale-95"
                                        )}
                                    >
                                        {holiday.registered ? (
                                            <><CheckCircle2 className="w-4 h-4" /> Đã đăng ký</>
                                        ) : (
                                            <><Star className="w-4 h-4" /> Đăng ký làm ngay</>
                                        )}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

