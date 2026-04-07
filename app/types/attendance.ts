
export type AttendanceStatus = "on_time" | "late" | "early_leave" | "absent" | "overtime" | "missed" | "missing_out" | "";
export type ShiftType = "morning" | "afternoon" | "night" | "";
export type CheckInMethod = "gps" | "qr" | "manual";

export interface AttendanceEmployee {
  id: string;
  name: string;
  code: string;
  avatar: string | null;
  department: string;
}

export interface AttendanceLocation {
  id: string;
  name: string;
  address: string;
}

export interface AttendanceShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: "morning" | "afternoon" | "night";
}

export interface CheckEvent {
  time: string | null;
  method: CheckInMethod | null;
  note: string | null;
  lateMinutes?: number;
  earlyMinutes?: number;
}

export interface AttendanceRecord {
  id: string;
  employee: AttendanceEmployee;
  location: AttendanceLocation;
  shift: AttendanceShift;
  date: string;
  checkIn: CheckEvent;
  checkOut: CheckEvent;
  totalMinutes: number;
  overtimeMinutes: number;
  status: Exclude<AttendanceStatus, "">;
  note: string | null;
}

export interface AttendancePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AttendanceSummary {
  totalRecords: number;
  onTime: number;
  late: number;
  earlyLeave: number;
  absent: number;
  overtime: number;
}

export interface AttendanceHistoryResponse {
  success: boolean;
  data: {
    records: AttendanceRecord[];
    pagination: AttendancePagination;
    summary: AttendanceSummary;
  };
}

export interface AttendanceFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  locationId?: string;
  status?: AttendanceStatus;
  dateFrom?: string;
  dateTo?: string;
  shiftType?: ShiftType;
}

export interface AttendanceLocationResponse {
  data: { id: string; name: string }[];
}
