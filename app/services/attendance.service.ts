import { apiJava } from '@/lib/axios'
import {
  CheckInFormData,
  CheckInResponse,
  CheckOutFormData,
  AdminUpdateAttendanceRequest,
  ApiAttendanceResponse,
  WorkScheduleRequest,
  WorkScheduleResponse,
  } from '@/app/types/attendance.schema'

  export class AttendanceService {
  private static readonly PREFIX = '/attendance'

  static async createSchedule(data: WorkScheduleRequest): Promise<ApiAttendanceResponse<WorkScheduleResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<WorkScheduleResponse>>(
      `${this.PREFIX}/schedule/create`,
      data
    )
    return response.data
  }

  static async getAllSchedules(): Promise<ApiAttendanceResponse<WorkScheduleResponse[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<WorkScheduleResponse[]>>(
      `${this.PREFIX}/schedule/all`
    )
    return response.data
  }

  /**
   * Check-in with GPS + photo (multipart/form-data).
  ...
   * Browser sets Content-Type boundary automatically when FormData is passed.
   */
  static async checkIn(
    data: CheckInFormData
  ): Promise<ApiAttendanceResponse<CheckInResponse>> {
    const formData = new FormData()
    formData.append('workScheduleId', String(data.workScheduleId))
    formData.append('lat', String(data.lat))
    formData.append('lng', String(data.lng))
    if (data.capturedAt) formData.append('capturedAt', data.capturedAt)
    if (data.note) formData.append('note', data.note)
    formData.append('photo', data.photo)

    const response = await apiJava.post<ApiAttendanceResponse<CheckInResponse>>(
      `${this.PREFIX}/check-in`,
      formData,
      { headers: { 'Content-Type': undefined } }
    )
    return response.data
  }

  /**
   * Check-out with GPS + photo.
   * checkOutReason is required if checking out >30 min after shift end.
   */
  static async checkOut(
    data: CheckOutFormData
  ): Promise<ApiAttendanceResponse<CheckOutResponse>> {
    const formData = new FormData()
    formData.append('attendanceRecordId', String(data.attendanceRecordId))
    formData.append('lat', String(data.lat))
    formData.append('lng', String(data.lng))
    if (data.capturedAt) formData.append('capturedAt', data.capturedAt)
    if (data.checkOutReason) formData.append('checkOutReason', data.checkOutReason)
    formData.append('photo', data.photo)

    const response = await apiJava.post<ApiAttendanceResponse<CheckOutResponse>>(
      `${this.PREFIX}/check-out`,
      formData,
      { headers: { 'Content-Type': undefined } }
    )
    return response.data
  }

  // ─── Admin-only ───

  static async approveExplanation(
    id: number,
    reviewNote: string
  ): Promise<{ message: string }> {
    const response = await apiJava.put<{ message: string }>(
      `${this.PREFIX}/explanations/${id}/approve`,
      { reviewNote }
    )
    return response.data
  }

  static async rejectExplanation(
    id: number,
    reviewNote: string
  ): Promise<{ message: string }> {
    const response = await apiJava.put<{ message: string }>(
      `${this.PREFIX}/explanations/${id}/reject`,
      { reviewNote }
    )
    return response.data
  }

  static async adminUpdate(
    recordId: number,
    data: AdminUpdateAttendanceRequest
  ): Promise<{ message: string }> {
    const response = await apiJava.put<{ message: string }>(
      `${this.PREFIX}/${recordId}/admin-update`,
      data
    )
    return response.data
  }
}
