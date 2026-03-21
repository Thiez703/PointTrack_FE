"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { DataTable } from "@/components/admin/DataTable";
import { Customer } from "@/app/types/admin.schema";
import { MapPin } from "lucide-react";

export default function CustomersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => AdminService.getCustomers(),
  });

  const columns = [
    { 
      header: "Tên Khách hàng", 
      accessor: "name" as keyof Customer,
      className: "font-black text-gray-800"
    },
    { 
      header: "Địa chỉ", 
      accessor: "address" as keyof Customer 
    },
    { 
      header: "Tọa độ", 
      accessor: (item: Customer) => (
        <div className="flex items-center gap-2 text-orange-600 font-bold">
           <MapPin className="w-4 h-4" />
           <span>{item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}</span>
        </div>
      )
    },
    { 
      header: "Bán kính (m)", 
      accessor: (item: Customer) => (
        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-black text-gray-500">
          {item.radius}m
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DataTable<Customer>
        title="Quản lý Khách hàng & Địa điểm"
        description="Định nghĩa các điểm khách hàng kèm tọa độ GPS để nhân viên check-in."
        columns={columns}
        data={data?.data?.content || []}
        isLoading={isLoading}
        onAdd={() => console.log("Add Customer")}
      />
    </div>
  );
}
