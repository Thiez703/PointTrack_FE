export type CheckInFormData = {
  workScheduleId: number
  lat: number
  lng: number
  capturedAt?: string
  note?: string
  photo: File
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
  capturedAt?: string
  checkOutReason?: string
  photo: File
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

export type AdminUpdateAttendanceRequest = {
  checkInTime: string
  checkOutTime: string
  reason: string
  note?: string
}

export type ExplanationReviewRequest = {
  reviewNote: string
}

export type ApiAttendanceResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type WorkScheduleRequest = {
  userId: number
  workDate: string // YYYY-MM-DD
  startTime: string // HH:mm:ss
  endTime: string // HH:mm:ss
  address?: string
  lat?: number
  lng?: number
}

export type WorkScheduleResponse = {
  id: number
  userId: number
  userName: string
  workDate: string
  startTime: string
  endTime: string
  address: string
  lat: number
  lng: number
}
