"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeftRight, Plus,
    Clock, MapPin, CheckCircle2, Calendar, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- MOCK DATA CHO GIAO DIỆN MỚI ---
const myShiftsMock = [
    { id: 10, date: '2026-03-20', time: '06:00 - 14:00', type: 'Sáng', location: 'KCN Tân Bình' },
    { id: 11, date: '2026-03-22', time: '14:00 - 22:00', type: 'Chiều', location: 'Tòa nhà Bitexco' },
];

const availableShiftsMock = [
    { id: 20, date: '2026-03-20', time: '14:00 - 22:00', type: 'Chiều', employee: 'Nguyễn Văn A', location: 'KCN Tân Bình' },
    { id: 21, date: '2026-03-21', time: '06:00 - 14:00', type: 'Sáng', employee: 'Lê Thị B', location: 'Tòa nhà Bitexco' },
    { id: 22, date: '2026-03-22', time: '22:00 - 06:00', type: 'Đêm', employee: null, location: 'Trạm trung chuyển' },
];

export default function ExchangePage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [approvedExchanges] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    
    // State form mới
    const [formData, setFormData] = useState({ 
        myShiftId: '', 
        targetShiftId: '', 
        reason: '' 
    });

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
        if (!formData.myShiftId || !formData.targetShiftId) {
            toast.error('Vui lòng chọn đầy đủ ca làm việc');
            return;
        }

        const myShift = myShiftsMock.find(s => s.id === Number(formData.myShiftId));
        const targetShift = availableShiftsMock.find(s => s.id === Number(formData.targetShiftId));

        if (!myShift || !targetShift) return;

        // Tạo request giả lập để hiển thị ngay
        const newRequest = {
            id: Date.now(),
            sender: { name: 'Tôi (Bạn)', employeeId: 'NV-ME' },
            currentShift: { date: myShift.date, time: myShift.time, shift: myShift.type, location: myShift.location },
            requestedShift: { date: targetShift.date, time: targetShift.time, shift: targetShift.type, location: targetShift.location },
            targetEmployee: targetShift.employee,
            reason: formData.reason,
            createdAt: 'Vừa xong',
        };

        setPendingRequests(prev => [newRequest, ...prev]);
        setShowModal(false);
        setFormData({ myShiftId: '', targetShiftId: '', reason: '' });
        
        if (targetShift.employee) {
            toast.success(`Đã gửi yêu cầu đổi ca tới ${targetShift.employee}`);
        } else {
            toast.success('Đã đăng ký đổi ca trống thành công!');
        }
    };

    const selectedTargetShift = availableShiftsMock.find(s => s.id === Number(formData.targetShiftId));

    return (
        <div className="flex-1 w-full pb-32 lg:pb-12 bg-gray-50 dark:bg-slate-950 min-h-screen">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-16 pb-12 px-6 sm:px-12 rounded-b-[60px] lg:rounded-b-[80px] shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-2">Đổi ca làm việc</h1>
                        <p className="text-orange-100 text-sm font-bold uppercase tracking-widest opacity-80">Quản lý các yêu cầu thay đổi lịch trình</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-1.5 flex gap-1 border border-white/10">
                        {[
                            { id: 'pending', label: 'Đang chờ', count: pendingRequests.length },
                            { id: 'approved', label: 'Lịch sử', count: approvedExchanges.length },
                        ].map((tab) => (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)} 
                                className={cn(
                                    "px-6 py-2.5 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    activeTab === tab.id ? "bg-white text-orange-600 shadow-lg" : "text-white/80 hover:text-white"
                                )}
                            >
                                {tab.label}
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px]",
                                    activeTab === tab.id ? "bg-orange-100 text-orange-600" : "bg-white/20 text-white"
                                )}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-12 -mt-10 relative z-20">
                {activeTab === 'pending' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pendingRequests.length > 0 ? pendingRequests.map((req) => (
                            <motion.div 
                                key={req.id} 
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 font-black">
                                            {req.sender.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-800 dark:text-white uppercase tracking-tight">{req.sender.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.sender.employeeId} · {req.createdAt}</p>
                                        </div>
                                    </div>
                                    {req.targetEmployee && (
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Gửi tới</p>
                                            <p className="text-xs font-bold text-orange-600">{req.targetEmployee}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 border border-gray-100 dark:border-slate-800">
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ca hiện tại</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{req.currentShift.shift} · {req.currentShift.time} · {req.currentShift.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
                                            <ArrowLeftRight size={18} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ca mong muốn</p>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{req.requestedShift.shift} · {req.requestedShift.time} · {req.requestedShift.date}</p>
                                        </div>
                                    </div>
                                </div>
                                {req.reason && (
                                    <div className="mt-4 p-4 bg-orange-50/50 dark:bg-orange-500/5 rounded-xl border border-orange-100 dark:border-orange-500/10">
                                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <MessageSquare size={12} /> Nội dung:
                                        </p>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{req.reason}</p>
                                    </div>
                                )}
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => handleReject(req.id)} className="flex-1 py-4 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Từ chối</button>
                                    <button onClick={() => handleAccept(req.id)} className="flex-1 py-4 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-600 transition-all">Chấp nhận</button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-gray-200 dark:border-slate-800">
                                <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Chưa có yêu cầu nào</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {approvedExchanges.map((req) => (
                            <motion.div key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-green-100 dark:border-green-900/30 shadow-xl shadow-green-100/50 dark:shadow-none">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600"><CheckCircle2 size={20} /></div>
                                        <div><p className="font-black text-sm text-gray-800 dark:text-white">{req.sender.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{req.approvedAt}</p></div>
                                    </div>
                                    <span className="text-[9px] font-black bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-3 py-1 rounded-full uppercase tracking-widest">Đã duyệt</span>
                                </div>
                                <div className="space-y-2 text-xs font-bold text-gray-500">
                                    <div className="flex items-center gap-2"><Clock size={14} className="text-orange-500" /><span>{req.currentShift.shift} ↔ {req.requestedShift.shift}</span></div>
                                    <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /><span>{req.currentShift.location}</span></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <motion.button 
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.9 }} 
                onClick={() => setShowModal(true)} 
                className="fixed bottom-24 lg:bottom-12 right-8 w-16 h-16 rounded-[24px] bg-slate-900 dark:bg-orange-500 text-white shadow-2xl flex items-center justify-center z-40 group transition-all"
            >
                <Plus className="w-8 h-8 group-hover:scale-110" strokeWidth={3} />
            </motion.button>

            <AnimatePresence>
                {showModal && (
                    <><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]" />
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-12 lg:bottom-12 w-full lg:w-[480px] z-[101]">
                        <div className="bg-white dark:bg-slate-900 rounded-t-[40px] lg:rounded-[40px] p-8 pb-12 lg:pb-8 shadow-2xl">
                            <div className="w-12 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 tracking-tighter">Tạo yêu cầu đổi ca</h2>
                            <form onSubmit={handleCreateRequest} className="space-y-5">
                                
                                {/* Chọn ca của bản thân */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Ca làm của bạn</label>
                                    <select 
                                        value={formData.myShiftId} 
                                        onChange={(e) => setFormData(p => ({ ...p, myShiftId: e.target.value }))}
                                        className="login-input-field appearance-none dark:bg-slate-800 dark:border-slate-700"
                                    >
                                        <option value="">-- Chọn ca làm của bạn --</option>
                                        {myShiftsMock.map(s => (
                                            <option key={s.id} value={s.id}>{s.date} - {s.type} ({s.time})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Chọn ca muốn đổi */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Ca làm muốn đổi</label>
                                    <select 
                                        value={formData.targetShiftId} 
                                        onChange={(e) => setFormData(p => ({ ...p, targetShiftId: e.target.value }))}
                                        className="login-input-field appearance-none dark:bg-slate-800 dark:border-slate-700"
                                    >
                                        <option value="">-- Chọn ca làm muốn đổi --</option>
                                        {availableShiftsMock.map(s => (
                                            <option key={s.id} value={s.id}>{s.date} - {s.type} ({s.time})</option>
                                        ))}
                                    </select>
                                    
                                    {/* Hiển thị thông tin người đang đảm nhiệm */}
                                    {selectedTargetShift && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-center gap-3"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-sm">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Đang đảm nhiệm</p>
                                                <p className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                                    {selectedTargetShift.employee ? `${selectedTargetShift.employee} (Sẽ yêu cầu đổi)` : 'Ca trống (Đổi trực tiếp)'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Nội dung yêu cầu */}
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block mb-2">Lý do / Nội dung</label>
                                    <textarea 
                                        value={formData.reason} 
                                        onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))}
                                        placeholder="VD: Mình có việc bận gia đình nên muốn đổi ca..."
                                        className="login-input-field min-h-[100px] py-4 dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-50 dark:bg-slate-800 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all">Hủy</button>
                                    <button type="submit" className="flex-1 bg-orange-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-orange-200 dark:shadow-none">Gửi yêu cầu</button>
                                </div>
                            </form>
                        </div>
                    </motion.div></>
                )}
            </AnimatePresence>
        </div>
    );
}
