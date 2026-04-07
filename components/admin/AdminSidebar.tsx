"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  MapPin, 
  Clock, 
  CalendarCheck, 
  Calendar,
  Settings, 
  Banknote, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  FileText,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { useSidebarStore } from "@/stores/useSidebarStore";
import { useLogout } from "@/hooks/useLogout";
import { Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
  { name: "Nhân sự", href: "/admin/personnel", icon: Users },
  { name: "Khách hàng", href: "/admin/customers", icon: MapPin },
  { name: "Lập lịch", href: "/admin/schedule", icon: CalendarCheck },
  { name: "Chấm công", href: "/admin/attendance", icon: Calendar },
  { name: "Giải trình", href: "/admin/attendance/explanations", icon: FileText },
  { name: "Đổi ca", href: "/admin/shift-swap", icon: RefreshCw },
  { name: "Bậc lương", href: "/admin/salary-levels", icon: Banknote },
  { name: "Cấu hình", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isOpen, setIsOpen } = useSidebarStore();
  const { isLoggingOut, handleLogout } = useLogout();

  const sidebarContent = (
    <div className={cn(
      "h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-72"
    )}>
      {/* Header / Logo */}
      <div className={cn(
        "p-6 flex items-center justify-between",
        isCollapsed ? "flex-col gap-4 px-0" : "px-6"
      )}>
        <div className={cn(
          "flex items-center gap-3 overflow-hidden",
          isCollapsed && "flex-col text-center"
        )}>
          <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 flex-shrink-0">
             <span className="text-white font-black text-xl italic tracking-tighter">PT</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="whitespace-nowrap"
              >
                <h1 className="text-xl font-black text-gray-800 tracking-tight">PointTrack</h1>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-[0.2em]">Dashboard</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar scroll-smooth">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
            
            const linkContent = (
              <div className={cn(
                "group relative flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-orange-50 text-orange-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                isCollapsed && "justify-center px-0 w-12 h-12 mx-auto"
              )}>
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110", 
                  isActive ? "text-orange-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                
                {!isCollapsed && (
                  <span className="ml-3 font-semibold text-[15px] whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}

                {isActive && !isCollapsed && (
                  <motion.div layoutId="active-indicator" className="ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </motion.div>
                )}
                
                {/* Active highlight for collapsed state */}
                {isActive && isCollapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-r-full" />
                )}
              </div>
            );

            return (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                {isCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-900 text-white border-none px-3 py-2 rounded-xl text-xs font-bold">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkContent
                )}
              </Link>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Collapse Toggle - Desktop Only */}
      <div className="hidden lg:flex px-4 py-4 justify-center border-t border-gray-50">
        <button 
          onClick={toggleCollapse}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-all border border-gray-100 hover:border-orange-100 group shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>
      </div>

      {/* Footer / Logout */}
      <div className={cn(
        "p-4 border-t border-gray-50",
        isCollapsed && "flex justify-center"
      )}>
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "group w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all",
            isLoggingOut && "opacity-50 cursor-not-allowed",
            isCollapsed && "px-0 w-12 h-12 justify-center"
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          )}
          {!isCollapsed && <span className="whitespace-nowrap">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-screen z-50 hidden lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="w-72 h-full bg-white shadow-2xl">
          {/* Reuse sidebarContent but with isCollapsed=false for mobile */}
          <div className="h-full flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center">
                   <span className="text-white font-black text-xl italic tracking-tighter">PT</span>
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-800">PointTrack</h1>
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Mobile Admin</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-3">
               {/* Mobile specific navigation list - always expanded */}
               {menuItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                      <div className={cn(
                        "flex items-center px-4 py-3.5 rounded-2xl transition-all mb-1",
                        isActive ? "bg-orange-50 text-orange-600 shadow-sm font-bold" : "text-gray-500 hover:bg-gray-50"
                      )}>
                        <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-orange-600" : "text-gray-400")} />
                        <span>{item.name}</span>
                        {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                      </div>
                    </Link>
                  );
               })}
            </div>

            <div className="p-4 border-t border-gray-50">
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-colors"
              >
                {isLoggingOut ? <Loader2 className="animate-spin w-5 h-5" /> : <LogOut className="w-5 h-5" />}
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
