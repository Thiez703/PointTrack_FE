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
import { format, isAfter } from "date-fns";
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
import { CheckinMap } from "@/components/maps/CheckinMap";

// ── Status badge ─────────────────────────────────────────────

const SHIFT_STATUS_CONFIG: Record<
  string,
  { label: string; cls: string; pulse?: boolean }
> = {
  SCHEDULED:   { label: "Chưa bắt đầu",    cls: "bg-gray-100 text-gray-600" },
  ASSIGNED:    { label: "Chưa bắt đầu",    cls: "bg-gray-100 text-gray-600" },
  CONFIRMED:   { label: "Chưa bắt đầu",    cls: "bg-gray-100 text-gray-600" },
  DRAFT:       { label: "Chờ xử lý",       cls: "bg-gray-100 text-gray-400" },
  PUBLISHED:   { label: "Chưa bắt đầu",    cls: "bg-gray-100 text-gray-600" },
  IN_PROGRESS: { label: "Đang làm việc",   cls: "bg-green-100 text-green-700", pulse: true },
  COMPLETED:   { label: "✅ Hoàn thành",   cls: "bg-blue-100 text-blue-700" },
  MISSING_OUT: { label: "Thiếu check-out", cls: "bg-orange-100 text-orange-700" },
  MISSED:      { label: "Vắng mặt",        cls: "bg-red-100 text-red-700" },
  ABSENT:      { label: "Vắng mặt",        cls: "bg-red-100 text-red-700" },
  CANCELLED:   { label: "Đã hủy",          cls: "bg-gray-100 text-gray-400" },
};

function ShiftStatusBadge({ status }: { status: string }) {
  const cfg = SHIFT_STATUS_CONFIG[status?.toUpperCase()] ?? {
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
  todayStr,
}: {
  shift: ShiftSchema;
  onCheckIn: () => void;
  onCheckOut: () => void;
  todayStr: string;
}) {
  const status = shift.status?.toUpperCase() ?? "";
  const isPast = shift.shiftDate < todayStr;
  // Allow overnight shifts: yesterday's ASSIGNED shifts can still be checked in
  const yesterdayDate = new Date(todayStr);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);
  const isOvernightAssigned = isPast && status === "ASSIGNED" && shift.shiftDate === yesterdayStr;
  const isCheckable = ["SCHEDULED", "ASSIGNED", "CONFIRMED", "PUBLISHED"].includes(status) && (!isPast || isOvernightAssigned);
  const isInProgress = status === "IN_PROGRESS";
  const isCompleted = status === "COMPLETED" || !!shift.checkOutTime;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-4 border shadow-sm",
        isInProgress
          ? "border-green-200 shadow-green-50"
          : isCompleted
          ? "border-blue-100"
          : "border-gray-100"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Time block */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0",
            isInProgress
              ? "bg-green-50 text-green-600"
              : isCompleted
              ? "bg-blue-50 text-blue-600"
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
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            {shift.startTime.slice(0, 5)} – {shift.endTime.slice(0, 5)}
          </p>
          {shift.notes && (
            <p className="text-[10px] text-gray-400 italic mt-0.5 truncate">{shift.notes}</p>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-3 pt-3 border-t border-gray-50">
        {isCompleted ? (
          <p className="text-center text-sm font-black text-blue-600">Đã hoàn thành ca</p>
        ) : isInProgress ? (
          <Button
            onClick={onCheckOut}
            className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-100"
          >
            CHECK-OUT
          </Button>
        ) : isCheckable ? (
          <Button
            onClick={onCheckIn}
            className="w-full h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-sm shadow-lg shadow-green-100"
          >
            CHECK-IN
          </Button>
        ) : (
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {SHIFT_STATUS_CONFIG[status]?.label ?? status}
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
    setCurrentDistance(null);
  };

  const closeAction = () => {
    setActionShift(null);
    clearPhoto();
    setGpsOutOfRangeMessage(null);
    setIsLateDialogOpen(false);
    setIsCheckOutLateDialogOpen(false);
  };

  // GPS
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locatingForAction, setLocatingForAction] = useState<ActionType | null>(null);
  const [gpsOutOfRangeMessage, setGpsOutOfRangeMessage] = useState<string | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const pendingGpsRef = useRef<{ lat: number; lng: number } | null>(null);

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
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
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

  const acquireGps = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("no_gps"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setGps(coords);
          pendingGpsRef.current = coords;
          resolve(coords);
        },
        () => reject(new Error("gps_denied")),
        { enableHighAccuracy: true, timeout: 10_000 }
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

  const handleCheckIn = async (reason?: string, coords?: { lat: number; lng: number }) => {
    if (!actionShift || !photoFile) return;
    setIsLateDialogOpen(false);
    setIsSubmitting(true);
    const { lat, lng } = coords ?? pendingGpsRef.current ?? gps!;
    try {
      const res = await AttendanceService.checkIn({
        workScheduleId: actionShift.id,
        lat,
        lng,
        photo: photoFile,
        note: reason,
        capturedAt: new Date().toISOString(),
      });
      checkInResultRef.current = res.data;
      setCheckInTimestamp(new Date());
      toast.success("Check-in thành công!");
      clearPhoto();
      closeAction();
      refetchShifts();
    } catch (err: any) {
      if (err.errorCode === "GPS_OUT_OF_RANGE") {
        setGpsOutOfRangeMessage(err.message || "Vị trí nằm ngoài phạm vi cho phép (50m).");
      } else {
        toast.error(err.message || "Check-in thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (reason?: string, coords?: { lat: number; lng: number }) => {
    if (!actionShift || !photoFile) return;
    const attendanceRecordId =
      checkInResultRef.current?.attendanceRecordId ??
      (actionShift as any).attendanceRecordId;
    if (!attendanceRecordId) {
      toast.error("Không tìm thấy ID chấm công. Vui lòng liên hệ admin.");
      return;
    }
    setIsCheckOutLateDialogOpen(false);
    setIsSubmitting(true);
    const { lat, lng } = coords ?? pendingGpsRef.current ?? gps!;
    try {
      const checkOutRes = await AttendanceService.checkOut({
        attendanceRecordId,
        lat,
        lng,
        photo: photoFile,
        checkOutReason: reason,
      });
      checkInResultRef.current = null;
      setCheckInTimestamp(null);
      clearPhoto();
      closeAction();
      refetchShifts();
      setCheckOutResult(checkOutRes.data);
    } catch (err: any) {
      if (err.errorCode === "GPS_OUT_OF_RANGE") {
        setGpsOutOfRangeMessage(err.message || "Vị trí nằm ngoài phạm vi cho phép (50m).");
      } else {
        toast.error(err.message || "Check-out thất bại");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmPress = async () => {
    if (!actionShift || !photoFile) {
      toast.error("Vui lòng chụp ảnh selfie trước");
      return;
    }

    let freshCoords: { lat: number; lng: number };
    try {
      setLocatingForAction(actionType);
      freshCoords = await acquireGps();
    } catch {
      toast.error("Vui lòng bật GPS để chấm công");
      return;
    } finally {
      setLocatingForAction(null);
    }

    if (actionType === "checkin") {
      const [h, m] = actionShift.startTime.split(":").map(Number);
      const shiftStart = new Date();
      shiftStart.setHours(h, m, 0, 0);
      if (isAfter(currentTime, shiftStart)) {
        setIsLateDialogOpen(true);
      } else {
        handleCheckIn(undefined, freshCoords);
      }
    } else {
      if (!canCheckOut) {
        toast.error(`Vui lòng chờ ${countdown} giây để có thể Check-out`);
        return;
      }
      const [h, m] = actionShift.endTime.split(":").map(Number);
      const shiftEnd = new Date(actionShift.shiftDate);
      shiftEnd.setHours(h, m, 0, 0);
      if (isAfter(currentTime, new Date(shiftEnd.getTime() + 30 * 60_000))) {
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
          const todayStr = format(currentTime, "yyyy-MM-dd");
          return todayShifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              todayStr={todayStr}
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
            {/* Map */}
            {actionShift && (
              <div className="rounded-2xl overflow-hidden">
                <CheckinMap
                  customerLat={actionShift.customerLatitude}
                  customerLng={actionShift.customerLongitude}
                  employeeLat={gps?.lat ?? null}
                  employeeLng={gps?.lng ?? null}
                  onDistanceChange={setCurrentDistance}
                />
              </div>
            )}

            {/* GPS status */}
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                gpsLoading ? "bg-gray-50" : gps ? "bg-green-50" : "bg-red-50"
              )}
            >
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
                {currentDistance !== null && (
                  <p
                    className={cn(
                      "text-[10px] font-bold mt-0.5",
                      currentDistance <= 50 ? "text-green-600" : "text-red-500"
                    )}
                  >
                    Cách {currentDistance}m{" "}
                    {currentDistance <= 50 ? "✓ Trong phạm vi" : "✗ Ngoài phạm vi"}
                  </p>
                )}
              </div>
              {gps && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
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

      {/* ── GPS out-of-range modal (non-dismissible) ── */}
      <Dialog open={!!gpsOutOfRangeMessage} onOpenChange={() => {}}>
        <DialogContent
          className="sm:max-w-[400px] rounded-[32px] p-0 border-none overflow-hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="bg-red-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Ngoài phạm vi GPS
            </DialogTitle>
            <DialogDescription className="text-red-100 text-sm mt-3 font-medium leading-relaxed">
              {gpsOutOfRangeMessage}
            </DialogDescription>
          </div>
          <div className="p-6">
            <p className="text-xs text-gray-500 text-center mb-4 font-medium">
              Di chuyển lại gần địa điểm khách hàng (trong vòng 50m) rồi thử lại.
            </p>
            <Button
              onClick={() => setGpsOutOfRangeMessage(null)}
              className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-lg shadow-red-100"
            >
              Thử lại
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
