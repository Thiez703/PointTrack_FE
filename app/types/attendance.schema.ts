export type CheckInFormData = {
  workScheduleId: number
  latitude?: number | null
  longitude?: number | null
  photo: File
  capturedAt?: string
  note?: string
}

export type CheckInResponse = {
  attendanceRecordId: number
  status: 'ON_TIME' | 'LATE' | 'PENDING_APPROVAL'
  checkInTime: string
  distanceMeters: number
  gpsValid: boolean
  lateMinutes: number
  explanationRequestId: number | null
  message: string
}

export type CheckOutFormData = {
  attendanceRecordId: number
  latitude?: number | null
  longitude?: number | null
  photo: File
  capturedAt?: string
  checkOutReason?: string
}

export type CheckOutResponse = {
  attendanceRecordId: number
  status: string
  checkInTime: string | null
  checkOutTime: string
  actualMinutes: number
  earlyLeaveMinutes: number
  otMultiplier: number
  workedMinutes: number | null
  workedHours: number | null
  estimatedSalary: number | null
  currency: string | null
  shiftName: string | null
  message: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * Envelope chung: ApiResponse<T> theo đặc tả v1
 */
export interface ApiAttendanceResponse<T> {
  success: boolean
  data: T
  message: string
  warning?: string | null
  errorCode?: string | null
  conflictDetail?: ShiftConflictResponse | null
}

export interface AttendanceExplanation {
  id: number;
  employeeId: number;
  employeeName: string; // Map với userName từ Backend nếu cần
  userName?: string;    // Thêm dự phòng
  attendanceId: number;
  explanationType: 'LATE' | 'GPS_ERROR' | 'MISSING_CHECKOUT' | 'OTHER';
  type?: string;        // Thêm dự phòng
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewExplanationRequest {
  reviewNote: string;
}

export enum ShiftType {
  NORMAL = 'NORMAL',           // Ca thường
  HOLIDAY = 'HOLIDAY',         // Ca Lễ/Tết
  OT_EMERGENCY = 'OT_EMERGENCY' // Ca OT đột xuất
}

export enum ShiftStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ASSIGNED = 'ASSIGNED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  MISSING_OUT = 'MISSING_OUT',
  CANCELLED = 'CANCELLED',
}

export interface ShiftSchema {
  id: number
  employeeId: number | null
  employeeName: string | null
  customerId: number
  customerName: string
  customerLatitude: number
  customerLongitude: number
  customerAddress: string
  packageId: number | null
  shiftDate: string
  startTime: string
  endTime: string
  durationMinutes: number
  shiftType: ShiftType
  otMultiplier: number
  status: ShiftStatus
  notes: string | null
  checkInTime: string | null
  attendanceRecordId?: number | null
  checkInLat: number | null
  checkInLng: number | null
  checkInDistanceMeters: number | null
  checkInPhoto: string | null
  checkOutTime: string | null
  checkOutLat: number | null
  checkOutLng: number | null
  checkOutDistanceMeters: number | null
  actualMinutes: number | null
  createdAt: string
  updatedAt: string
}

export interface ShiftConflictResponse {
  hasConflict: boolean
  conflictType: 'OVERLAP' | 'BUFFER' | null
  detail: string | null
  conflictingShiftId: number | null
  minutesShort: number | null
}

export interface CopyWeekRequest {
  sourceWeek: string
  targetWeek: string
}

export interface CopyWeekConflictItem {
  detail: string
}

export interface CopyWeekResponse {
  copied: number
  skipped: number
  conflicts: CopyWeekConflictItem[]
}

export interface AvailableEmployee {
  employeeId: number
  employeeName: string
  phoneNumber: string
  nextShiftEndTime: string | null
}

export interface CreateShiftRequest {
  employeeId?: number | null
  customerId: number
  shiftDate: string
  startTime: string
  endTime: string
  shiftType: ShiftType
  notes?: string
}

export interface AssignShiftRequest {
  employeeId: number
  customerId: number
  shiftDate: string
  startTime?: string
  endTime?: string
  shiftType: ShiftType
}

export interface RecurringShiftRequest {
  employeeId?: number | null
  customerId: number
  startDate: string
  endDate: string
  daysOfWeek: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[]
  startTime: string
  endTime: string
  shiftType: ShiftType
  notes?: string
}

export interface RecurringShiftResponse {
  totalCreated: number
  shifts: ShiftSchema[]
}

export interface AdminUpdateAttendanceRequest {
  checkInTime?: string | null
  checkOutTime?: string | null
  status?: string | null
  note?: string | null
}

export interface WorkScheduleRequest {
  employeeId: number
  customerId: number
  shiftDate: string
  startTime: string
  endTime: string
  shiftType: ShiftType
}

export interface WorkScheduleResponse {
  id: number
  userId: number
  userName: string
  workDate: string
  startTime: string
  endTime: string
  address: string | null
  lat: number | null
  lng: number | null
  status: string
  customerName?: string | null
  customerAddress?: string | null
  customerLatitude?: number | null
  customerLongitude?: number | null
  note?: string | null
  attendanceRecordId?: number | null
  checkInTime?: string | null
  checkOutTime?: string | null
}

