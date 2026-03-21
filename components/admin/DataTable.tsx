"use client";

import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  MoreVertical,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  onAdd?: () => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: number | string }>({ 
  title, 
  description, 
  columns, 
  data, 
  onAdd,
  isLoading 
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-8 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
          {description && <p className="text-gray-400 text-sm font-medium mt-1">{description}</p>}
        </div>
        
        <div className="flex items-center gap-4">
           {/* Search in table */}
           <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm trong bảng..." 
                className="w-full bg-gray-50 border-none rounded-xl py-2 pl-11 pr-4 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
              />
           </div>

           {onAdd && (
             <button 
                onClick={onAdd}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-100 active:scale-95"
             >
                <Plus className="w-4 h-4" />
                <span>Thêm mới</span>
             </button>
           )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map((col, idx) => (
                <th key={idx} className={cn("px-8 py-5 text-left text-[13px] font-bold text-gray-400 uppercase tracking-wider", col.className)}>
                  {col.header}
                </th>
              ))}
              <th className="px-8 py-5 text-right text-[13px] font-bold text-gray-400 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <tr key={i} className="animate-pulse">
                   {columns.map((_, idx) => (
                     <td key={idx} className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                   ))}
                   <td className="px-8 py-6 text-right"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  {columns.map((col, idx) => (
                    <td key={idx} className={cn("px-8 py-6 text-[15px] font-medium text-gray-600", col.className)}>
                      {typeof col.accessor === "function" ? col.accessor(item) : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-gray-400 hover:bg-white hover:text-orange-500 rounded-lg transition-all border border-transparent hover:border-gray-100 shadow-sm">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-8 py-20 text-center text-gray-400 font-semibold italic">
                   Không có dữ liệu hiển thị.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/20">
        <p className="text-sm font-bold text-gray-400">
           Hiển thị <span className="text-gray-800">{data.length}</span> trên <span className="text-gray-800">100</span> kết quả
        </p>
        <div className="flex items-center gap-2">
           <button className="p-2 border border-gray-100 rounded-xl hover:bg-white transition-all text-gray-400 hover:text-orange-500 shadow-sm disabled:opacity-50">
             <ChevronLeft className="w-5 h-5" />
           </button>
           <div className="flex items-center px-4 gap-1">
             {[1, 2, 3].map(p => (
               <button key={p} className={cn(
                 "w-8 h-8 rounded-lg text-xs font-black transition-all",
                 p === 1 ? "bg-orange-500 text-white shadow-lg shadow-orange-100" : "text-gray-400 hover:bg-white hover:text-orange-500"
               )}>
                 {p}
               </button>
             ))}
           </div>
           <button className="p-2 border border-gray-100 rounded-xl hover:bg-white transition-all text-gray-400 hover:text-orange-500 shadow-sm">
             <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
