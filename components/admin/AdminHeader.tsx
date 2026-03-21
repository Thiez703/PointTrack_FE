"use client";

import { Bell, Search, UserCircle } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export function AdminHeader() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-40">
      {/* Search Bar */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh..." 
          className="w-full bg-gray-50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-200 outline-none transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-none">{user?.fullName || "Admin"}</p>
            <p className="text-[11px] text-gray-400 font-medium uppercase mt-1 tracking-wider">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border-2 border-orange-50 ring-2 ring-orange-50">
             <UserCircle className="w-7 h-7" />
          </div>
        </div>
      </div>
    </header>
  );
}
