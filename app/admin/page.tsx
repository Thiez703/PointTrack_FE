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
  Activity,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { customerService } from "@/app/services/customer.service";
import { formatToISODate } from "@/lib/dateUtils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { subDays, format } from "date-fns";
import { vi } from "date-fns/locale";

export default function AdminDashboard() {
  const today = new Date();
  const todayStr = formatToISODate(today);
  const sevenDaysAgo = formatToISODate(subDays(today, 6));

  const { data: personnelStats, isLoading: isPersonnelLoading } = useQuery({
    queryKey: ["personnel-stats"],
    queryFn: () => AdminService.getPersonnelStats(),
  });

  const { data: customerData, isLoading: isCustomerLoading } = useQuery({
    queryKey: ["customer-stats"],
    queryFn: () => customerService.getList({ size: 1 }),
  });

  const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ["attendance-stats-today", todayStr],
    queryFn: () => AdminService.getAttendanceRecords({ startDate: todayStr, endDate: todayStr }),
  });

  const { data: chartDataRaw, isLoading: isChartLoading } = useQuery({
    queryKey: ["attendance-chart-7days", sevenDaysAgo, todayStr],
    queryFn: () => AdminService.getAttendanceRecords({ startDate: sevenDaysAgo, endDate: todayStr }),
  });

  const isLoading = isPersonnelLoading || isCustomerLoading || isAttendanceLoading || isChartLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // Process chart data
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = formatToISODate(date);
    const records = Array.isArray(chartDataRaw?.data) ? chartDataRaw.data : [];
    const dayRecords = records.filter(r => r.checkInTime && r.checkInTime.startsWith(dateStr));
    
    return {
      name: format(date, "dd/MM", { locale: vi }),
      count: dayRecords.length,
      fullDate: dateStr
    };
  });

  const stats = [
    { 
      label: "Nhân viên hoạt động", 
      value: personnelStats?.data?.activeEmployees?.toLocaleString() || "0", 
      trend: personnelStats?.data?.totalTrend || "0%", 
      up: !personnelStats?.data?.totalTrend?.startsWith("-"), 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Điểm khách hàng", 
      value: customerData?.totalElements?.toLocaleString() || "0", 
      trend: "+0", 
      up: true, 
      icon: MapPin, 
      color: "text-orange-600", 
      bg: "bg-orange-50" 
    },
    { 
      label: "Check-in hôm nay", 
      value: (Array.isArray(attendanceData?.data) ? attendanceData.data.length : 0).toLocaleString(), 
      trend: "0%", 
      up: true, 
      icon: CalendarCheck, 
      color: "text-green-600", 
      bg: "bg-green-50" 
    },
    { 
      label: "Tỷ lệ đi muộn", 
      value: (Array.isArray(attendanceData?.data) && attendanceData.data.length > 0)
        ? ((attendanceData.data.filter(r => r.status === "LATE").length / attendanceData.data.length) * 100).toFixed(1) + "%" 
        : "0%", 
      trend: "0%", 
      up: true, 
      icon: Clock, 
      color: "text-purple-600", 
      bg: "bg-purple-50" 
    },
  ];

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
            <div className="flex-1 h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }}
                        dy={10}
                     />
                     <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }}
                     />
                     <Tooltip 
                        cursor={{ fill: '#f97316', opacity: 0.1 }}
                        contentStyle={{ 
                           borderRadius: '16px', 
                           border: 'none', 
                           boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                           fontWeight: 'bold'
                        }}
                     />
                     <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                           <Cell 
                              key={`cell-${index}`} 
                              fill={entry.fullDate === todayStr ? '#f97316' : '#fed7aa'} 
                           />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
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

