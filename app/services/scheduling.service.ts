import { apiJava } from '@/lib/axios'
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
  private static readonly SHIFT_PREFIX = '/v1/shifts'
  private static readonly TEMPLATE_PREFIX = '/v1'

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
      this.SHIFT_PREFIX,
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
      `${this.SHIFT_PREFIX}/conflict-check`,
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
      `${this.SHIFT_PREFIX}/available-employees`,
      { params }
    )
    return response.data
  }

  static async getShiftTemplates(): Promise<ApiAttendanceResponse<ShiftTemplate[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<ShiftTemplate[]>>(
      `${this.TEMPLATE_PREFIX}/shift-templates`
    )
    return response.data
  }

  /**
   * 3A. Tạo ca đơn (manual)
   */
  static async createShift(data: CreateShiftRequest): Promise<ApiAttendanceResponse<ShiftSchema>> {
    const response = await apiJava.post<ApiAttendanceResponse<ShiftSchema>>(
      this.SHIFT_PREFIX,
      data
    )
    return response.data
  }

  /**
   * 3B. Gán ca – Drag & Drop (Tạo mới và gán trong 1 lần)
   */
  static async assignShift(data: AssignShiftRequest): Promise<ApiAttendanceResponse<any>> {
    const response = await apiJava.post<ApiAttendanceResponse<any>>(
      `${this.SHIFT_PREFIX}/assign`,
      data
    )
    return response.data
  }

  /**
   * 3C. Tạo ca lặp lại
   */
  static async createRecurringShift(data: RecurringShiftRequest): Promise<ApiAttendanceResponse<RecurringShiftResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<RecurringShiftResponse>>(
      `${this.SHIFT_PREFIX}/recurring`,
      data
    )
    return response.data
  }

  /**
   * 4. Gán NV vào ca đã tồn tại (ca trống PUBLISHED)
   */
  static async assignEmployeeToExistingShift(shiftId: number, employeeId: number): Promise<ApiAttendanceResponse<any>> {
    const response = await apiJava.put<ApiAttendanceResponse<any>>(
      `${this.SHIFT_PREFIX}/${shiftId}/assign`,
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
      `${this.SHIFT_PREFIX}/copy-week`,
      data
    )
    return response.data
  }

  /**
   * 6. Xóa / Huỷ ca (Soft delete)
   */
  static async cancelShift(id: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.delete<ApiAttendanceResponse<void>>(
      `${this.SHIFT_PREFIX}/${id}`
    )
    return response.data
  }

  /**
   * Lấy danh sách ca trống (Dành cho NV nhận ca)
   */
  static async getOpenShifts(): Promise<ApiAttendanceResponse<ShiftSchema[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<ShiftSchema[]>>(
      `${this.SHIFT_PREFIX}/open`
    )
    return response.data
  }

  /**
   * NV tự nhận ca
   */
  static async claimShift(shiftId: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.post<ApiAttendanceResponse<void>>(
      `${this.SHIFT_PREFIX}/${shiftId}/claim`
    )
    return response.data
  }

  /**
   * NV xác nhận đi làm
   */
  static async confirmShift(shiftId: number): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.post<ApiAttendanceResponse<void>>(
      `${this.SHIFT_PREFIX}/${shiftId}/confirm`
    )
    return response.data
  }
}
