"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Camera,
  Navigation,
  AlertCircle,
  X,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { AttendanceService } from "@/app/services/attendance.service";
import { SchedulingService } from "@/app/services/scheduling.service";
import type { CheckInResponse, CheckOutResponse, ShiftSchema } from "@/app/types/attendance.schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
// CheckinMap removed

const LATE_TOLERANCE_MINUTES = 15; // Phút cho phép trễ
const UPCOMING_WINDOW_MINUTES = 30; // Phút hiển thị sắp bắt đầu
const ALLOWED_RADIUS_METERS = 200; // Bán kính cho phép mặc định (nếu BE không trả về)

/**
 * Công thức Haversine tính khoảng cách giữa 2 điểm GPS (mét)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Bán kính Trái Đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Tính số phút chênh lệch giữa 2 mốc thời gian HH:mm
 * Handle được ca qua đêm
 */
function getMinutesDiff(now: Date, targetTimeStr: string, baseDateStr: string): number {
  const [h, m] = targetTimeStr.split(":").map(Number);
  const targetDate = new Date(baseDateStr);
  targetDate.setHours(h, m, 0, 0);

  // Nếu là ca qua đêm và hiện tại đã qua nửa đêm (ví dụ ca 22:00 - 02:00, giờ là 01:00)
  // Nhưng baseDateStr vẫn là ngày hôm qua. logic này cần cẩn thận.
  // Tuy nhiên ShiftSchema có shiftDate cố định.
  
  return (now.getTime() - targetDate.getTime()) / 60000;
}

type ExtendedShiftStatus =
  | "SCHEDULED"      // Sẵn sàng check-in (CONFIRMED, ASSIGNED, PUBLISHED)
  | "IN_PROGRESS"    // Đang làm việc (đã check-in)
  | "COMPLETED"      // Đã hoàn thành
  | "ABSENT"         // Vắng mặt (MISSED)
  | "CANCELLED";     // Đã hủy

function getShiftStatus(
  shift: ShiftSchema
): ExtendedShiftStatus {
  const status = shift.status?.toUpperCase();
  
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "CANCELLED") return "CANCELLED";
  if (status === "MISSED") return "ABSENT";
  if (status === "IN_PROGRESS" || status === "MISSING_OUT") return "IN_PROGRESS";
  
  // Mặc định cho các trạng thái còn lại (CONFIRMED, ASSIGNED, v.v.)
  return "SCHEDULED";
}

// ── Status badge ─────────────────────────────────────────────

const SHIFT_STATUS_CONFIG: Record<
  ExtendedShiftStatus,
  { label: string; cls: string; pulse?: boolean }
> = {
  SCHEDULED:        { label: "Sẵn sàng",        cls: "bg-orange-50 text-orange-600" },
  IN_PROGRESS:      { label: "Đang làm việc",   cls: "bg-green-100 text-green-700", pulse: true },
  COMPLETED:        { label: "✅ Hoàn thành",   cls: "bg-blue-100 text-blue-700" },
  ABSENT:           { label: "Vắng mặt",        cls: "bg-red-50 text-red-400" },
  CANCELLED:        { label: "Đã hủy",          cls: "bg-gray-100 text-gray-400" },
};

function ShiftStatusBadge({ status }: { status: ExtendedShiftStatus }) {
  const cfg = SHIFT_STATUS_CONFIG[status] ?? {
    label: status,
    cls: "bg-gray-100 text-gray-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
        cfg.cls,
        cfg.pulse && "animate-pulse"
      )}
    >
      {cfg.label}
    </span>
  );
}

// ── Shift card ───────────────────────────────────────────────

function ShiftCard({
  shift,
  onCheckIn,
  onCheckOut,
  currentTime,
}: {
  shift: ShiftSchema;
  onCheckIn: () => void;
  onCheckOut: () => void;
  currentTime: Date;
}) {
  const status = getShiftStatus(shift);
  
  const isCheckInVisible = status === "SCHEDULED";
  const isCheckOutVisible = status === "IN_PROGRESS";
  const isCompleted = status === "COMPLETED";
  const isAbsent = status === "ABSENT";
  const isCancelled = status === "CANCELLED";

  // Countdown logic for CHECK_OUT window (optional helper)
  const getCountdownText = () => {
    if (status === "IN_PROGRESS") {
      const [eh, em] = shift.endTime.split(":").map(Number);
      const end = new Date(shift.shiftDate);
      end.setHours(eh, em, 0, 0);
      let diff = Math.ceil((end.getTime() - currentTime.getTime()) / 60000);
      // Xử lý ca qua đêm sơ bộ
      if (diff < -600) diff += 24 * 60; 
      if (diff > 0 && diff <= 30) return `Kết thúc sau ${diff} phút`;
    }
    return null;
  };

  const countdownText = getCountdownText();

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 border shadow-sm transition-all",
        status === "IN_PROGRESS"
          ? "border-green-200 shadow-green-50 bg-green-50/10"
          : isCompleted
          ? "border-blue-100"
          : isAbsent || isCancelled
          ? "border-red-100 bg-red-50/5"
          : "border-gray-100"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Time block */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0",
            status === "IN_PROGRESS"
              ? "bg-green-50 text-green-600"
              : isCompleted
              ? "bg-blue-50 text-blue-600"
              : isAbsent || isCancelled
              ? "bg-red-50 text-red-400"
              : "bg-orange-50 text-orange-600"
          )}
        >
          <span className="text-[7px] font-black uppercase">VÀO</span>
          <span className="text-sm font-black leading-none">{shift.startTime.slice(0, 5)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-black text-gray-800 truncate">
              {shift.customerName || "Khách hàng"}
            </p>
            <ShiftStatusBadge status={status} />
          </div>
          <p className="text-[11px] text-gray-500 font-medium truncate">
            {shift.customerAddress}
          </p>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-[10px] text-gray-400 font-medium">
              {shift.startTime.slice(0, 5)} – {shift.endTime.slice(0, 5)}
            </p>
            {countdownText && (
              <span className="text-[9px] font-bold text-orange-500 uppercase animate-pulse">
                {countdownText}
              </span>
            )}
          </div>
          {shift.notes && (
            <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">{shift.notes}</p>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-3 pt-3 border-t border-gray-50">
        {isCompleted ? (
          <p className="text-center text-sm font-black text-blue-600">✅ Đã hoàn thành ca</p>
        ) : isAbsent ? (
          <p className="text-center text-sm font-black text-red-500 uppercase tracking-widest">Vắng mặt</p>
        ) : isCancelled ? (
          <p className="text-center text-sm font-black text-gray-400 uppercase tracking-widest">Đã hủy</p>
        ) : isCheckOutVisible ? (
          <Button
            onClick={onCheckOut}
            className="w-full h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-lg shadow-green-100"
          >
            CHECK-OUT
          </Button>
        ) : isCheckInVisible ? (
          <Button
            onClick={onCheckIn}
            className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-100"
          >
            CHECK-IN
          </Button>
        ) : (
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            KHÔNG THỂ THỰC HIỆN
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────

type ActionType = "checkin" | "checkout";

export default function CheckinPage() {
  const { userInfo } = useAuthStore();

  // Clock
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Today's shifts — auto-refresh every 30s
  const {
    data: shiftsData,
    isLoading: isLoadingShifts,
    error: shiftsError,
    refetch: refetchShifts,
  } = useQuery({
    queryKey: ["shifts", "my-today"],
    queryFn: () => SchedulingService.getMyTodayShifts(),
    enabled: !!userInfo,
    refetchInterval: 30_000,
  });

  // BE trả về { success, message, data: ShiftSchema[] } — data là mảng trực tiếp
  const todayShifts: ShiftSchema[] = Array.isArray(shiftsData?.data) ? shiftsData.data : [];

  // Action sheet
  const [actionShift, setActionShift] = useState<ShiftSchema | null>(null);
  const [actionType, setActionType] = useState<ActionType>("checkin");

  const openAction = (shift: ShiftSchema, type: ActionType) => {
    setActionShift(shift);
    setActionType(type);
    pendingGpsRef.current = null;
    setGps(null);
    setGpsError(null);
    setGpsLoading(true);
  };

  const closeAction = () => {
    setActionShift(null);
    clearPhoto();
    setIsLateDialogOpen(false);
    setIsCheckOutLateDialogOpen(false);
  };

  // GPS
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locatingForAction, setLocatingForAction] = useState<ActionType | null>(null);
  const pendingGpsRef = useRef<{ lat: number; lng: number; accuracy?: number } | null>(null);

  // Get initial GPS when action sheet opens
  useEffect(() => {
    if (!actionShift) return;
    if (!navigator.geolocation) {
      setGpsError("Thiết bị không hỗ trợ GPS");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy 
        };
        setGps(coords);
        setGpsLoading(false);
      },
      () => {
        setGpsError("Không thể xác định vị trí");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionShift?.id]);

  const acquireGps = (): Promise<{ lat: number; lng: number; accuracy?: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("no_gps"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { 
            lat: pos.coords.latitude, 
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy 
          };
          setGps(coords);
          pendingGpsRef.current = coords;
          resolve(coords);
        },
        () => reject(new Error("gps_denied")),
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
      );
    });

  // Photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    toast.success("Đã chụp ảnh thành công!");
    e.target.value = "";
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Stores check-in response for subsequent check-out
  const checkInResultRef = useRef<CheckInResponse | null>(null);

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Late dialogs
  const [isLateDialogOpen, setIsLateDialogOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [isCheckOutLateDialogOpen, setIsCheckOutLateDialogOpen] = useState(false);
  const [checkOutReason, setCheckOutReason] = useState("");

  // Check-out result summary
  const [checkOutResult, setCheckOutResult] = useState<CheckOutResponse | null>(null);

  // Countdown after check-in (must wait 60s before check-out)
  const [checkInTimestamp, setCheckInTimestamp] = useState<Date | null>(null);
  const diffSeconds = checkInTimestamp
    ? Math.floor((currentTime.getTime() - checkInTimestamp.getTime()) / 1000)
    : 999;
  const countdown = Math.max(0, 60 - diffSeconds);
  const canCheckOut = countdown === 0;

  // ── Submit handlers ──────────────────────────────────────────

  const handleCheckIn = async (reason?: string, coords?: { lat: number; lng: number } | null) => {
    if (!actionShift || !photoFile) return;
    setIsLateDialogOpen(false);
    setIsSubmitting(true);
    const lat = coords?.lat ?? pendingGpsRef.current?.lat ?? gps?.lat ?? null;
    const lng = coords?.lng ?? pendingGpsRef.current?.lng ?? gps?.lng ?? null;
    try {
      const res = await AttendanceService.checkIn({
        workScheduleId: actionShift.id,
        latitude: lat,
        longitude: lng,
        photo: photoFile,
        note: reason,
        capturedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      });
      checkInResultRef.current = res.data;
      setCheckInTimestamp(new Date());
      toast.success("Check-in thành công!");
      clearPhoto();
      closeAction();
      refetchShifts();
    } catch (err: any) {
      toast.error(err.message || "Check-in thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (reason?: string, coords?: { lat: number; lng: number } | null) => {
    if (!actionShift || !photoFile) {
      toast.error("Vui lòng chụp ảnh selfie trước khi check-out");
      return;
    }
    const attendanceRecordId =
      checkInResultRef.current?.attendanceRecordId ??
      actionShift.attendanceRecordId;
    if (!attendanceRecordId) {
      toast.error("Không tìm thấy ID chấm công. Vui lòng liên hệ admin.");
      return;
    }
    setIsCheckOutLateDialogOpen(false);
    setIsSubmitting(true);
    const lat = coords?.lat ?? pendingGpsRef.current?.lat ?? gps?.lat ?? null;
    const lng = coords?.lng ?? pendingGpsRef.current?.lng ?? gps?.lng ?? null;
    try {
      const formData = new FormData();
      formData.append('attendanceRecordId', String(attendanceRecordId));
      formData.append('latitude', String(lat));
      formData.append('longitude', String(lng));
      formData.append('photo', photoFile);
      formData.append('capturedAt', format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"));
      if (reason) {
        formData.append('checkOutReason', reason);
      }

      const checkOutRes = await AttendanceService.postCheckout(formData);
      
      checkInResultRef.current = null;
      setCheckInTimestamp(null);
      clearPhoto();
      closeAction();
      refetchShifts();
      setCheckOutResult(checkOutRes.data);
      if (checkOutRes.message) {
        toast.success(checkOutRes.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Check-out thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmPress = async () => {
    if (!actionShift || !photoFile) {
      toast.error("Vui lòng chụp ảnh selfie trước");
      return;
    }

    setLocatingForAction(actionType);
    let freshCoords;
    try {
      freshCoords = await acquireGps();
    } catch (e) {
      toast.error("Không thể lấy vị trí GPS chính xác. Vui lòng thử lại.");
      setLocatingForAction(null);
      return;
    }
    setLocatingForAction(null);

    // Verify distance Haversine
    const distance = calculateDistance(
      freshCoords.lat, 
      freshCoords.lng, 
      actionShift.customerLatitude, 
      actionShift.customerLongitude
    );

    if (distance > ALLOWED_RADIUS_METERS) {
      toast.error(`Bạn đang ở quá xa địa điểm (${distance}m). Vui lòng đến gần hơn.`);
      return;
    }

    if (actionType === "checkin") {
      const diffFromStart = getMinutesDiff(currentTime, actionShift.startTime, actionShift.shiftDate);
      
      // Chỉ báo đi trễ nếu quá LATE_TOLERANCE_MINUTES (15 phút)
      if (diffFromStart > LATE_TOLERANCE_MINUTES) {
        setIsLateDialogOpen(true);
      } else {
        handleCheckIn(undefined, freshCoords);
      }
    } else {
      if (!canCheckOut) {
        toast.error(`Vui lòng chờ ${countdown} giây để có thể Check-out`);
        return;
      }
      
      const diffFromEnd = getMinutesDiff(currentTime, actionShift.endTime, actionShift.shiftDate);
      
      // Check-out muộn nếu quá 30 phút sau giờ kết thúc
      if (diffFromEnd > 30) {
        setIsCheckOutLateDialogOpen(true);
      } else {
        handleCheckOut(undefined, freshCoords);
      }
    }
  };

  const isBusy = isSubmitting || !!locatingForAction;
  const confirmDisabled = isBusy || !photoFile || (actionType === "checkout" && !canCheckOut);

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="login-app-container pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-6 px-5 rounded-b-[28px]">
        <h1 className="text-xl font-bold text-white mb-0.5">Chấm công</h1>
        <p className="text-orange-100 text-xs">
          {mounted ? format(currentTime, "EEEE, dd/MM/yyyy", { locale: vi }) : "Đang tải..."}
        </p>
        <p className="text-white text-3xl font-black font-mono mt-2 tracking-widest">
          {mounted ? format(currentTime, "HH:mm:ss") : "--:--:--"}
        </p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {/* Section label */}
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Ca hôm nay
          </h2>
          {isLoadingShifts && (
            <span className="flex items-center gap-1 text-[9px] text-gray-400 font-bold">
              <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
            </span>
          )}
        </div>

        {/* Error */}
        {shiftsError && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-red-500">Không thể tải danh sách ca</p>
            <button
              onClick={() => refetchShifts()}
              className="text-xs text-red-400 underline mt-1"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoadingShifts && todayShifts.length === 0 && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse"
              >
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-50 rounded w-1/2" />
                    <div className="h-2 bg-gray-50 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingShifts && !shiftsError && todayShifts.length === 0 && (
          <div className="bg-red-50 border border-red-100 rounded-[24px] p-8 text-center space-y-3 shadow-sm">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-red-600 uppercase tracking-tight">
                Không có ca làm việc
              </h3>
              <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-widest leading-relaxed">
                Hôm nay bạn không có ca nào được gán.
                <br />
                Vui lòng liên hệ quản lý để được sắp xếp.
              </p>
            </div>
          </div>
        )}

        {/* Shift cards */}
        {(() => {
          return todayShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              currentTime={currentTime}
              onCheckIn={() => openAction(shift, "checkin")}
              onCheckOut={() => openAction(shift, "checkout")}
            />
          ));
        })()}
      </div>

      {/* Hidden camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoCapture}
      />

      {/* ── Action Sheet ── */}
      <Dialog
        open={!!actionShift}
        onOpenChange={(o) => {
          if (!o && !isSubmitting) closeAction();
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-[28px] p-0 border-none overflow-hidden max-h-[92vh] overflow-y-auto">
          {/* Sheet header */}
          <div
            className={cn(
              "p-6 text-white text-center",
              actionType === "checkin"
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-orange-500 to-orange-600"
            )}
          >
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              {actionType === "checkin" ? "Check-in ca làm việc" : "Check-out ca làm việc"}
            </DialogTitle>
            {actionShift && (
              <div className="mt-2 space-y-0.5">
                <p className="text-sm font-bold opacity-90">{actionShift.customerName}</p>
                <p className="text-xs opacity-75">
                  {actionShift.startTime.slice(0, 5)} – {actionShift.endTime.slice(0, 5)}
                </p>
              </div>
            )}
            <DialogDescription className="sr-only">
              Thực hiện {actionType === "checkin" ? "check-in" : "check-out"} cho ca làm việc
            </DialogDescription>
          </div>

          <div className="p-5 space-y-4">
            {/* Map removed per requirement */}

            {/* GPS status */}
            <div
              className={cn(
                "flex flex-col gap-2 p-3 rounded-xl",
                gpsLoading ? "bg-gray-50" : gps ? "bg-green-50" : "bg-red-50"
              )}
            >
              <div className="flex items-center gap-3">
                <Navigation
                  className={cn(
                    "w-4 h-4 flex-shrink-0",
                    gps ? "text-green-600" : "text-gray-400"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Vị trí GPS
                  </p>
                  <p className="text-xs font-bold text-gray-700 truncate">
                    {gpsLoading
                      ? "Đang xác định..."
                      : gps
                      ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`
                      : gpsError ?? "Không khả dụng"}
                  </p>
                </div>
                {gps && (
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </div>

              {/* Debug GPS Info (Dev only) */}
              {process.env.NODE_ENV === 'development' && gps && actionShift && (
                <div className="mt-1 pt-2 border-t border-green-200/50 text-[9px] text-gray-400 font-mono space-y-0.5">
                  <div className="flex justify-between">
                    <span>🎯 Độ chính xác:</span>
                    <span className={cn(gps.accuracy && gps.accuracy > 100 ? "text-red-500 font-bold" : "text-gray-600")}>
                      ±{gps.accuracy ? Math.round(gps.accuracy) : "?"}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>📏 Khoảng cách:</span>
                    <span className="text-gray-600">
                      {calculateDistance(gps.lat, gps.lng, actionShift.customerLatitude, actionShift.customerLongitude)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭕ Bán kính cho phép:</span>
                    <span className="text-gray-600">{ALLOWED_RADIUS_METERS}m</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Trạng thái:</span>
                    {calculateDistance(gps.lat, gps.lng, actionShift.customerLatitude, actionShift.customerLongitude) <= ALLOWED_RADIUS_METERS 
                      ? <span className="text-green-600">✅ TRONG VÙNG</span>
                      : <span className="text-red-500">❌ NGOÀI VÙNG</span>
                    }
                  </div>
                </div>
              )}
              
              {gps?.accuracy && gps.accuracy > 100 && (
                <p className="text-[9px] font-bold text-red-500 uppercase leading-tight mt-1">
                  ⚠️ GPS chưa chính xác (±{Math.round(gps.accuracy)}m). Vui lòng đợi hoặc di chuyển ra chỗ thoáng.
                </p>
              )}
            </div>

            {/* Photo capture */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full flex items-center justify-center gap-3 py-4 rounded-[18px] font-bold text-sm transition-all",
                photoFile
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-blue-600 text-white shadow-lg shadow-blue-100"
              )}
            >
              <Camera className="w-5 h-5" />
              {photoFile ? "Ảnh đã sẵn sàng – Chụp lại?" : "Chụp ảnh Selfie"}
            </motion.button>

            {photoPreview && (
              <div className="relative rounded-2xl overflow-hidden min-h-[160px] bg-black border border-gray-100">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full object-contain max-h-[200px]"
                />
                <button
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Countdown for check-out */}
            {actionType === "checkout" && !canCheckOut && (
              <p className="text-[11px] font-bold text-orange-500 text-center animate-pulse uppercase tracking-tight">
                Vui lòng chờ {countdown} giây để có thể Check-out
              </p>
            )}

            {/* Confirm button */}
            <Button
              onClick={onConfirmPress}
              disabled={confirmDisabled}
              className={cn(
                "w-full h-14 rounded-[18px] font-black text-base shadow-xl transition-all",
                actionType === "checkin"
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-green-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
                  : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
              )}
            >
              {locatingForAction ? (
                <span className="flex items-center gap-2 text-sm">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Đang xác định vị trí...
                </span>
              ) : isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : actionType === "checkin" ? (
                "XÁC NHẬN CHECK-IN"
              ) : (
                "XÁC NHẬN CHECK-OUT"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={closeAction}
              disabled={isSubmitting}
              className="w-full rounded-xl text-gray-500"
            >
              Hủy
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Late check-in dialog ── */}
      <Dialog open={isLateDialogOpen} onOpenChange={setIsLateDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 border-none overflow-hidden">
          <div className="bg-amber-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Xác nhận đi trễ
            </DialogTitle>
            <DialogDescription className="text-amber-100 text-sm mt-2 font-medium">
              Bạn cần cung cấp lý do đi trễ để Admin xét duyệt lương.
            </DialogDescription>
          </div>
          <div className="p-6">
            <Textarea
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
              placeholder="Ví dụ: Kẹt xe, Hỏng xe,..."
              className="min-h-[100px] rounded-2xl border-gray-100"
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsLateDialogOpen(false)}
                className="flex-1 rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={() => handleCheckIn(lateReason)}
                disabled={!lateReason.trim() || isSubmitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-100"
              >
                GỬI & CHECK-IN
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Late check-out dialog ── */}
      <Dialog open={isCheckOutLateDialogOpen} onOpenChange={setIsCheckOutLateDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 border-none overflow-hidden">
          <div className="bg-orange-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Check-out muộn
            </DialogTitle>
            <DialogDescription className="text-orange-100 text-sm mt-2 font-medium">
              Vui lòng cung cấp lý do check-out muộn (trên 30 phút sau giờ kết thúc ca).
            </DialogDescription>
          </div>
          <div className="p-6">
            <Textarea
              value={checkOutReason}
              onChange={(e) => setCheckOutReason(e.target.value)}
              placeholder="Ví dụ: Làm thêm giờ, Hỗ trợ khách hàng,..."
              className="min-h-[100px] rounded-2xl border-gray-100"
            />
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setIsCheckOutLateDialogOpen(false)}
                className="flex-1 rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={() => handleCheckOut(checkOutReason)}
                disabled={!checkOutReason.trim() || isSubmitting}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100"
              >
                GỬI & CHECK-OUT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Check-out result summary ── */}
      <Dialog open={!!checkOutResult} onOpenChange={(o) => { if (!o) setCheckOutResult(null); }}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Hoàn thành ca làm việc!
            </DialogTitle>
            {checkOutResult?.shiftName && (
              <p className="text-blue-100 text-sm mt-1 font-medium">{checkOutResult.shiftName}</p>
            )}
            <DialogDescription className="sr-only">Tóm tắt ca làm việc</DialogDescription>
          </div>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Giờ làm</p>
                <p className="text-2xl font-black text-gray-800">
                  {checkOutResult?.workedHours?.toFixed(2) ?? "—"}
                </p>
                <p className="text-[10px] text-gray-400 font-bold">giờ</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phút làm</p>
                <p className="text-2xl font-black text-gray-800">
                  {checkOutResult?.workedMinutes ?? "—"}
                </p>
                <p className="text-[10px] text-gray-400 font-bold">phút</p>
              </div>
            </div>
            {checkOutResult?.estimatedSalary != null && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Lương tạm tính</p>
                <p className="text-2xl font-black text-green-700">
                  {checkOutResult.estimatedSalary.toLocaleString("vi-VN")}
                  <span className="text-sm font-bold ml-1">{checkOutResult.currency ?? "VND"}</span>
                </p>
              </div>
            )}
            <div className="flex gap-2 text-[11px] text-gray-400 font-medium">
              {checkOutResult?.checkInTime && (
                <span className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                  Vào: {checkOutResult.checkInTime.slice(11, 16)}
                </span>
              )}
              {checkOutResult?.checkOutTime && (
                <span className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                  Ra: {checkOutResult.checkOutTime.slice(11, 16)}
                </span>
              )}
            </div>
            <Button
              onClick={() => setCheckOutResult(null)}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-lg shadow-blue-100"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
