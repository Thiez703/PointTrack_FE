"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AttendanceService } from "@/app/services/attendance.service";
import { DataTable } from "@/components/admin/DataTable";
import { AttendanceExplanation } from "@/app/types/attendance.schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  MapPin, 
  FileText,
  MoreVertical,
  Check,
  X,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ExplanationManagementPage() {
  const queryClient = useQueryClient();
  const [selectedExplanation, setSelectedExplanation] = useState<AttendanceExplanation | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);

  // 1. Fetch PENDING explanations
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "attendance", "explanations", "PENDING"],
    queryFn: () => AttendanceService.getExplanations("PENDING"),
  });

  // 2. Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => 
      AttendanceService.approveExplanation(id, note),
    onSuccess: (res) => {
      toast.success(res.message || "Đã duyệt giải trình thành công");
      queryClient.invalidateQueries({ queryKey: ["admin", "attendance"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi duyệt");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) => 
      AttendanceService.rejectExplanation(id, note),
    onSuccess: (res) => {
      toast.success(res.message || "Đã từ chối giải trình");
      queryClient.invalidateQueries({ queryKey: ["admin", "attendance"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi từ chối");
    }
  });

  const handleOpenModal = (explanation: AttendanceExplanation, type: "APPROVE" | "REJECT") => {
    setSelectedExplanation(explanation);
    setActionType(type);
    setReviewNote("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedExplanation(null);
    setActionType(null);
    setReviewNote("");
  };

  const handleConfirmAction = () => {
    if (!selectedExplanation || !actionType) return;
    
    if (actionType === "APPROVE") {
      approveMutation.mutate({ id: selectedExplanation.id, note: reviewNote });
    } else {
      rejectMutation.mutate({ id: selectedExplanation.id, note: reviewNote });
    }
  };

  const columns = [
    { 
      header: "Nhân viên", 
      accessor: (item: AttendanceExplanation) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{item.employeeName || item.userName || "N/A"}</span>
          <span className="text-[10px] text-gray-400 font-medium">ID: {item.employeeId}</span>
        </div>
      )
    },
    { 
      header: "Loại giải trình", 
      accessor: (item: AttendanceExplanation) => {
        const typeValue = item.explanationType || (item.type as any);
        const typeConfig: any = {
          LATE: { label: "Đi muộn", color: "text-orange-600 bg-orange-50", icon: Clock },
          GPS_ERROR: { label: "Sai GPS", color: "text-blue-600 bg-blue-50", icon: MapPin },
          MISSING_CHECKOUT: { label: "Quên Checkout", color: "text-purple-600 bg-purple-50", icon: AlertCircle },
          OTHER: { label: "Khác", color: "text-gray-600 bg-gray-50", icon: FileText },
        };
        const config = typeConfig[typeValue] || typeConfig.OTHER;
        return (
          <Badge className={cn("px-3 py-1 rounded-full border-none flex items-center gap-1.5 w-fit", config.color)}>
            <config.icon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase">{config.label}</span>
          </Badge>
        );
      }
    },
    { 
      header: "Lý do nhân viên", 
      accessor: (item: AttendanceExplanation) => (
        <p className="max-w-[300px] text-sm text-gray-600 line-clamp-2 italic">
          "{item.reason}"
        </p>
      ),
      className: "w-1/3"
    },
    { 
      header: "Thời gian gửi", 
      accessor: (item: AttendanceExplanation) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-700">
            {format(new Date(item.createdAt), "HH:mm", { locale: vi })}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: vi })}
          </span>
        </div>
      )
    },
  ];

  const renderActions = (item: AttendanceExplanation) => (
    <div className="flex items-center justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="h-9 px-3 border-green-100 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-200 rounded-xl font-bold text-xs gap-1.5"
        onClick={() => handleOpenModal(item, "APPROVE")}
      >
        <Check className="w-3.5 h-3.5" />
        Duyệt
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-9 px-3 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-xl font-bold text-xs gap-1.5"
        onClick={() => handleOpenModal(item, "REJECT")}
      >
        <X className="w-3.5 h-3.5" />
        Từ chối
      </Button>
    </div>
  );

  const isPendingAction = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DataTable<AttendanceExplanation>
        title="Quản lý Giải trình"
        description="Phê duyệt hoặc từ chối các yêu cầu giải trình đi muộn/sai vị trí từ nhân viên."
        columns={columns}
        data={data?.data?.content || []}
        isLoading={isLoading}
        renderActions={renderActions}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-800">
              {actionType === "APPROVE" ? "Duyệt giải trình" : "Từ chối giải trình"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 font-medium">
              Xác nhận {actionType === "APPROVE" ? "phê duyệt" : "từ chối"} đơn của{" "}
              <span className="text-orange-500 font-bold">{selectedExplanation?.employeeName || selectedExplanation?.userName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reviewNote" className="text-sm font-bold text-gray-700 ml-1">
                Ghi chú của Admin (Tùy chọn)
              </Label>
              <Textarea
                id="reviewNote"
                placeholder="Nhập lý do hoặc lời nhắn cho nhân viên..."
                className="rounded-2xl border-gray-100 focus:ring-orange-500 focus:border-orange-500 min-h-[100px] resize-none"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="ghost" 
              className="rounded-xl font-bold text-gray-400 hover:text-gray-600"
              onClick={closeModal}
              disabled={isPendingAction}
            >
              Hủy bỏ
            </Button>
            <Button 
              className={cn(
                "rounded-xl font-bold px-6 shadow-lg active:scale-95 transition-all",
                actionType === "APPROVE" 
                  ? "bg-green-600 hover:bg-green-700 shadow-green-100" 
                  : "bg-red-600 hover:bg-red-700 shadow-red-100"
              )}
              onClick={handleConfirmAction}
              disabled={isPendingAction}
            >
              {isPendingAction ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : actionType === "APPROVE" ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Xác nhận {actionType === "APPROVE" ? "Duyệt" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
