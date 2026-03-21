"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { DataTable } from "@/components/admin/DataTable";
import { SalaryLevel } from "@/app/types/admin.schema";
import { Banknote, TrendingUp } from "lucide-react";

export default function SalaryLevelsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "salary-levels"],
    queryFn: () => AdminService.getSalaryLevels(),
  });

  const columns = [
    { 
      header: "Tên Bậc lương", 
      accessor: "levelName" as keyof SalaryLevel,
      className: "font-black text-gray-800"
    },
    { 
      header: "Lương cơ bản", 
      accessor: (item: SalaryLevel) => (
        <div className="flex items-center gap-2 text-green-600 font-bold">
           <Banknote className="w-4 h-4" />
           <span>{item.baseSalary.toLocaleString()} VND</span>
        </div>
      )
    },
    { 
      header: "Phụ cấp", 
      accessor: (item: SalaryLevel) => (
        <div className="flex items-center gap-2 text-blue-600 font-bold">
           <TrendingUp className="w-4 h-4" />
           <span>{item.allowance.toLocaleString()} VND</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DataTable<SalaryLevel>
        title="Quản lý Bậc lương"
        description="Định nghĩa các mức lương cơ bản và phụ cấp áp dụng cho từng chức danh."
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        onAdd={() => console.log("Add Salary Level")}
      />
    </div>
  );
}
