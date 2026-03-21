"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  MapPin, 
  Clock, 
  CalendarCheck, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Nhân viên hoạt động", value: "1,284", trend: "+12%", up: true, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Điểm khách hàng", value: "42", trend: "+2", up: true, icon: MapPin, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "Check-in hôm nay", value: "856", trend: "-5%", up: false, icon: CalendarCheck, color: "text-green-600", bg: "bg-green-50" },
  { label: "Tỷ lệ đi muộn", value: "3.2%", trend: "-0.5%", up: true, icon: Clock, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Chào buổi sáng, Admin! 👋</h1>
          <p className="text-gray-400 font-medium mt-2">Dưới đây là tóm tắt hoạt động của hệ thống PointTrack hôm nay.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
           <Activity className="w-4 h-4 text-green-500" />
           Hệ thống: <span className="text-green-600">Ổn định</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-4 rounded-2xl transition-colors", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg",
                stat.up ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
              )}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</h3>
              <p className="text-gray-400 text-sm font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts / Secondary Info Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  Biểu đồ Chấm công tuần qua
               </h3>
               <select className="bg-gray-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none">
                  <option>7 ngày gần nhất</option>
                  <option>30 ngày gần nhất</option>
               </select>
            </div>
            <div className="flex-1 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center text-gray-300 font-bold italic">
               [ Biểu đồ thống kê sẽ hiển thị tại đây ]
            </div>
         </div>

         <div className="bg-orange-500 p-8 rounded-[40px] shadow-xl shadow-orange-100 text-white flex flex-col relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            
            <h3 className="text-2xl font-black leading-tight relative z-10">Tối ưu hóa <br/>quản lý nhân sự</h3>
            <p className="text-orange-100 text-sm font-medium mt-4 relative z-10">Sử dụng AI để dự báo nhu cầu nhân lực và tự động xếp ca làm việc thông minh.</p>
            
            <button className="mt-auto bg-white text-orange-600 font-black py-4 rounded-2xl text-sm shadow-lg active:scale-95 transition-all relative z-10">
               KHÁM PHÁ NGAY
            </button>
         </div>
      </div>
    </div>
  );
}
