"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { DataTable } from "@/components/admin/DataTable";
import { Employee } from "@/app/types/admin.schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PersonnelPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "personnel"],
    queryFn: () => AdminService.getPersonnel(),
  });

  const columns = [
    { 
      header: "Mã NV", 
      accessor: "employeeCode" as keyof Employee,
      className: "font-black text-orange-600"
    },
    { 
      header: "Họ và tên", 
      accessor: "fullName" as keyof Employee 
    },
    { 
      header: "SĐT / Email", 
      accessor: (item: Employee) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-700">{item.phoneNumber}</span>
          <span className="text-xs text-gray-400 font-medium">{item.email || "Chưa cập nhật"}</span>
        </div>
      )
    },
    { 
      header: "Phòng ban", 
      accessor: "department" as keyof Employee 
    },
    { 
      header: "Chức vụ", 
      accessor: "position" as keyof Employee 
    },
    { 
      header: "Trạng thái", 
      accessor: (item: Employee) => (
        <Badge className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
          item.status === "ACTIVE" 
            ? "bg-green-50 text-green-600 border-green-100" 
            : "bg-red-50 text-red-600 border-red-100"
        )}>
          {item.status === "ACTIVE" ? "Đang làm việc" : "Đã khóa"}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Tổng nhân viên", value: "128", trend: "+4%", color: "bg-blue-500" },
          { label: "Đang làm việc", value: "124", trend: "98%", color: "bg-green-500" },
          { label: "Nghỉ phép", value: "2", trend: "-1", color: "bg-orange-500" },
          { label: "Mới trong tháng", value: "6", trend: "+2", color: "bg-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-3">
               <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</h3>
               <span className={cn("text-xs font-bold px-2 py-1 rounded-lg", stat.trend.includes("+") ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50")}>
                 {stat.trend}
               </span>
            </div>
            <div className={cn("h-1.5 w-full rounded-full mt-4 bg-gray-50 overflow-hidden")}>
               <div className={cn("h-full rounded-full", stat.color)} style={{ width: '70%' }}></div>
            </div>
          </div>
        ))}
      </div>

      <DataTable<Employee>
        title="Danh sách Nhân sự"
        description="Quản lý hồ sơ, tài khoản và trạng thái làm việc của nhân viên."
        columns={columns}
        data={data?.data?.content || []}
        isLoading={isLoading}
        onAdd={() => console.log("Add Employee")}
      />
    </div>
  );
}
