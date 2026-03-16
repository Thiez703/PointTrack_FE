"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, MapPin, Clock, Building2,
    Navigation, Sun, Moon, Sunset
} from 'lucide-react';
import BottomNav from '@/components/common/BottomNav';

// --- MOCK DATA ---
const shifts = [
    { date: '2026-03-02', shift: 'Sáng', time: '06:00 - 14:00', location: 'KCN Tân Bình', client: 'Công ty TNHH ABC', address: '45 Đường Cộng Hòa, Q. Tân Bình, TP.HCM', lat: 10.8012, lng: 106.6525 },
    { date: '2026-03-03', shift: 'Sáng', time: '06:00 - 14:00', location: 'KCN Tân Bình', client: 'Công ty TNHH ABC', address: '45 Đường Cộng Hòa, Q. Tân Bình, TP.HCM', lat: 10.8012, lng: 106.6525 },
    { date: '2026-03-04', shift: 'Chiều', time: '14:00 - 22:00', location: 'Tòa nhà Bitexco', client: 'Tập đoàn XYZ', address: '2 Hải Triều, Q.1, TP.HCM', lat: 10.7716, lng: 106.7044 },
    { date: '2026-03-15', shift: 'Sáng', time: '06:00 - 14:00', location: 'KCN Tân Bình', client: 'Công ty TNHH ABC', address: '45 Đường Cộng Hòa, Q. Tân Bình, TP.HCM', lat: 10.8012, lng: 106.6525 },
    { date: '2026-03-16', shift: 'Sáng', time: '06:00 - 14:00', location: 'KCN Tân Bình', client: 'Công ty TNHH ABC', address: '45 Đường Cộng Hòa, Q. Tân Bình, TP.HCM', lat: 10.8012, lng: 106.6525 },
    { date: '2026-03-17', shift: 'Chiều', time: '14:00 - 22:00', location: 'Tòa nhà Bitexco', client: 'Tập đoàn XYZ', address: '2 Hải Triều, Q.1, TP.HCM', lat: 10.7716, lng: 106.7044 },
];

const shiftIcons: any = { 'Sáng': Sun, 'Chiều': Sunset, 'Đêm': Moon };
const shiftColors: any = {
    'Sáng': 'bg-amber-50 border-amber-200 text-amber-700',
    'Chiều': 'bg-blue-50 border-blue-200 text-blue-700',
    'Đêm': 'bg-indigo-50 border-indigo-200 text-indigo-700',
};
const shiftBadgeColors: any = {
    'Sáng': 'bg-amber-100 text-amber-700',
    'Chiều': 'bg-blue-100 text-blue-700',
    'Đêm': 'bg-indigo-100 text-indigo-700',
};

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAYS_FULL = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function CalendarPage() {
    const [viewMode, setViewMode] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 15));
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayShifts = shifts.filter(s => s.date === dateStr);
            days.push({ day: d, dateStr, shifts: dayShifts });
        }
        return days;
    }, [year, month]);

    const weekDays = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        const monday = new Date(startOfWeek);
        monday.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dayShifts = shifts.filter(s => s.date === dateStr);
            days.push({ day: d.getDate(), dateStr, weekday: d.getDay(), date: d, shifts: dayShifts });
        }
        return days;
    }, [currentDate]);

    const selectedShifts = useMemo(() => {
        if (!selectedDate) return [];
        return shifts.filter(s => s.date === selectedDate);
    }, [selectedDate]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };
    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const formatMonth = (m: number, y: number) => {
        const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        return `${months[m]}, ${y}`;
    };

    const renderShiftCard = (shift: any, index: number) => {
        const Icon = shiftIcons[shift.shift] || Sun;
        return (
            <motion.div key={index} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.05 }} className={`rounded-xl p-3.5 border ${shiftColors[shift.shift]} mb-3`}>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-sm">Ca {shift.shift}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${shiftBadgeColors[shift.shift]}`}>{shift.time}</span>
                </div>
                <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 opacity-70" /><span className="font-medium">{shift.client}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-70" /><span>{shift.address}</span></div>
                </div>
                <button onClick={() => window.open(`https://www.google.com/maps?q=${shift.lat},${shift.lng}`, '_blank')} className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-100/80 px-3 py-1.5 rounded-lg">
                    <Navigation className="w-3.5 h-3.5" /> Chỉ đường Google Maps
                </button>
            </motion.div>
        );
    };

    return (
        <div className="login-app-container pb-24 bg-gray-50 min-h-screen">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-6 px-5 rounded-b-[28px]">
                <h1 className="text-xl font-bold text-white mb-4">Lịch làm việc</h1>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-1 flex">
                    {['month', 'week'].map((mode) => (
                        <button key={mode} onClick={() => setViewMode(mode)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === mode ? 'bg-white text-orange-600 shadow-sm' : 'text-white/80'}`}>{mode === 'month' ? 'Tháng' : 'Tuần'}</button>
                    ))}
                </div>
            </div>

            <div className="px-5 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={viewMode === 'month' ? prevMonth : prevWeek} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                    <h2 className="font-bold text-gray-800">{viewMode === 'month' ? formatMonth(month, year) : `${weekDays[0]?.day}/${month + 1} – ${weekDays[6]?.day}/${month + 1}`}</h2>
                    <button onClick={viewMode === 'month' ? nextMonth : nextWeek} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>

                {viewMode === 'month' && (
                    <motion.div key={`month-${month}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {WEEKDAYS.map(wd => <div key={wd} className="text-center text-[11px] font-semibold text-gray-400 py-1">{wd}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} />;
                                const hasShift = day.shifts.length > 0;
                                const isSelected = selectedDate === day.dateStr;
                                const isToday = day.day === 15 && month === 2;
                                return (
                                    <button key={day.dateStr} onClick={() => setSelectedDate(day.dateStr)} className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all ${isSelected ? 'bg-orange-500 text-white shadow-md' : isToday ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-300' : hasShift ? 'bg-orange-50/50 text-gray-700' : 'text-gray-500'}`}>
                                        <span className="font-semibold text-xs">{day.day}</span>
                                        {hasShift && <div className="flex gap-0.5 mt-0.5">{day.shifts.map((s, si) => <div key={si} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-400'}`} />)}</div>}
                                    </button>
                                );
                            })}
                        </div>
                        <AnimatePresence mode="wait">
                            {selectedDate && (
                                <motion.div key={selectedDate} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-orange-500" /><h3 className="font-bold text-sm text-gray-800">Ca làm ngày {selectedDate.split('-')[2]}/{selectedDate.split('-')[1]}</h3></div>
                                    {selectedShifts.length > 0 ? selectedShifts.map((s, i) => renderShiftCard(s, i)) : <div className="text-center py-6 text-gray-400 text-sm">Không có ca làm việc</div>}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {viewMode === 'week' && (
                    <div className="space-y-3">
                        {weekDays.map((day, i) => (
                            <div key={day.dateStr} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                <div className={`px-4 py-2.5 flex items-center justify-between ${day.day === 15 ? 'bg-orange-500 text-white' : 'bg-gray-50'}`}>
                                    <span className="font-bold text-sm">{WEEKDAYS_FULL[day.weekday]}</span>
                                    <span className={`text-xs font-medium ${day.day === 15 ? 'text-orange-100' : 'text-gray-400'}`}>{day.day}/{month + 1}/{year}</span>
                                </div>
                                <div className="p-3">{day.shifts.length > 0 ? day.shifts.map((s, si) => renderShiftCard(s, si)) : <p className="text-center text-gray-400 text-sm py-3">Nghỉ</p>}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}
