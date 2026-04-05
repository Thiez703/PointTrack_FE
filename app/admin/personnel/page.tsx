"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "@/app/services/admin.service";
import { DataTable } from "@/components/admin/DataTable";
import { Employee } from "@/app/types/admin.schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Edit2, UserX, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import type { AxiosError } from "axios";

export default function PersonnelPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin", "personnel-stats"],
    queryFn: () => AdminService.getPersonnelStats(),
    staleTime: 5 * 60 * 1000,
  });

  const getTrendColor = (trend?: string) => {
    if (!trend || trend === "0%") return "text-gray-400 bg-gray-50";
    return trend.startsWith("+") 
      ? "text-green-600 bg-green-50" 
      : "text-red-600 bg-red-50";
  };

  const getTrendIcon = (trend?: string) => {
    if (!trend || trend === "0%") return null;
    return trend.startsWith("+") 
      ? <TrendingUp className="w-3 h-3 mr-1" /> 
      : <TrendingDown className="w-3 h-3 mr-1" />;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "personnel"],
    queryFn: () => AdminService.getPersonnel(),
  });

  const filteredPersonnel = useMemo(
    () => data?.data?.content?.filter((emp: Employee) => emp.role !== "ADMIN") ?? [],
    [data]
  );

  const newEmployeesThisMonthCount = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return filteredPersonnel.filter((emp: Employee) => {
      if (!emp.hiredDate) return false;
      const hiredDate = new Date(emp.hiredDate);
      return hiredDate.getMonth() === currentMonth && hiredDate.getFullYear() === currentYear;
    }).length;
  }, [filteredPersonnel]);

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const response = await AdminService.deleteEmployee(deletingId);
      if (response.success) {
        toast.success(response.message || "Đã vô hiệu hóa nhân viên thành công.");
        queryClient.invalidateQueries({ queryKey: ["admin", "personnel"] });
      } else {
        toast.error(response.message || "Không thể xóa nhân viên");
      }
    } catch (err) {
      const error = err as AxiosError;
      if (error.response?.status === 404) {
        toast.error("Nhân viên không tồn tại hoặc đã bị xóa");
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }, [deletingId, queryClient]);

  const columns = useMemo(() => [
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
          <span className="font-bold text-gray-700">{item.phone}</span>
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
      accessor: (item: Employee) => {
        let statusLabel = "Đã khóa";
        let statusClass = "bg-red-50 text-red-600 border-red-100";

        if (item.status === "ACTIVE") {
          statusLabel = "Đang làm việc";
          statusClass = "bg-green-50 text-green-600 border-green-100";
        } else if (item.status === "ON_LEAVE") {
          statusLabel = "Nghỉ phép";
          statusClass = "bg-orange-50 text-orange-600 border-orange-100";
        }

        return (
          <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", statusClass)}>
            {statusLabel}
          </Badge>
        );
      }
    },
  ], []);

  const overviewCards = useMemo(() => {
    const activeCount = filteredPersonnel.filter((e: Employee) => e.status === "ACTIVE").length;
    const onLeaveCount = filteredPersonnel.filter((e: Employee) => e.status === "ON_LEAVE").length;
    const total = filteredPersonnel.length || stats?.data?.totalEmployees || 1;
    return [
      {
        label: "Tổng nhân viên",
        value: filteredPersonnel.length || stats?.data?.totalEmployees || 0,
        trend: stats?.data?.totalTrend,
        color: "bg-blue-500",
        progress: 100
      },
      {
        label: "Đang làm việc",
        value: activeCount || stats?.data?.activeEmployees || 0,
        trend: stats?.data?.activeRate,
        color: "bg-green-500",
        progress: parseInt(stats?.data?.activeRate?.replace("%", "") || "0")
      },
      {
        label: "Đang nghỉ phép",
        value: onLeaveCount || stats?.data?.onLeaveEmployees || 0,
        trend: undefined,
        color: "bg-orange-500",
        progress: (stats?.data?.onLeaveEmployees || 0) / total * 100
      },
      {
        label: "Mới tháng này",
        value: newEmployeesThisMonthCount,
        trend: undefined,
        color: "bg-purple-500",
        progress: newEmployeesThisMonthCount / total * 100
      },
    ];
  }, [filteredPersonnel, newEmployeesThisMonthCount, stats]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {overviewCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-end justify-between mt-3">
               <h3 className="text-3xl font-black text-gray-800 tracking-tight">
                 {isLoading || isLoadingStats ? "..." : stat.value.toLocaleString()}
               </h3>
               {stat.trend && (
                 <span className={cn("text-[10px] font-black px-2 py-1 rounded-lg flex items-center shadow-sm", getTrendColor(stat.trend))}>
                   {getTrendIcon(stat.trend)}
                   {stat.trend}
                 </span>
               )}
            </div>
            <div className={cn("h-1.5 w-full rounded-full mt-4 bg-gray-50 overflow-hidden")}>
               <div 
                 className={cn("h-full rounded-full transition-all duration-1000", stat.color)} 
                 style={{ width: isLoadingStats ? '0%' : `${Math.min(stat.progress || 0, 100)}%` }}
               ></div>
            </div>
          </div>
        ))}
      </div>

      <DataTable<Employee>
        title="Danh sách Nhân sự"
        description="Quản lý hồ sơ, tài khoản và trạng thái làm việc của nhân viên."
        columns={columns}
        data={filteredPersonnel}
        isLoading={isLoading}
        onAdd={() => router.push("/admin/personnel/create")}
        renderActions={(item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-gray-400 hover:bg-white hover:text-orange-500 rounded-lg transition-all border border-transparent hover:border-gray-100 shadow-sm">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl border-gray-100 shadow-xl p-2">
              <DropdownMenuLabel className="font-black text-gray-400 text-[10px] uppercase tracking-widest px-3 py-2">
                Thao tác
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-50" />
              <DropdownMenuItem 
                onClick={() => router.push(`/admin/personnel/edit/${item.id}`)}
                className="rounded-xl font-bold text-gray-600 focus:bg-orange-50 focus:text-orange-600 cursor-pointer py-2.5"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeletingId(item.id)}
                className="rounded-xl font-bold text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-2.5 mt-1"
              >
                <UserX className="mr-2 h-4 w-4" />
                <span>Vô hiệu hóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-3xl border-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-gray-800">Xác nhận vô hiệu hóa</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium">
              Bạn có chắc chắn muốn vô hiệu hóa nhân viên này? 
              <br />
              <span className="text-red-500 font-bold mt-2 block italic text-sm">
                * Toàn bộ ca làm việc chưa diễn ra của nhân viên này sẽ tự động bị hủy.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-4">
            <AlertDialogCancel className="rounded-2xl border-gray-100 font-bold text-gray-400 px-6">Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold px-6 shadow-lg shadow-red-100"
            >
              {isDeleting ? "Đang xử lý..." : "Vô hiệu hóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

