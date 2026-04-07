import { apiJava } from '@/lib/axios'
import { API_ENDPOINTS } from '@/lib/endpoints'
import {
  ShiftSwapResponse,
  CreateShiftSwapRequest,
  ShiftSwapFilterParams,
  RespondShiftSwapRequest,
  AdminActionShiftSwapRequest
} from '@/app/types/shift-swap.schema'
import { ApiAttendanceResponse, PaginatedResponse } from '@/app/types/attendance.schema'

export class ShiftSwapService {
  static async getShiftSwaps(params: ShiftSwapFilterParams): Promise<PaginatedResponse<ShiftSwapResponse>> {
    const response = await apiJava.get<PaginatedResponse<ShiftSwapResponse>>(
      API_ENDPOINTS.SHIFT_SWAP.LIST,
      { params }
    )
    return response.data
  }

  static async createShiftSwap(data: CreateShiftSwapRequest): Promise<ApiAttendanceResponse<ShiftSwapResponse>> {
    const response = await apiJava.post<ApiAttendanceResponse<ShiftSwapResponse>>(
      API_ENDPOINTS.SHIFT_SWAP.CREATE,
      data
    )
    return response.data
  }

  static async getShiftSwapDetail(id: string): Promise<ShiftSwapResponse> {
    const response = await apiJava.get<ShiftSwapResponse>(API_ENDPOINTS.SHIFT_SWAP.DETAIL(id))
    return response.data
  }

  static async respondToShiftSwap(id: string, data: RespondShiftSwapRequest): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.patch<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFT_SWAP.RESPOND(id),
      data
    )
    return response.data
  }

  static async approveShiftSwap(id: string, data?: AdminActionShiftSwapRequest): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.patch<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFT_SWAP.APPROVE(id),
      data
    )
    return response.data
  }

  static async rejectShiftSwap(id: string, data: AdminActionShiftSwapRequest): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.patch<ApiAttendanceResponse<void>>(
      API_ENDPOINTS.SHIFT_SWAP.REJECT(id),
      data
    )
    return response.data
  }

  static async cancelShiftSwap(id: string): Promise<ApiAttendanceResponse<void>> {
    const response = await apiJava.delete<ApiAttendanceResponse<void>>(API_ENDPOINTS.SHIFT_SWAP.DELETE(id))
    return response.data
  }

  static async getAvailableShifts(params: {
    date: string
    locationId?: number
    excludeShiftId?: number
  }): Promise<ApiAttendanceResponse<any[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<any[]>>(
      API_ENDPOINTS.SHIFT_SWAP.AVAILABLE_SHIFTS,
      { params }
    )
    return response.data
  }

  static async getAvailableEmployees(params: {
    shiftId: number
    date: string
  }): Promise<ApiAttendanceResponse<any[]>> {
    const response = await apiJava.get<ApiAttendanceResponse<any[]>>(
      API_ENDPOINTS.SHIFT_SWAP.AVAILABLE_EMPLOYEES,
      { params }
    )
    return response.data
  }
}
