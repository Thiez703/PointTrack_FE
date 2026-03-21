import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fcfdfe]">
      {/* Sidebar - Fixed width */}
      <AdminSidebar />

      {/* Main Content Area - Remaining width */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Header - Fixed height */}
        <AdminHeader />

        {/* Dynamic Page Content */}
        <main className="p-10 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
