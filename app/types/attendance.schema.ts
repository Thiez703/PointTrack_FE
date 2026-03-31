export type CheckInFormData = {
  workScheduleId: number
  lat: number
  lng: number
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
  lat: number
  lng: number
  photo: File
  capturedAt?: string
  checkOutReason?: string
}

export type CheckOutResponse = {
  attendanceRecordId: number
  status: string
  checkOutTime: string
  actualMinutes: number
  earlyLeaveMinutes: number
  otMultiplier: number
  message: string
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
  templateId: number | null
  templateName: string | null
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

export interface AvailableEmployee {
  employeeId: number
  employeeName: string
  phoneNumber: string
  nextShiftEndTime: string | null
}

export interface CreateShiftRequest {
  employeeId?: number | null
  customerId: number
  templateId?: number | null
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
  templateId?: number | null
  startTime?: string
  endTime?: string
  shiftType: ShiftType
}

export interface RecurringShiftRequest {
  employeeId?: number | null
  customerId: number
  templateId?: number | null
  startDate: string
  endDate: string
  daysOfWeek: ('MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY')[]
  startTime: string
  endTime: string
  shiftType: ShiftType
  notes?: string
}

export interface RecurringShiftResponse {
  created: number
  skipped: number
  createdShiftIds: number[]
  conflicts: ShiftConflictResponse[]
}

export interface CopyWeekRequest {
  sourceWeek: string // YYYY-Www
  targetWeek: string // YYYY-Www
}

export interface CopyWeekResponse {
  copied: number
  skipped: number
  conflicts: ShiftConflictResponse[]
}
