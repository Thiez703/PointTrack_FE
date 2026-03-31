"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useSidebarStore } from "@/stores/useSidebarStore";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, isOpen, setIsOpen } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fcfdfe] flex">
      {/* Sidebar - Desktop and Mobile Overlay */}
      <AdminSidebar />

      {/* Mobile Overlay Background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:pl-20" : "lg:pl-72",
        "w-full"
      )}>
        {/* Header - Fixed height */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 lg:p-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
