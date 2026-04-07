import { apiJava } from '@/lib/axios'
import { API_ENDPOINTS } from '@/lib/endpoints'
import {
  ApiAttendanceResponse,
  ShiftSchema,
  ShiftConflictResponse,
  AvailableEmployee,
  CopyWeekRequest,
  CopyWeekResponse,
  CreateShiftRequest,
  ShiftType,
  AssignShiftRequest,
  RecurringShiftRequest,
  RecurringShiftResponse
} from '@/app/types/attendance.schema'

export interface ShiftTemplate {
  id: number
  name: string
  defaultStart: string
  defaultEnd: string
  durationMinutes: number
  shiftType: ShiftType
  color: string
  otMultiplier: number
}

export class SchedulingService {
  /**
   * 5. Lấy danh sách ca (filter tuần/tháng/NV)
   */
  static async getShifts(params: {
    week?: string
    month?: number
    year?: number
    startDate?: string
    endDate?: string
    employeeId?: number | string
  }): Promise<ApiAttendanceResponse<{ content: ShiftSchema[] }>> {
    const response = await apiJava.get<ApiAttendanceResponse<{ content: ShiftSchema[] }>>(
      API_ENDPOINTS.SHIFTS.LIST,
      { params }
    )
    return response.data
  }

  /**
   * 2. Kiểm tra conflict (pre-validate)
   */
  static async checkConflict(params: {
    employeeId: number
    shiftDate: string
    startTime: string
    endTime: string
    shiftType: ShiftType
    excludeShiftId?: number
  }): Promise<ApiAttendanceResponse<ShiftConflictResponse>> {
    const response = await apiJava.get<ApiAttendanceResponse<ShiftConflictResponse>>(
      API_ENDPOINTS.SHIFTS.CONFLICT_CHECK,
      { params }
    )
    return response.data
  }

  /**
   * 1. Kiểm tra nhân viên rảnh
   */
  static async getAvailableEmployees(params: {
    shiftDate: string
    startTime: string
    endTime: string
    shiftType?: ShiftType
  }): Promise<ApiAttendanceResponse<AvailableEmployee[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<AvailableEmployee[]>>(
      API_ENDPOINTS.SHIFTS.AVAILABLE_EMPLOYEES,
      { params }
    )
    return response.data
  }

  static async getShiftTemplates(): Promise<ApiAttendanceResponse<ShiftTemplate[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<ShiftTemplate[]>>(
      API_ENDPOINTS.SHIFT_TEMPLATES.LIST
    )
    return response.data
  }

  /**
   * 3A. Tạo ca đơn (manual)
   */
  static async createShift(data: CreateShiftRequest): Promise<ApiAttendanceResponse<ShiftSchema>> {
    const response = await apiJava.post<ApiAttendanceResponse<ShiftSchema>>(
      API_ENDPOINTS.SHIFTS.CREATE,
      data
    )
    return response.data
  }

  /**
   * 3B. Gán ca – Drag & Drop (Tạo mới và gán trong 1 lần)
   */
  static async assignShift(data: AssignShiftRequest): Promise<ApiAttendanceResponse<any>> {
    const response = await apiJava.post<ApiAttendanceResponse<any>>(
      API_ENDPOINTS.SHIFTS.ASSIGN,
      data
    )
    return response.data
  }

  /**
   * 3C. Tạo ca lặp lại
   */
  static async createRecurringShift(data: RecurringShiftRequest): Promise<ApiAttendanceResponse<RecurringShiftResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<RecurringShiftResponse>>(
      API_ENDPOINTS.SHIFTS.RECURRING,
      data
    )
    return response.data
  }

  /**
   * 4. Gán NV vào ca đã tồn tại (ca trống PUBLISHED)
   */
  static async assignEmployeeToExistingShift(shiftId: number, employeeId: number): Promise<ApiAttendanceResponse<any>> {
    const response = await apiJava.put<ApiAttendanceResponse<any>>(
      API_ENDPOINTS.SHIFTS.UPDATE_ASSIGN(shiftId),
      {},
      { params: { employeeId } }
    )
    return response.data
  }

  /**
   * 7. Copy lịch sang tuần mới
   */
  static async copyWeek(data: CopyWeekRequest): Promise<ApiAttendanceResponse<CopyWeekResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<CopyWeekResponse>>(
      API_ENDPOINTS.SHIFTS.COPY_WEEK,
      data
    )
    return response.data
  }

  /**
   * 6. Hủy ca (Soft delete)
   */
  static async cancelShift(id: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.delete<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFTS.DELETE(id)
    )
    return response.data
  }

  /**
   * 6B. Gỡ nhân viên khỏi ca (Trở về PUBLISHED)
   * DELETE /shifts/${id}/assign
   */
  static async unassignShift(id: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.delete<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFTS.UNASSIGN(id)
    )
    return response.data
  }

  /**
   * 6C. Xóa vĩnh viễn ca khỏi DB
   * DELETE /shifts/${id}/hard
   */
  static async hardDeleteShift(id: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.delete<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFTS.DELETE_HARD(id)
    )
    return response.data
  }

  /**
   * Lấy danh sách ca trống (Dành cho NV nhận ca)
   */
  static async getOpenShifts(): Promise<ApiAttendanceResponse<ShiftSchema[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<ShiftSchema[]>>(
      API_ENDPOINTS.SHIFTS.OPEN
    )
    return response.data
  }

  /**
   * NV tự nhận ca
   */
  static async claimShift(shiftId: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.post<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFTS.CLAIM(shiftId)
    )
    return response.data
  }

  /**
   * Lấy ca hôm nay của nhân viên đang đăng nhập
   * GET /shifts/my-today
   */
  static async getMyTodayShifts(): Promise<ApiAttendanceResponse<ShiftSchema[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<ShiftSchema[]>>(
      API_ENDPOINTS.SHIFTS.MY_TODAY
    )
    return response.data
  }

  /**
   * NV xác nhận đi làm
   */
  static async confirmShift(shiftId: number, employeeId?: number | string): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.post<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFTS.CONFIRM(shiftId),
      {},
      { params: { employeeId } }
    )
    return response.data
  }
}
