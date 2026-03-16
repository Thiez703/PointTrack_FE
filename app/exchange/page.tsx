"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftRight, Check, X, Plus, Calendar,
    Clock, MapPin, User, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/common/BottomNav';

// --- MOCK DATA ---
const initialPending = [
    {
        id: 1,
        sender: { name: 'Trần Minh Tuấn', employeeId: 'NV-2024-0089' },
        currentShift: { date: '2026-03-18', time: '06:00 - 14:00', shift: 'Sáng', location: 'KCN Tân Bình' },
        requestedShift: { date: '2026-03-19', time: '14:00 - 22:00', shift: 'Chiều', location: 'Tòa nhà Bitexco' },
        createdAt: '2 giờ trước',
    }
];

const approvedExchanges = [
    {
        id: 101,
        sender: { name: 'Nguyễn Hữu Phúc' },
        currentShift: { date: '2026-03-10', time: '06:00 - 14:00', shift: 'Sáng', location: 'KCN Tân Bình' },
        requestedShift: { date: '2026-03-11', time: '14:00 - 22:00', shift: 'Chiều', location: 'Tòa nhà Bitexco' },
        approvedAt: '10/03/2026',
    }
];

export default function ExchangePage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingRequests, setPendingRequests] = useState(initialPending);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });

    const handleAccept = (id: number) => {
        setPendingRequests(prev => prev.filter(r => r.id !== id));
        toast.success('Đã chấp nhận đổi ca thành công!');
    };

    const handleReject = (id: number) => {
        setPendingRequests(prev => prev.filter(r => r.id !== id));
        toast.info('Đã từ chối yêu cầu đổi ca');
    };

    const handleCreateRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.startTime || !formData.endTime) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }
        setShowModal(false);
        setFormData({ date: '', startTime: '', endTime: '' });
        toast.success('Tạo yêu cầu đổi ca thành công!');
    };

    return (
        <div className="login-app-container pb-24 min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-6 px-5 rounded-b-[28px]">
                <h1 className="text-xl font-bold text-white mb-4">Đổi ca</h1>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl p-1 flex">
                    {[
                        { id: 'pending', label: 'Đang chờ', count: pendingRequests.length },
                        { id: 'approved', label: 'Đã duyệt', count: approvedExchanges.length },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${activeTab === tab.id ? 'bg-white text-orange-600 shadow-sm' : 'text-white/80'}`}>
                            {tab.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-white/20 text-white'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-5 mt-4">
                {activeTab === 'pending' ? (
                    <div className="space-y-3">
                        {pendingRequests.length > 0 ? pendingRequests.map((req, i) => (
                            <motion.div key={req.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-100 flex items-center justify-center"><User className="w-5 h-5 text-orange-700" /></div>
                                    <div><p className="font-bold text-sm text-gray-800">{req.sender.name}</p><p className="text-[11px] text-gray-400">{req.sender.employeeId} · {req.createdAt}</p></div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs font-medium text-gray-600">Ca hiện tại:</span><span className="text-xs text-gray-800 font-semibold">{req.currentShift.shift} · {req.currentShift.time}</span></div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 pl-4"><Calendar className="w-3 h-3" /><span>{req.currentShift.date}</span><MapPin className="w-3 h-3 ml-1" /><span>{req.currentShift.location}</span></div>
                                    <div className="flex justify-center py-1"><ArrowLeftRight className="w-4 h-4 text-orange-400" /></div>
                                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-xs font-medium text-gray-600">Ca muốn đổi:</span><span className="text-xs text-gray-800 font-semibold">{req.requestedShift.shift} · {req.requestedShift.time}</span></div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500 pl-4"><Calendar className="w-3 h-3" /><span>{req.requestedShift.date}</span><MapPin className="w-3 h-3 ml-1" /><span>{req.requestedShift.location}</span></div>
                                </div>
                                <div className="flex gap-3 mt-3">
                                    <button onClick={() => handleReject(req.id)} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold text-sm flex items-center justify-center gap-1.5"><X className="w-4 h-4" /> Từ chối</button>
                                    <button onClick={() => handleAccept(req.id)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-orange-200"><Check className="w-4 h-4" /> Chấp nhận</button>
                                </div>
                            </motion.div>
                        )) : <div className="text-center py-16 text-gray-400 text-sm"><ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-20" />Không có yêu cầu đổi ca nào</div>}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {approvedExchanges.map((req, i) => (
                            <motion.div key={req.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-300 to-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-green-700" /></div><div><p className="font-bold text-sm text-gray-800">{req.sender.name}</p><p className="text-[11px] text-gray-400">Duyệt: {req.approvedAt}</p></div></div>
                                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Đã duyệt</span>
                                </div>
                                <div className="bg-green-50/50 rounded-xl p-3 space-y-1.5 text-xs text-gray-600">
                                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 opacity-50" /><span>Ca {req.currentShift.shift} ↔ Ca {req.requestedShift.shift}</span></div>
                                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 opacity-50" /><span>{req.currentShift.location} ↔ {req.requestedShift.location}</span></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowModal(true)} className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-300/50 flex items-center justify-center z-40" style={{ right: 'calc(max(16px, (100vw - 480px) / 2 + 16px))' }}><Plus className="w-6 h-6" /></motion.button>

            <AnimatePresence>
                {showModal && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/40 z-[100]" />
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[101]">
                        <div className="bg-white rounded-t-3xl p-6 pb-28 shadow-2xl">
                            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" /><h2 className="text-lg font-bold text-gray-800 mb-4">Tạo yêu cầu đổi ca</h2>
                            <form onSubmit={handleCreateRequest} className="space-y-4">
                                <div><label className="text-sm font-medium text-gray-600 mb-1.5 block">Ngày cần đổi</label><input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className="login-input-field" /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-sm font-medium text-gray-600 mb-1.5 block">Giờ bắt đầu</label><input type="time" value={formData.startTime} onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))} className="login-input-field" /></div>
                                    <div><label className="text-sm font-medium text-gray-600 mb-1.5 block">Giờ kết thúc</label><input type="time" value={formData.endTime} onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))} className="login-input-field" /></div>
                                </div>
                                <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-600">Hủy</button><button type="submit" className="flex-1 login-btn-primary !py-3">Gửi yêu cầu</button></div>
                            </form>
                        </div>
                    </motion.div></>
                )}
            </AnimatePresence>
            <BottomNav />
        </div>
    );
}
