"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Camera,
  CheckCircle,
  LogOut,
  Navigation,
  Wifi,
  Clock,
  Circle,
  AlertCircle,
  X,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/common/BottomNav";
import { AttendanceService } from "@/app/services/attendance.service";
import type {
  CheckInResponse,
  CheckOutResponse,
} from "@/app/types/attendance.schema";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS state
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Schedule config (expandable panel)
  const [workScheduleId, setWorkScheduleId] = useState(1);
  const [note, setNote] = useState("");
  const [showConfig, setShowConfig] = useState(false);

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(false);
  const [attendanceRecordId, setAttendanceRecordId] = useState<number | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResponse | null>(null);
  const [checkOutResult, setCheckOutResult] = useState<CheckOutResponse | null>(null);

  // Checkout reason (required if >30 min past shift end)
  const [checkOutReason, setCheckOutReason] = useState("");
  const [needsCheckOutReason, setNeedsCheckOutReason] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // ─── Clock ───
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Restore today's check-in from localStorage ───
  useEffect(() => {
    if (!mounted) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toDateString() && parsed.checkedIn) {
          setCheckedIn(true);
          setAttendanceRecordId(parsed.attendanceRecordId);
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

  // ─── GPS ───
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
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Vui lòng cấp quyền GPS cho ứng dụng"
            : "Không thể lấy vị trí GPS"
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ─── Check if checkout reason is needed (>30 min past shift end) ───
  // Default shift end = 17:00 since we don't have a schedule API yet
  useEffect(() => {
    if (!checkedIn) return;
    const SHIFT_END_MIN = 17 * 60;
    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    setNeedsCheckOutReason(nowMin > SHIFT_END_MIN + 30);
  }, [currentTime, checkedIn]);

  // ─── Photo ───
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
    toast.success("Đã chụp ảnh thành công!");
    // Reset file input so same file can be re-selected
    e.target.value = "";
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // ─── Check-in ───
  const handleCheckIn = async () => {
    if (!gps) { toast.error("Chưa xác định được vị trí GPS"); return; }
    if (!photoFile) { toast.error("Vui lòng chụp ảnh selfie trước khi check-in"); return; }

    setIsLoading(true);
    try {
      const result = await AttendanceService.checkIn({
        workScheduleId,
        lat: gps.lat,
        lng: gps.lng,
        capturedAt: new Date().toISOString().substring(0, 19),
        note: note || undefined,
        photo: photoFile,
      });

      const rd = result.data;
      setCheckInResult(rd);
      setCheckedIn(true);
      setAttendanceRecordId(rd.attendanceRecordId);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          date: new Date().toDateString(),
          checkedIn: true,
          attendanceRecordId: rd.attendanceRecordId,
          checkInResult: rd,
        })
      );

      const msgs: Record<AttendanceStatus, string> = {
        ON_TIME: "Check-in thành công! Bạn đúng giờ ✅",
        LATE: `Check-in muộn ${rd.lateMinutes} phút. Đơn giải trình đã được tạo tự động.`,
        PENDING_APPROVAL: "GPS không hợp lệ. Đã gửi yêu cầu chờ Admin duyệt.",
      };
      toast.success(msgs[rd.status]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-in thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Check-out ───
  const handleCheckOut = async () => {
    if (!attendanceRecordId) { toast.error("Không tìm thấy dữ liệu check-in hôm nay"); return; }
    if (!gps) { toast.error("Chưa xác định được vị trí GPS"); return; }
    if (!photoFile) { toast.error("Vui lòng chụp ảnh trước khi check-out"); return; }
    if (needsCheckOutReason && !checkOutReason.trim()) {
      toast.error("Vui lòng nhập lý do check-out muộn");
      return;
    }

    setIsLoading(true);
    try {
      const result = await AttendanceService.checkOut({
        attendanceRecordId,
        lat: gps.lat,
        lng: gps.lng,
        capturedAt: new Date().toISOString().substring(0, 19),
        checkOutReason: checkOutReason || undefined,
        photo: photoFile,
      });

      setCheckOutResult(result.data);
      setCheckedIn(false);
      clearPhoto();
      localStorage.removeItem(STORAGE_KEY);
      toast.success(result.data.message || "Check-out thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Check-out thất bại, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusCfg = checkInResult ? STATUS_CONFIG[checkInResult.status] : null;

  return (
    <div className="login-app-container pb-24 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 pt-12 pb-5 px-5 rounded-b-[28px]">
        <h1 className="text-xl font-bold text-white mb-1">Chấm công</h1>
        <p className="text-orange-100 text-xs">
          {mounted ? currentTime.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) : "Đang tải..."}
        </p>
      </div>

      <div className="px-5 mt-4">
        {/* Map visual */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="relative h-52 bg-gradient-to-br from-green-100 via-green-50 to-blue-50 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(8)].map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${(i + 1) * 12}%` }} />
              ))}
              {[...Array(6)].map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${(i + 1) * 15}%` }} />
              ))}
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-orange-500/10 border-2 border-dashed border-orange-300 flex items-center justify-center"
              >
                <div className="w-20 h-20 rounded-full bg-orange-500/15 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg" />
                </div>
              </motion.div>
            </div>
            {gps && (
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-[48%] left-[52%] -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
                    <Navigation className="w-5 h-5 text-white fill-white" />
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -inset-2 rounded-full bg-blue-400/30"
                  />
                </div>
              </motion.div>
            )}
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm">
              📍 KCN Tân Bình
            </div>
          </div>
        </div>

        {/* Clock + Status badges */}
        <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-gray-800 tracking-wider font-mono">
            {mounted ? currentTime.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }) : "--:--:--"}
          </p>

          {checkInResult && statusCfg && (
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusCfg.bgColor}`}>
              <span>{statusCfg.icon}</span>
              <span className={`text-sm font-medium ${statusCfg.textColor}`}>
                Check-in{" "}
                {new Date(checkInResult.checkInTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" · "}
                {statusCfg.label}
                {checkInResult.lateMinutes > 0 && ` (${checkInResult.lateMinutes} phút)`}
              </span>
            </div>
          )}

          {checkOutResult && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
              <LogOut className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                Check-out{" "}
                {new Date(checkOutResult.checkOutTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" · "}
                {checkOutResult.actualMinutes} phút làm việc
              </span>
            </div>
          )}
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

        {/* Photo button */}
        <div className="mt-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-semibold text-sm transition-all ${
              photoFile
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
            }`}
          >
            {photoFile ? (
              <><CheckCircle className="w-5 h-5" /> Đã chụp ảnh Selfie & GPS</>
            ) : (
              <><Camera className="w-5 h-5" /> Chụp ảnh Selfie & GPS</>
            )}
          </motion.button>

          {photoPreview && (
            <div className="mt-2 relative rounded-xl overflow-hidden">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-32 object-cover"
              />
              <button
                onClick={clearPhoto}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* GPS + Info card */}
        <div className="mt-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          {/* GPS status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Trạng thái GPS</span>
            </div>
            {gpsLoading ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                Đang lấy...
              </span>
            ) : gpsError ? (
              <button
                onClick={requestGps}
                className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" /> Thử lại
              </button>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                <Circle className="w-2 h-2 fill-current" /> Đã lấy GPS
              </span>
            )}
          </div>

          {gpsError && (
            <p className="text-xs text-red-500 pl-6">{gpsError}</p>
          )}

          {/* Coordinates */}
          {gps && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Vị trí GPS</span>
              </div>
              <span className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-lg">
                [{gps.lat.toFixed(4)}°, {gps.lng.toFixed(4)}°]
              </span>
            </div>
          )}

          {/* Distance from response */}
          {checkInResult && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Khoảng cách</span>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 text-blue-700">
                {checkInResult.distanceMeters.toFixed(0)} m
              </span>
            </div>
          )}

          {/* Work schedule */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Ca làm việc</span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 px-2 py-1 rounded-lg"
            >
              <Settings className="w-3 h-3" />
              Ca #{workScheduleId}
            </button>
          </div>

          {/* Expandable config */}
          {showConfig && (
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28 shrink-0">ID Ca làm việc</span>
                <input
                  type="number"
                  min={1}
                  value={workScheduleId}
                  onChange={(e) => setWorkScheduleId(Math.max(1, Number(e.target.value)))}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28 shrink-0">Ghi chú</span>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Lý do đến muộn (nếu có)"
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Checkout reason (required when late) */}
        {checkedIn && needsCheckOutReason && (
          <div className="mt-3 bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 mb-2">
              ⚠️ Bạn đang check-out sau giờ ca hơn 30 phút — vui lòng nhập lý do:
            </p>
            <textarea
              value={checkOutReason}
              onChange={(e) => setCheckOutReason(e.target.value)}
              placeholder="Nhập lý do..."
              rows={2}
              className="w-full text-sm border border-yellow-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white resize-none"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckIn}
            disabled={checkedIn || isLoading || !gps || !photoFile}
            className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              checkedIn || !gps || !photoFile
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200"
            }`}
          >
            {isLoading && !checkedIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle className="w-5 h-5" /> Check-in</>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCheckOut}
            disabled={!checkedIn || isLoading || !gps || !photoFile}
            className={`flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
              !checkedIn || !gps || !photoFile
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-orange-200"
            }`}
          >
            {isLoading && checkedIn ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><LogOut className="w-5 h-5" /> Check-out</>
            )}
          </motion.button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
