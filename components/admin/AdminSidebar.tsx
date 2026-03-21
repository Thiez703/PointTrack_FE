"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  MapPin, 
  Clock, 
  CalendarCheck, 
  Settings, 
  Banknote, 
  LayoutDashboard,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Nhân sự", href: "/admin/personnel", icon: Users },
  { name: "Khách hàng", href: "/admin/customers", icon: MapPin },
  { name: "Ca làm việc", href: "/admin/shift-templates", icon: Clock },
  { name: "Chấm công", href: "/admin/attendance", icon: CalendarCheck },
  { name: "Bậc lương", href: "/admin/salary-levels", icon: Banknote },
  { name: "Cấu hình", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
           <span className="text-white font-black text-xl">PT</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">PointTrack</h1>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 mb-1",
                isActive 
                  ? "bg-orange-50 text-orange-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600")} />
                  <span className="font-semibold text-[15px]">{item.name}</span>
                </div>
                {isActive && (
                   <motion.div layoutId="active-indicator">
                      <ChevronRight className="w-4 h-4" />
                   </motion.div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-6 border-t border-gray-50">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
