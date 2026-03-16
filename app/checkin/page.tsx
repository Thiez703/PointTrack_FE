"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Camera, CheckCircle, LogOut, Navigation,
    Wifi, Clock, Circle
} from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/common/BottomNav';

export default function CheckinPage() {
    const [checkedIn, setCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [photoTaken, setPhotoTaken] = useState(false);

    const userLat = 10.7769;
    const userLng = 106.7009;
    const isInRadius = true;

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleTakePhoto = () => {
        setPhotoTaken(true);
        toast.success('Chụp ảnh selfie thành công!');
    };

    const handleCheckIn = () => {
        if (!photoTaken) {
            toast.error('Vui lòng chụp ảnh selfie trước khi check-in');
            return;
        }
        setCheckedIn(true);
        setCheckInTime(currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        toast.success('Check-in thành công!');
    };

    const handleCheckOut = () => {
        setCheckedIn(false);
        setPhotoTaken(false);
        toast.success('Check-out thành công!');
    };

    return (
        <div className="login-app-container pb-24 bg-gray-50 min-h-screen">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-5 px-5 rounded-b-[28px]">
                <h1 className="text-xl font-bold text-white mb-1">Chấm công</h1>
                <p className="text-orange-100 text-xs">{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>

            <div className="px-5 mt-4">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <div className="relative h-52 bg-gradient-to-br from-green-100 via-green-50 to-blue-50 overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            {[...Array(8)].map((_, i) => <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${(i + 1) * 12}%` }} />)}
                            {[...Array(6)].map((_, i) => <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${(i + 1) * 15}%` }} />)}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-32 h-32 rounded-full bg-orange-500/10 border-2 border-dashed border-orange-300 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full bg-orange-500/15 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg" /></div>
                            </motion.div>
                        </div>
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute top-[48%] left-[52%] -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-500 border-3 border-white shadow-lg flex items-center justify-center"><Navigation className="w-5 h-5 text-white fill-white" /></div>
                                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute -inset-2 rounded-full bg-blue-400/30" />
                            </div>
                        </motion.div>
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm">📍 KCN Tân Bình</div>
                    </div>
                </div>

                <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-3xl font-bold text-gray-800 tracking-wider font-mono">{currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                    {checkedIn && <div className="mt-2 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm text-green-600 font-medium">Đã check-in lúc {checkInTime}</span></div>}
                </div>

                <div className="mt-3">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleTakePhoto} className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all ${photoTaken ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'}`}>
                        {photoTaken ? <><CheckCircle className="w-5 h-5" /> Đã chụp ảnh Selfie & GPS</> : <><Camera className="w-5 h-5" /> Chụp ảnh Selfie & GPS</>}
                    </motion.button>
                </div>

                <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Wifi className="w-4 h-4 text-green-500" /><span className="text-sm font-medium text-gray-700">Trạng thái GPS</span></div><span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${isInRadius ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}><Circle className="w-2 h-2 fill-current" />{isInRadius ? 'Trong bán kính' : 'Ngoài bán kính'}</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /><span className="text-sm font-medium text-gray-700">Vị trí GPS</span></div><span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg">[{userLat.toFixed(4)}° N, {userLng.toFixed(4)}° E]</span></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /><span className="text-sm font-medium text-gray-700">Ca hiện tại</span></div><span className="text-xs text-gray-500 font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-lg">Ca Sáng · 06:00 - 14:00</span></div>
                </div>

                <div className="mt-4 flex gap-3">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleCheckIn} disabled={checkedIn} className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg ${checkedIn ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200'}`}><CheckCircle className="w-5 h-5" /> Check-in</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleCheckOut} disabled={!checkedIn} className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg ${!checkedIn ? 'bg-gray-200 text-gray-400' : 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-200'}`}><LogOut className="w-5 h-5" /> Check-out</motion.button>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
