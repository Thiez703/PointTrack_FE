"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Phone, MapPin, Pencil, Check, X,
    KeyRound, LogOut, BarChart3, Shield, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import BottomNav from '@/components/common/BottomNav';

// --- MOCK DATA ---
const monthlyWorkHistory = [
    { month: 'T9', days: 20 }, { month: 'T10', days: 23 }, { month: 'T11', days: 21 },
    { month: 'T12', days: 22 }, { month: 'T1', days: 18 }, { month: 'T2', days: 20 },
];

export default function ProfilePage() {
    const { userInfo: user, logout } = useAuthStore();
    const router = useRouter();
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const maxDays = Math.max(...monthlyWorkHistory.map(d => d.days), 1);

    const handleLogout = () => {
        logout();
        toast.success('Đã đăng xuất');
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="login-app-container pb-24 min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-16 px-5 rounded-b-[32px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-white rounded-full" />
                    <div className="absolute bottom-4 -left-8 w-32 h-32 bg-white rounded-full" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-xl font-bold text-white mb-1">Hồ sơ cá nhân</h1>
                    <p className="text-orange-100 text-xs">ID: {user.userId}</p>
                </div>
            </div>

            <div className="px-5 -mt-10 relative z-20">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-200 flex items-center justify-center text-2xl font-bold text-orange-800 ring-4 ring-orange-100 shadow-lg">
                        {(user.fullName || 'P').charAt(0)}
                    </div>
                    <h2 className="mt-3 text-lg font-bold text-gray-800">{user.fullName}</h2>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5"><Shield className="w-3.5 h-3.5" />{user.role}</p>
                </motion.div>
            </div>

            <div className="px-5 mt-4 space-y-3">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Phone className="w-4 h-4 text-blue-500" /></div>
                        <div><label className="text-[11px] text-gray-400 font-medium">Số điện thoại</label><p className="text-sm font-semibold text-gray-800">{user.phoneNumber}</p></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-orange-500" /><h3 className="font-bold text-sm text-gray-800">Lịch sử công</h3></div>
                    <div className="flex items-end justify-between gap-3 h-28">
                        {monthlyWorkHistory.map((d, i) => (
                            <div key={d.month} className="flex flex-col items-center flex-1 gap-1.5">
                                <span className="text-[10px] font-semibold text-gray-500">{d.days}n</span>
                                <motion.div initial={{ height: 0 }} animate={{ height: `${(d.days / maxDays) * 100}%` }} className={`w-full rounded-lg ${i === monthlyWorkHistory.length - 1 ? 'bg-orange-500' : 'bg-orange-200'}`} />
                                <span className="text-[11px] font-medium text-gray-400">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3 pt-1">
                    <button onClick={() => setShowPasswordModal(true)} className="w-full bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center"><KeyRound className="w-4 h-4 text-orange-500" /></div><span className="font-semibold text-sm text-gray-800 flex-1 text-left">Đổi mật khẩu</span><ChevronRight className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={handleLogout} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg flex items-center justify-center gap-2 font-bold text-sm"><LogOut className="w-5 h-5" /> Đăng xuất</button>
                </div>
            </div>

            <AnimatePresence>
                {showPasswordModal && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPasswordModal(false)} className="fixed inset-0 bg-black/40 z-50" />
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
                        <div className="bg-white rounded-t-3xl p-6 shadow-2xl">
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" /><h2 className="text-lg font-bold text-gray-800 mb-4">Đổi mật khẩu</h2>
                            <form className="space-y-4">
                                <div><label className="text-sm font-medium text-gray-600 mb-1.5 block">Mật khẩu hiện tại</label><input type="password" className="login-input-field" /></div>
                                <div><label className="text-sm font-medium text-gray-600 mb-1.5 block">Mật khẩu mới</label><input type="password" className="login-input-field" /></div>
                                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600">Hủy</button><button type="button" className="flex-1 login-btn-primary !py-3">Xác nhận</button></div>
                            </form>
                        </div>
                    </motion.div></>
                )}
            </AnimatePresence>
            <BottomNav />
        </div>
    );
}
