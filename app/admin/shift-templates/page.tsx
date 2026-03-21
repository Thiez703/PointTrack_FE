"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { DataTable } from "@/components/admin/DataTable";
import { ShiftTemplate } from "@/app/types/admin.schema";
import { Clock, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ShiftTemplatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "shift-templates"],
    queryFn: () => AdminService.getShiftTemplates(),
  });

  const columns = [
    { 
      header: "Tên Ca", 
      accessor: "name" as keyof ShiftTemplate,
      className: "font-black text-gray-800"
    },
    { 
      header: "Thời gian", 
      accessor: (item: ShiftTemplate) => (
        <div className="flex items-center gap-2 text-orange-600 font-bold">
           <Clock className="w-4 h-4" />
           <span>{item.startTime} - {item.endTime}</span>
        </div>
      )
    },
    { 
      header: "Loại ca", 
      accessor: (item: ShiftTemplate) => (
        <div className="flex items-center gap-2">
           <Briefcase className="w-4 h-4 text-gray-400" />
           <Badge variant="outline" className="border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-[10px]">
             {item.type === "OFFICE" ? "Hành chính" : "Ca xoay"}
           </Badge>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DataTable<ShiftTemplate>
        title="Mẫu Ca làm việc"
        description="Định nghĩa các loại ca làm việc và khung giờ quy định cho nhân viên."
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onAdd={() => console.log("Add Shift")}
      />
    </div>
  );
}
