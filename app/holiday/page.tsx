"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Gift, Calendar, Clock, MapPin, Building2,
    Star, ChevronLeft, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import BottomNav from '@/components/common/BottomNav';

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
        <div className="login-app-container pb-24 min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 pt-12 pb-6 px-5 rounded-b-[28px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full" />
                    <div className="absolute bottom-5 -left-5 w-28 h-28 bg-white rounded-full" />
                </div>
                <div className="relative z-10">
                    <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mb-3 backdrop-blur-sm"><ChevronLeft className="w-5 h-5 text-white" /></button>
                    <h1 className="text-xl font-bold text-white mb-1">Đăng ký ca Lễ/Tết</h1>
                    <p className="text-purple-200 text-xs">Hệ số OT lên đến 3.0x — Thu nhập nhân 3!</p>
                </div>
            </div>

            <div className="px-5 mt-4 space-y-5">
                {Object.entries(groupedHolidays).map(([name, shifts]: any, gi) => (
                    <div key={name}>
                        <div className="flex items-center gap-2 mb-3"><Gift className="w-4 h-4 text-purple-500" /><h2 className="font-bold text-gray-800 text-sm">{name}</h2></div>
                        <div className="space-y-3">
                            {shifts.map((holiday: any, i: number) => (
                                <motion.div key={holiday.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-500" /><span className="text-sm font-semibold text-gray-800">{holiday.date}</span><span className="text-xs text-gray-400">·</span><span className="text-sm font-medium text-gray-600">Ca {holiday.shift}</span></div>
                                        <div className="flex items-center gap-1 bg-amber-100 text-orange-700 font-bold text-xs px-2.5 py-1 rounded-full"><TrendingUp className="w-3 h-3" />x{holiday.otRate}</div>
                                    </div>
                                    <div className="space-y-2 text-xs text-gray-600">
                                        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 opacity-50" /><span>{holiday.time}</span></div>
                                        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-50" /><span>{holiday.location}</span></div>
                                        <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 opacity-50" /><span>{holiday.client}</span></div>
                                    </div>
                                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleRegister(holiday.id)} disabled={holiday.registered} className={`w-full mt-3 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${holiday.registered ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'}`}>
                                        {holiday.registered ? <><Star className="w-4 h-4 fill-current" /> Đã đăng ký — Chờ duyệt</> : <><Star className="w-4 h-4" /> Đăng ký làm thêm</>}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <BottomNav />
        </div>
    );
}
