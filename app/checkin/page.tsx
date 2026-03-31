"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Camera,
  Navigation,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { AttendanceService } from "@/app/services/attendance.service";
import { SchedulingService } from "@/app/services/scheduling.service";
import { FileService } from "@/app/services/file.service";
import type {
  CheckInResponse,
  CheckOutResponse,
  ShiftSchema,
} from "@/app/types/attendance.schema";
import { format, isAfter } from "date-fns";
import { vi } from "date-fns/locale";
import { formatToISODate, getWeekYearString } from "@/lib/dateUtils";
import { useAuthStore } from "@/stores/useAuthStore";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AttendanceStatus = "ON_TIME" | "LATE" | "PENDING_APPROVAL";

const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; textColor: string; bgColor: string; icon: string }
> = {
  ON_TIME: {
    label: "Đúng giờ",
    textColor: "text-green-700",
    bgColor: "bg-green-100",
    icon: "✅",
  },
  LATE: {
    label: "Đi muộn",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: "🟡",
  },
  PENDING_APPROVAL: {
    label: "Chờ Admin duyệt GPS",
    textColor: "text-red-700",
    bgColor: "bg-red-100",
    icon: "🔴",
  },
};

const STORAGE_KEY = "pt_attendance_today";

export default function CheckinPage() {
  const { userInfo } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS state
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(false);
  const [activeShiftId, setActiveShiftId] = useState<number | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
  const [checkOutResult, setCheckOutResult] = useState<CheckOutResponse | null>(null);

  // Late handling
  const [isLateDialogOpen, setIsLateDialogOpen] = useState(false);
  const [lateReason, setLateReason] = useState("");
  const [isCheckOutLateDialogOpen, setIsCheckOutLateDialogOpen] = useState(false);
  const [checkOutReason, setCheckOutReason] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const userId = userInfo?.userId || userInfo?.id;

  const { data: shiftsData, isLoading: isFindingShift } = useQuery({
    queryKey: ["shifts", "today", userId],
    queryFn: () =>
      SchedulingService.getShifts({
        employeeId: userId,
        startDate: formatToISODate(new Date()),
        endDate: formatToISODate(new Date()),
      }),
    enabled: !!userId,
  });

  const todayShifts = shiftsData?.data?.content ?? [];
  const todayShift = todayShifts.find(s =>
    ['ASSIGNED', 'CONFIRMED', 'IN_PROGRESS'].includes(s.status)
  ) || null;

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Restore state
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString() && parsed.checkedIn) {
          setCheckedIn(true);
          setActiveShiftId(parsed.shiftId);
          setCheckInResult(parsed.checkInResult);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    requestGps();
  }, [mounted]);

  const requestGps = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError("Thiết bị không hỗ trợ GPS");
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.code === 1 ? "Vui lòng cấp quyền GPS" : "Không thể lấy vị trí");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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

  const onCheckInPress = () => {
    if (!todayShift) return;
    if (!gps) { toast.error("Chưa xác định được vị trí GPS"); return; }
    if (!photoFile) { toast.error("Vui lòng chụp ảnh selfie trước khi check-in"); return; }

    const [hours, minutes] = todayShift.startTime.split(':').map(Number);
    const shiftStartTime = new Date();
    shiftStartTime.setHours(hours, minutes, 0, 0);

    if (isAfter(currentTime, shiftStartTime)) {
      setIsLateDialogOpen(true);
    } else {
      handleCheckIn();
    }
  };

  const handleCheckIn = async (reason?: string) => {
    if (!todayShift) return;
    setIsLoading(true);
    setIsLateDialogOpen(false);
    
    try {
      const result = await AttendanceService.checkIn({
        workScheduleId: todayShift.id,
        lat: gps!.lat,
        lng: gps!.lng,
        photo: photoFile,
        note: reason,
        capturedAt: new Date().toISOString()
      });

      const rd = result.data;
      setCheckInResult(rd);
      setCheckedIn(true);
      setActiveShiftId(todayShift.id);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        date: new Date().toDateString(),
        checkedIn: true,
        shiftId: todayShift.id,
        checkInResult: rd,
      }));

      const msgs: Record<AttendanceStatus, string> = {
        ON_TIME: "Check-in thành công! Bạn đúng giờ ✅",
        LATE: `Check-in muộn ${rd.lateMinutes} phút. Lương sẽ được tính sau khi Admin duyệt.`,
        PENDING_APPROVAL: "GPS không hợp lệ. Đã gửi yêu cầu chờ Admin duyệt.",
      };
      toast.success(msgs[rd.status]);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Check-in thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const onCheckOutPress = () => {
    if (!todayShift) return;
    if (!gps) { toast.error("Chưa xác định được vị trí GPS"); return; }
    if (!photoFile) { toast.error("Vui lòng chụp ảnh selfie trước khi check-out"); return; }

    const [hours, minutes] = todayShift.endTime.split(':').map(Number);
    const shiftEndTime = new Date();
    shiftEndTime.setHours(hours, minutes, 0, 0);
    // Bắt buộc truyền nếu checkout muộn hơn 30 phút so với giờ kết thúc ca
    const lateThreshold = new Date(shiftEndTime.getTime() + 30 * 60000);

    if (isAfter(currentTime, lateThreshold)) {
      setIsCheckOutLateDialogOpen(true);
    } else {
      handleCheckOut();
    }
  };

  const handleCheckOut = async (reason?: string) => {
    if (!checkInResult || !gps || !photoFile) return;
    setIsLoading(true);
    setIsCheckOutLateDialogOpen(false);
    try {
      const result = await AttendanceService.checkOut({
        attendanceRecordId: checkInResult.attendanceRecordId,
        lat: gps.lat,
        lng: gps.lng,
        photo: photoFile,
        capturedAt: new Date().toISOString(),
        checkOutReason: reason
      });

      setCheckOutResult(result.data);
      setCheckedIn(false);
      clearPhoto();
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Check-out thành công!");
    } catch (err: any) {
      toast.error("Check-out thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const isCheckInDisabled = !todayShift || checkedIn || isLoading || !gps || !photoFile;
  const isCheckOutDisabled = !checkedIn || isLoading || !gps || !photoFile;
  const statusCfg = checkInResult ? STATUS_CONFIG[checkInResult.status] : null;

  return (
    <div className="login-app-container pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-5 px-5 rounded-b-[28px]">
        <h1 className="text-xl font-bold text-white mb-1">Chấm công</h1>
        <p className="text-orange-100 text-xs">
          {mounted ? format(currentTime, 'EEEE, dd/MM/yyyy', { locale: vi }) : "Đang tải..."}
        </p>
      </div>

      <div className="px-5 mt-4">
        {/* Today's Shift Card */}
        <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ca làm hôm nay</h2>
            {isFindingShift ? (
               <span className="text-[9px] font-bold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full uppercase animate-pulse">Đang tải...</span>
            ) : todayShift ? (
              <span className="text-[9px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full uppercase">Đã gán ca</span>
            ) : (
              <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-widest">Không có ca</span>
            )}
          </div>

          {isFindingShift ? (
            <div className="flex items-center gap-4 animate-pulse">
               <div className="w-12 h-12 rounded-2xl bg-gray-100" />
               <div className="w-4 h-4 bg-gray-50" />
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-gray-100 rounded w-3/4" />
                 <div className="h-3 bg-gray-50 rounded w-1/2" />
               </div>
            </div>
          ) : todayShift ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex flex-col items-center justify-center text-orange-600">
                <span className="text-[8px] font-black uppercase">VÀO</span>
                <span className="text-sm font-black">{todayShift.startTime.slice(0, 5)}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300" />
              <div className="flex-1">
                <p className="text-sm font-black text-gray-800 line-clamp-1">{todayShift.customerName || "Khách hàng lẻ"}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-0.5 line-clamp-1">{todayShift.customerAddress || "Địa chỉ khách hàng"}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate mt-1 italic">{todayShift.notes || "Hết sức cẩn thận"}</p>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-sm font-bold text-gray-400 italic">Bạn không có ca làm việc hôm nay</p>
            </div>
          )}
        </div>

        {/* GPS Status */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", gps ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
                    <Navigation className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Vị trí hiện tại</p>
                    <p className="text-[10px] font-bold text-gray-400">
                        {gpsLoading ? "Đang xác định..." : gps ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}` : gpsError}
                    </p>
                </div>
            </div>
            {gps && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
        </div>

        {/* Clock */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center mb-4">
          <p className="text-4xl font-black text-gray-800 tracking-wider font-mono">
            {mounted ? format(currentTime, 'HH:mm:ss') : "--:--:--"}
          </p>
          {statusCfg && (
            <div className={cn("mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full", statusCfg.bgColor)}>
              <span className={cn("text-xs font-black uppercase tracking-widest", statusCfg.textColor)}>
                {statusCfg.label}
              </span>
            </div>
          )}
        </div>

        {/* Photo Section */}
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
        
        <div className="space-y-4">
            {!todayShift && !isFindingShift ? (
              <div className="bg-red-50 border border-red-100 rounded-[24px] p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Calendar className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-red-600 uppercase tracking-tight">Không có ca làm việc</h3>
                  <p className="text-xs font-bold text-red-400 mt-1 uppercase tracking-widest leading-relaxed">
                    Hệ thống không tìm thấy ca được gán cho bạn hôm nay.<br/>
                    Vui lòng liên hệ quản lý để được sắp xếp.
                  </p>
                </div>
                <div className="pt-2 opacity-50 grayscale pointer-events-none">
                  <div className="flex gap-3">
                    <Button disabled className="flex-1 h-12 rounded-xl bg-gray-200">CHECK-IN</Button>
                    <Button disabled className="flex-1 h-12 rounded-xl bg-gray-200">CHECK-OUT</Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isFindingShift}
                    className={cn(
                        "w-full flex items-center justify-center gap-3 py-4 rounded-[20px] font-bold text-sm transition-all shadow-lg shadow-blue-100",
                        photoFile ? "bg-green-50 text-green-700 border border-green-200 shadow-none" : "bg-blue-600 text-white",
                        isFindingShift && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <Camera className="w-5 h-5" />
                    {photoFile ? "Ảnh đã sẵn sàng" : "Chụp ảnh Selfie để chấm công"}
                </motion.button>

                {photoPreview && (
                    <div className="relative rounded-2xl overflow-hidden h-32 border-2 border-white shadow-sm">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button onClick={clearPhoto} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center">
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={onCheckInPress}
                        disabled={isCheckInDisabled}
                        className={cn(
                            "flex-1 h-14 rounded-[20px] font-black text-base shadow-xl transition-all",
                            isCheckInDisabled ? "bg-gray-200 text-gray-400 shadow-none" : "bg-green-500 hover:bg-green-600 text-white shadow-green-100"
                        )}
                    >
                        {isLoading && !checkedIn ? <Loader2 className="animate-spin" /> : "CHECK-IN"}
                    </Button>

                    <Button
                        onClick={onCheckOutPress}
                        disabled={isCheckOutDisabled}
                        className={cn(
                            "flex-1 h-14 rounded-[20px] font-black text-base shadow-xl transition-all",
                            isCheckOutDisabled ? "bg-gray-200 text-gray-400 shadow-none" : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100"
                        )}
                    >
                        {isLoading && checkedIn ? <Loader2 className="animate-spin" /> : "CHECK-OUT"}
                    </Button>
                </div>
              </>
            )}
        </div>
      </div>

      {/* Late Reason Dialog */}
      <Dialog open={isLateDialogOpen} onOpenChange={setIsLateDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 border-none overflow-hidden">
          <div className="bg-amber-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Xác nhận đi trễ</h2>
            <p className="text-amber-100 text-sm mt-2 font-medium">Bạn cần cung cấp lý do đi trễ để Admin xét duyệt lương cho ca này.</p>
          </div>
          <div className="p-6">
            <Textarea
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
              placeholder="Ví dụ: Kẹt xe, Hỏng xe,..."
              className="min-h-[100px] rounded-2xl border-gray-100 focus:ring-amber-500"
            />
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsLateDialogOpen(false)} className="flex-1 rounded-xl">Hủy</Button>
              <Button onClick={() => handleCheckIn(lateReason)} disabled={!lateReason.trim() || isLoading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-100">
                GỬI & CHECK-IN
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Late Check-out Reason Dialog */}
      <Dialog open={isCheckOutLateDialogOpen} onOpenChange={setIsCheckOutLateDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[32px] p-0 border-none overflow-hidden">
          <div className="bg-orange-500 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">Check-out muộn</h2>
            <p className="text-orange-100 text-sm mt-2 font-medium">Vui lòng cung cấp lý do check-out muộn (trên 30 phút so với giờ kết thúc ca).</p>
          </div>
          <div className="p-6">
            <Textarea
              value={checkOutReason}
              onChange={(e) => setCheckOutReason(e.target.value)}
              placeholder="Ví dụ: Làm thêm giờ, Hỗ trợ khách hàng,..."
              className="min-h-[100px] rounded-2xl border-gray-100 focus:ring-orange-500"
            />
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={() => setIsCheckOutLateDialogOpen(false)} className="flex-1 rounded-xl">Hủy</Button>
              <Button onClick={() => handleCheckOut(checkOutReason)} disabled={!checkOutReason.trim() || isLoading} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100">
                GỬI & CHECK-OUT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
