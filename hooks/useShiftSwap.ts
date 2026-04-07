import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShiftSwapService } from '@/app/services/shift-swap.service'
import { 
  ShiftSwapFilterParams, 
  CreateShiftSwapRequest, 
  RespondShiftSwapRequest,
  AdminActionShiftSwapRequest 
} from '@/app/types/shift-swap.schema'
import { toast } from 'sonner'

export const useShiftSwap = (filters?: ShiftSwapFilterParams) => {
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shift-swaps', filters],
    queryFn: () => ShiftSwapService.getShiftSwaps(filters!),
    enabled: !!filters,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateShiftSwapRequest) => ShiftSwapService.createShiftSwap(data),
    onSuccess: () => {
      toast.success('Yêu cầu đổi ca đã được gửi')
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể tạo yêu cầu đổi ca')
    }
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondShiftSwapRequest }) => 
      ShiftSwapService.respondToShiftSwap(id, data),
    onSuccess: (_, variables) => {
      const message = variables.data.action === 'ACCEPT' ? 'Đã chấp nhận yêu cầu' : 'Đã từ chối yêu cầu'
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => ShiftSwapService.cancelShiftSwap(id),
    onSuccess: () => {
      toast.success('Đã hủy yêu cầu đổi ca')
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể hủy yêu cầu')
    }
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data?: AdminActionShiftSwapRequest }) => 
      ShiftSwapService.approveShiftSwap(id, data),
    onSuccess: () => {
      toast.success('Đã duyệt yêu cầu đổi ca')
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminActionShiftSwapRequest }) => 
      ShiftSwapService.rejectShiftSwap(id, data),
    onSuccess: () => {
      toast.success('Đã từ chối yêu cầu đổi ca')
      queryClient.invalidateQueries({ queryKey: ['shift-swaps'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Thao tác thất bại')
    }
  })

  return {
    swaps: data?.content || [],
    totalElements: data?.totalElements || 0,
    isLoading,
    isError,
    refetch,
    createSwap: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    respondToSwap: respondMutation.mutateAsync,
    isResponding: respondMutation.isPending,
    cancelSwap: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    approveSwap: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectSwap: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  }
}

export const useShiftSwapDetail = (id: string) => {
  return useQuery({
    queryKey: ['shift-swap', id],
    queryFn: () => ShiftSwapService.getShiftSwapDetail(id),
    enabled: !!id,
  })
}

export const useAvailableShifts = (params: { date: string; locationId?: number; excludeShiftId?: number }) => {
  return useQuery({
    queryKey: ['available-shifts', params],
    queryFn: () => ShiftSwapService.getAvailableShifts(params),
    enabled: !!params.date,
  })
}

export const useAvailableEmployees = (params: { shiftId: number; date: string }) => {
  return useQuery({
    queryKey: ['available-employees', params],
    queryFn: () => ShiftSwapService.getAvailableEmployees(params),
    enabled: !!params.shiftId && !!params.date,
  })
}
