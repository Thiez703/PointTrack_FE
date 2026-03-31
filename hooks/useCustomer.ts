import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerService } from '@/app/services/customer.service'
import { toast } from 'sonner'
import type { 
  CustomerCreateRequest, 
  CustomerListParams 
} from '@/app/types/customer'

export const customerKeys = {
  all: ['customers'] as const,
  list: (params: CustomerListParams) => 
    [...customerKeys.all, 'list', params] as const,
  detail: (id: number | string) => 
    [...customerKeys.all, 'detail', String(id)] as const,
  activeWithGps: () => [...customerKeys.all, 'activeWithGps'] as const,
}

export const useCustomerList = (params: CustomerListParams) =>
  useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerService.getList(params),
    placeholderData: (prev) => prev, // replaces keepPreviousData
  })

export const useCustomerDetail = (id: number | undefined) =>
  useQuery({
    queryKey: customerKeys.detail(id ?? 0),
    queryFn: () => customerService.getById(String(id)),
    enabled: !!id,
  })

export const useActiveCustomersWithGps = () =>
  useQuery({
    queryKey: customerKeys.activeWithGps(),
    queryFn: customerService.getActiveWithGps,
    staleTime: 5 * 60 * 1000,
  })

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CustomerCreateRequest) => customerService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success('Tạo khách hàng thành công')
      if (response.warning) {
        toast.warning('⚠️ ' + response.warning, { duration: 5000 })
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Tạo khách hàng thất bại')
    },
  })
}

// FIX: handle undefined id safely
export const useUpdateCustomer = (id: number | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CustomerCreateRequest>) => {
      if (!id) throw new Error('Customer ID is required for update')
      return customerService.update(String(id), data)
    },
    onSuccess: (response) => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
      }
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success('Cập nhật khách hàng thành công')
      if (response.warning) {
        toast.warning('⚠️ ' + response.warning, { duration: 5000 })
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cập nhật thất bại')
    },
  })
}

export const useDeactivateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => customerService.deactivate(String(id)),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(response.message || 'Vô hiệu hóa thành công')
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })
}

export const useImportCustomers = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => customerService.importExcel(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      const { success, failed, noGps } = response.data
      toast.success(`Import thành công ${success} KH`)
      if (failed > 0) toast.error(`${failed} dòng lỗi`)
      if (noGps > 0) toast.warning(`${noGps} KH chưa có GPS`, { duration: 5000 })
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })
}
