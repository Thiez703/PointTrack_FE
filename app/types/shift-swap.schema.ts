import { z } from 'zod'

export type ShiftSwapType = 'SWAP' | 'SAME_DAY' | 'OTHER_DAY' | 'TRANSFER'

export type ShiftSwapStatus = 
  | 'PENDING_EMPLOYEE' 
  | 'PENDING_ADMIN' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED'

export interface ShiftSwapRequester {
  id: number
  name: string
  avatar: string | null
  code: string
}

export interface ShiftSwapReceiver {
  id: number
  name: string
  avatar: string | null
  code: string
}

export interface ShiftSwapShift {
  id: number
  name: string
  startTime: string
  endTime: string
  date: string
  location: string
}

export interface ShiftSwapResponse {
  id: string
  type: ShiftSwapType
  status: ShiftSwapStatus
  requester: ShiftSwapRequester
  receiver: ShiftSwapReceiver | null
  myShift: ShiftSwapShift
  targetShift: ShiftSwapShift | null
  reason: string
  rejectReason: string | null
  expiredAt: string | null
  createdAt: string
}

export const CreateShiftSwapSchema = z.object({
  type: z.enum(['SWAP', 'SAME_DAY', 'OTHER_DAY', 'TRANSFER']),
  myShiftId: z.number().or(z.string().transform(v => parseInt(v, 10))),
  targetShiftId: z.number().or(z.string().transform(v => parseInt(v, 10))).optional(),
  targetEmployeeId: z.number().or(z.string().transform(v => parseInt(v, 10))).optional(),
  targetDate: z.string().optional(), // YYYY-MM-DD
  reason: z.string().min(10, 'Lý do phải ít nhất 10 ký tự')
})

export type CreateShiftSwapRequest = z.infer<typeof CreateShiftSwapSchema>

export interface ShiftSwapFilterParams {
  tab: 'sent' | 'received'
  status?: ShiftSwapStatus
  page?: number
  limit?: number
}

export interface RespondShiftSwapRequest {
  action: 'ACCEPT' | 'REJECT'
  reason?: string
}

export interface AdminActionShiftSwapRequest {
  reason?: string
}
