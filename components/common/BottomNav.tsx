"use client";

import { Home, Calendar, MapPin, ArrowLeftRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
    { id: '/', label: 'Trang chủ', icon: Home },
    { id: '/calendar', label: 'Lịch làm', icon: Calendar },
    { id: '/checkin', label: '', icon: MapPin },
    { id: '/exchange', label: 'Đổi ca', icon: ArrowLeftRight },
    { id: '/profile', label: 'Tài khoản', icon: User },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50">
            <div className="bg-white border-t border-gray-100 flex items-end justify-around px-2 pb-2 pt-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.id;
                    const isCheckin = item.id === '/checkin';

                    if (isCheckin) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => router.push('/checkin')}
                                className="relative -mt-6 flex flex-col items-center"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-300/50 ring-4 ring-white"
                                >
                                    <MapPin className="w-6 h-6 text-white" />
                                </motion.div>
                                <span className="text-[10px] mt-1 font-medium text-orange-500">Chấm công</span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.id)}
                            className="flex flex-col items-center py-1.5 px-3 relative"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="navIndicator"
                                    className="absolute -top-0.5 w-8 h-0.5 bg-orange-500 rounded-full"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                            <Icon
                                className={`w-5 h-5 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] mt-0.5 font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
