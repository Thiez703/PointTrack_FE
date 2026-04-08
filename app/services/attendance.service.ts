import { apiJava } from '@/lib/axios'
import { API_ENDPOINTS } from '@/lib/endpoints'
import {
  CheckInFormData,
  CheckInResponse,
  CheckOutFormData,
  CheckOutResponse,
  AdminUpdateAttendanceRequest,
  ApiAttendanceResponse,
  WorkScheduleRequest,
  WorkScheduleResponse,
  AttendanceExplanation,
  } from '@/app/types/attendance.schema'
import { 
  AttendanceFilterParams, 
  AttendanceHistoryResponse, 
  AttendanceLocationResponse,
  AttendanceRecord
} from '@/app/types/attendance'

export class AttendanceService {
  static async getMyRecords(params?: {
    page?: number
    size?: number
    status?: string
  }): Promise<ApiAttendanceResponse<{ content: Array<{
    id: number
    customerId: number | null
    customerName: string | null
    shiftDate: string
    checkInTime: string | null
    checkOutTime: string | null
    status: string
  }> }>> {
    const response = await apiJava.get<ApiAttendanceResponse<{ content: Array<{
      id: number
      customerId: number | null
      customerName: string | null
      shiftDate: string
      checkInTime: string | null
      checkOutTime: string | null
      status: string
    }> }>>(
      API_ENDPOINTS.ATTENDANCE.MY_RECORDS,
      { params }
    )
    return response.data
  }

  /**
   * Lấy lịch sử chấm công với các bộ lọc
   */
  static async getHistory(params: AttendanceFilterParams): Promise<AttendanceHistoryResponse> {
    const response = await apiJava.get<AttendanceHistoryResponse>(
      API_ENDPOINTS.ATTENDANCE.HISTORY,
      { params }
    )
    return response.data
  }

  /**
   * Lấy danh sách địa điểm để lọc
   */
  static async getLocations(): Promise<AttendanceLocationResponse> {
    const response = await apiJava.get<AttendanceLocationResponse>(
      API_ENDPOINTS.ATTENDANCE.LOCATIONS
    )
    return response.data
  }

  /**
   * Cập nhật ghi chú cho một bản ghi chấm công
   */
  static async updateNote(id: string, note: string): Promise<{ success: boolean; data: AttendanceRecord }> {
    const response = await apiJava.patch<{ success: boolean; data: AttendanceRecord }>(
      API_ENDPOINTS.ATTENDANCE.UPDATE_NOTE(id),
      { note }
    )
    return response.data
  }

  /**
   * Xuất file Excel lịch sử chấm công
   */
  static async exportExcel(params: AttendanceFilterParams): Promise<Blob> {
    const response = await apiJava.post(
      API_ENDPOINTS.ATTENDANCE.EXPORT,
      params,
      { responseType: 'blob' }
    )
    return response.data
  }

  static async createSchedule(data: WorkScheduleRequest): Promise<ApiAttendanceResponse<WorkScheduleResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<WorkScheduleResponse>>(
      API_ENDPOINTS.ATTENDANCE.SCHEDULE_CREATE,
      data
    )
    return response.data;
  }

  static async getAllSchedules(): Promise<ApiAttendanceResponse<WorkScheduleResponse[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<WorkScheduleResponse[]>>(
      API_ENDPOINTS.ATTENDANCE.SCHEDULE_ALL
    )
    return response.data;
  }

  static async getMyTodaySchedules(): Promise<ApiAttendanceResponse<WorkScheduleResponse[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<WorkScheduleResponse[]>>(
      API_ENDPOINTS.ATTENDANCE.SCHEDULE_MY_TODAY
    )
    return response.data
  }

  /**
   * Check-in with GPS coordinates.
   * POST /attendance/check-in
   */
  static async checkIn(
    data: CheckInFormData
  ): Promise<ApiAttendanceResponse<CheckInResponse>> {
    const formData = new FormData()
    formData.append('workScheduleId', String(data.workScheduleId))
    formData.append('latitude', String(data.latitude))
    formData.append('longitude', String(data.longitude))
    formData.append('photo', data.photo) 
    if (data.capturedAt) formData.append('capturedAt', data.capturedAt)
    if (data.note) formData.append('note', data.note)

    // Để headers undefined để axios tự xác định boundary cho FormData
    const response = await apiJava.post<ApiAttendanceResponse<CheckInResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_IN,
      formData,
      {
        headers: {
          'Content-Type': undefined
        }
      }
    )
    return response.data;
  }

  /**
   * Check-out with GPS coordinates.
   * POST /attendance/check-out
   */
  static async checkOut(
    data: CheckOutFormData
  ): Promise<ApiAttendanceResponse<CheckOutResponse>> {
    const formData = new FormData()
    formData.append('attendanceRecordId', String(data.attendanceRecordId))
    formData.append('latitude', String(data.latitude))
    formData.append('longitude', String(data.longitude))
    formData.append('photo', data.photo)
    
    if (data.capturedAt) {
      formData.append('capturedAt', data.capturedAt)
    }
    
    if (data.checkOutReason) {
      formData.append('checkOutReason', data.checkOutReason)
    }

    const response = await apiJava.post<ApiAttendanceResponse<CheckOutResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_OUT,
      formData,
      {
        headers: {
          'Content-Type': undefined
        }
      }
    )
    return response.data;
  }

  /**
   * Post checkout with FormData directly.
   */
  static async postCheckout(formData: FormData): Promise<ApiAttendanceResponse<CheckOutResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<CheckOutResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_OUT,
      formData,
      {
        headers: {
          'Content-Type': undefined
        }
      }
    )
    return response.data;
  }

  // ─── Admin-only ───

  static async getExplanations(
    status?: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiAttendanceResponse<any>> {
    const response = await apiJava.get<ApiAttendanceResponse<any>>(
      API_ENDPOINTS.ATTENDANCE.EXPLANATIONS,
      { params: { status, page, size } }
    )
    return response.data;
  }

  static async approveExplanation(
    id: number,
    reviewNote: string
  ): Promise<{ message: string }> {
    const response = await apiJava.post<{ message: string }>(
      API_ENDPOINTS.ATTENDANCE.APPROVE_EXPLANATION(id),
      { reviewNote }
    )
    return response.data;
  }

  static async rejectExplanation(
    id: number,
    reviewNote: string
  ): Promise<{ message: string }> {
    const response = await apiJava.post<{ message: string }>(
      API_ENDPOINTS.ATTENDANCE.REJECT_EXPLANATION(id),
      { reviewNote }
    )
    return response.data;
  }

  static async adminUpdate(
    recordId: number,
    data: AdminUpdateAttendanceRequest
  ): Promise<{ message: string }> {
    const response = await apiJava.put<{ message: string }>(
      API_ENDPOINTS.ATTENDANCE.ADMIN_UPDATE(recordId),
      data
    )
    return response.data;
  }
}

