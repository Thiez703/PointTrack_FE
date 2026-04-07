import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { AttendanceService } from '@/app/services/attendance.service'
import { AttendanceFilterParams, AttendanceStatus, ShiftType } from '@/app/types/attendance'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

export const useAttendanceHistory = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  // Khởi tạo filter từ URL params
  const [filters, setFilters] = useState<AttendanceFilterParams>({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    search: searchParams.get('search') || '',
    locationId: searchParams.get('locationId') || '',
    status: (searchParams.get('status') as AttendanceStatus) || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    shiftType: (searchParams.get('shiftType') as ShiftType) || '',
  })

  const debouncedSearch = useDebounce(filters.search, 400)

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries({ ...filters, search: debouncedSearch }).forEach(([key, value]) => {
      if (value) params.set(key, String(value))
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, filters.page, filters.limit, filters.locationId, filters.status, filters.dateFrom, filters.dateTo, filters.shiftType])

  // Fetch dữ liệu chính
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance-history', { ...filters, search: debouncedSearch }],
    queryFn: () => AttendanceService.getHistory({ ...filters, search: debouncedSearch }),
    placeholderData: (previousData) => previousData,
  })

  // Fetch danh sách địa điểm
  const { data: locationsData } = useQuery({
    queryKey: ['attendance-locations'],
    queryFn: () => AttendanceService.getLocations(),
  })

  // Mutation cập nhật ghi chú
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => AttendanceService.updateNote(id, note),
    onSuccess: () => {
      toast.success('Cập nhật ghi chú thành công')
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] })
    },
    onError: () => toast.error('Cập nhật ghi chú thất bại'),
  })

  // Mutation xuất excel
  const [isExporting, setIsExporting] = useState(false)
  const exportExcel = async () => {
    try {
      setIsExporting(true)
      const blob = await AttendanceService.exportExcel({ ...filters, search: debouncedSearch })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `attendance_history_${new Date().getTime()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Xuất file thành công')
    } catch (error) {
      toast.error('Lỗi khi xuất file Excel')
    } finally {
      setIsExporting(false)
    }
  }

  const updateFilter = useCallback((newFilters: Partial<AttendanceFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      locationId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      shiftType: '',
    })
  }, [])

  return {
    records: data?.data.records || [],
    pagination: data?.data.pagination,
    summary: data?.data.summary,
    locations: locationsData?.data || [],
    filters,
    updateFilter,
    resetFilters,
    isLoading,
    isError,
    refetch,
    updateNote: updateNoteMutation.mutateAsync,
    isUpdatingNote: updateNoteMutation.isPending,
    exportExcel,
    isExporting,
  }
}
