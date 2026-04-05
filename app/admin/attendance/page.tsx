"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { DataTable } from "@/components/admin/DataTable";
import { AttendanceRecord } from "@/app/types/admin.schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function AttendancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "attendance"],
    queryFn: () => AdminService.getAttendanceRecords(),
  });

  const columns = [
    { 
      header: "Nhân viên", 
      accessor: (item: AttendanceRecord) => (
        <span className="font-bold text-gray-800">{item.employeeName}</span>
      )
    },
    { 
      header: "Địa điểm / Ca", 
      accessor: (item: AttendanceRecord) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-600">{item.customerName}</span>
          <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{item.shiftName}</span>
        </div>
      )
    },
    { 
      header: "Giờ vào/ra", 
      accessor: (item: AttendanceRecord) => (
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase">IN</span>
              <span className="text-sm font-black text-orange-600">{item.checkInTime || "--:--"}</span>
           </div>
           <div className="w-[1px] h-6 bg-gray-100"></div>
           <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase">OUT</span>
              <span className="text-sm font-black text-gray-800">{item.checkOutTime || "--:--"}</span>
           </div>
        </div>
      )
    },
    { 
      header: "Trạng thái", 
      accessor: (item: AttendanceRecord) => {
        const statusConfig = {
          PRESENT: { label: "Hợp lệ", color: "text-green-600 bg-green-50 border-green-100", icon: CheckCircle2 },
          ABSENT: { label: "Vắng mặt", color: "text-red-600 bg-red-50 border-red-100", icon: XCircle },
          LATE: { label: "Đi muộn", color: "text-orange-600 bg-orange-50 border-orange-100", icon: Clock },
          EARLY_LEAVE: { label: "Về sớm", color: "text-blue-600 bg-blue-50 border-blue-100", icon: AlertCircle },
        };
        const config = statusConfig[item.status] || statusConfig.PRESENT;
        return (
          <Badge className={cn("px-3 py-1.5 rounded-xl border flex items-center gap-1.5 w-fit", config.color)}>
            <config.icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
          </Badge>
        );
      }
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DataTable<AttendanceRecord>
        title="Lịch sử Chấm công"
        description="Theo dõi chi tiết giờ giấc làm việc và trạng thái chuyên cần của nhân viên."
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      />
    </div>
  );
}

