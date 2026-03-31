"use client";

import { Bell, Search, UserCircle, LogOut, Loader2, ChevronDown, Menu } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { useLogout } from "@/hooks/useLogout";
import { usePathname } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/admin": "Tổng quan hệ thống",
  "/admin/personnel": "Quản lý nhân sự",
  "/admin/customers": "Danh sách khách hàng",
  "/admin/schedule": "Lập lịch làm việc",
  "/admin/shift-templates": "Cấu hình ca mẫu",
  "/admin/attendance": "Dữ liệu chấm công",
  "/admin/salary-levels": "Cấu hình bậc lương",
  "/admin/settings": "Cài đặt hệ thống",
};

export function AdminHeader() {
  const pathname = usePathname();
  const userInfo = useAuthStore((state) => state.userInfo);
  const { toggleSidebar } = useSidebarStore();
  const { isLoggingOut, handleLogout } = useLogout();

  const currentTitle = Object.entries(pageTitles).find(([path]) =>
    pathname === path || (path !== "/admin" && pathname.startsWith(path))
  )?.[1] || "Bảng điều khiển";

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40 transition-all duration-300">
      {/* Left side: Menu Toggle & Title */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100 shadow-sm active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden xs:block">
          <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight leading-none">{currentTitle}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hệ thống đang trực tuyến</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Search - Hidden on small mobile */}
        <div className="relative w-48 xl:w-80 hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-200 focus:bg-white border outline-none transition-all font-medium text-gray-600"
          />
        </div>

        <button className="relative p-2.5 text-gray-400 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-all duration-300 group">
          <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100 mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 pl-1 sm:pl-2 group outline-none">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-gray-800 leading-none group-hover:text-orange-600 transition-colors">
                  {userInfo?.fullName?.split(' ').pop() || "Admin"}
                </p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                  {userInfo?.role || "Quản trị"}
                </p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-500 flex items-center justify-center text-white border-2 border-white ring-4 ring-orange-50 shadow-lg shadow-orange-100 group-hover:scale-105 transition-transform overflow-hidden">
                   {userInfo?.avatarUrl ? (
                     <img src={userInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <UserCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                   )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl border-gray-100 shadow-xl p-2">
            <DropdownMenuLabel className="font-black text-gray-400 text-[10px] uppercase tracking-widest px-3 py-2">
              Tài khoản của tôi
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-50" />
            <DropdownMenuItem className="rounded-xl font-bold text-gray-600 focus:bg-orange-50 focus:text-orange-600 cursor-pointer py-2.5">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Hồ sơ Admin</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-xl font-bold text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-2.5 mt-1"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>{isLoggingOut ? "Đang xử lý..." : "Đăng xuất"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
