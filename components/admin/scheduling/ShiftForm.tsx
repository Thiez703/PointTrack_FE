'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  ShiftType, 
  ShiftStatus,
  ShiftConflictResponse,
  AvailableEmployee
} from '@/app/types/attendance.schema'
import { SchedulingService } from '@/app/services/scheduling.service'
import { AdminService } from '@/app/services/admin.service'
import { customerService } from '@/app/services/customer.service'
import { AttendanceService } from '@/app/services/attendance.service'
import { Employee } from '@/app/types/admin.schema'
import type { Customer } from '@/app/types/customer'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2, AlertTriangle, CheckCircle, Info, Trash2, UserMinus, XCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { calculateShiftDuration, formatToISODate } from '@/lib/dateUtils'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import { ShiftTimeSelector } from './ShiftTimeSelector'

const shiftSchema = z.object({
  employeeId: z.coerce.number().optional(),
  customerId: z.coerce.number().min(1, 'Vui lòng chọn khách hàng'),
  shiftDate: z.date({ required_error: 'Vui lòng chọn ngày làm việc' }),
  shiftType: z.nativeEnum(ShiftType),
  startTime: z.string().min(1, 'Giờ bắt đầu là bắt buộc'),
  endTime: z.string().min(1, 'Giờ kết thúc là bắt buộc'),
  notes: z.string().optional()
}).refine((data) => {
  if (data.shiftType === ShiftType.NORMAL || data.shiftType === ShiftType.HOLIDAY) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: "Giờ kết thúc phải lớn hơn giờ bắt đầu cho ca thường/lễ",
  path: ["endTime"]
})

type ShiftFormValues = z.infer<typeof shiftSchema>

interface ShiftFormProps {
  initialData?: Partial<ShiftFormValues> & { 
    id?: number, 
    note?: string,
    status?: ShiftStatus,
    attendanceRecordId?: number | null,
    checkInTime?: string | null,
    checkOutTime?: string | null
  }
  onSuccess: () => void
  onCancel: () => void
}

const ShiftForm: React.FC<ShiftFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)
  const [conflict, setConflict] = useState<ShiftConflictResponse | null>(null)
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([])
  const [showAvailable, setShowAvailable] = useState(false)

  // Status-based logic flags
  const status = initialData?.status;
  const isMissed = status === ShiftStatus.MISSED;
  const isMissingOut = status === ShiftStatus.MISSING_OUT;
  
  const isEditable = !status || [ShiftStatus.DRAFT, ShiftStatus.PUBLISHED, ShiftStatus.ASSIGNED, ShiftStatus.CONFIRMED].includes(status);
  const isCancellable = status && [ShiftStatus.DRAFT, ShiftStatus.PUBLISHED, ShiftStatus.ASSIGNED, ShiftStatus.CONFIRMED, ShiftStatus.MISSED, ShiftStatus.MISSING_OUT].includes(status);
  const isUnassignable = status && [ShiftStatus.ASSIGNED, ShiftStatus.CONFIRMED].includes(status);
  const isHardDeletable = status && [ShiftStatus.DRAFT, ShiftStatus.PUBLISHED].includes(status);
  const isPublished = status === ShiftStatus.PUBLISHED;
  const isAssigned = status === ShiftStatus.ASSIGNED || status === ShiftStatus.CONFIRMED;

  // Attendance adjustment states
  const [adminCheckIn, setAdminCheckIn] = useState(initialData?.checkInTime || '')
  const [adminCheckOut, setAdminCheckOut] = useState(initialData?.checkOutTime || '')
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState(false)

  const handleCancelShift = async () => {
    if (!initialData?.id) return;
    if (!window.confirm('Bạn có chắc chắn muốn hủy ca này?')) return;
    
    setIsLoading(true);
    try {
      await SchedulingService.cancelShift(initialData.id);
      toast.success('Đã hủy ca làm việc');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi hủy ca');
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateAttendance = async () => {
    if (!initialData?.attendanceRecordId) {
      toast.error('Không tìm thấy bản ghi chấm công để cập nhật');
      return;
    }
    
    setIsUpdatingAttendance(true);
    try {
      await AttendanceService.adminUpdate(initialData.attendanceRecordId, {
        checkInTime: adminCheckIn || null,
        checkOutTime: adminCheckOut || null,
        status: isMissed ? 'MISSED' : isMissingOut ? 'MISSING_OUT' : null
      });
      toast.success('Đã cập nhật giờ công');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật giờ công');
    } finally {
      setIsUpdatingAttendance(false);
    }
  }

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      employeeId: initialData?.employeeId || 0,
      customerId: initialData?.customerId || 0,
      shiftDate: initialData?.shiftDate || new Date(),
      shiftType: initialData?.shiftType || ShiftType.NORMAL,
      startTime: initialData?.startTime || '08:00',
      endTime: initialData?.endTime || '17:00',
      notes: initialData?.notes || initialData?.note || ''
    }
  })

  const watchedValues = useWatch({ control: form.control })
  const debouncedValues = useDebounce(watchedValues, 400)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, custRes] = await Promise.all([
          AdminService.getPersonnel({ size: 100 }),
          customerService.getActiveWithGps()
        ])
        setEmployees(empRes.data.content || [])
        setCustomers(custRes.data || [])
      } catch (error: any) {
        console.error('Error fetching form data:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const checkConflict = async () => {
      const { employeeId, shiftDate, startTime, endTime, shiftType } = debouncedValues
      if (employeeId && shiftDate && startTime && endTime) {
        setIsCheckingConflict(true)
        try {
          const res = await SchedulingService.checkConflict({
            employeeId: Number(employeeId),
            shiftDate: formatToISODate(shiftDate),
            startTime,
            endTime,
            shiftType: shiftType as ShiftType,
            excludeShiftId: initialData?.id
          })
          setConflict(res.data)
        } catch (error: any) {
          console.error('Conflict check error:', error)
        } finally {
          setIsCheckingConflict(false)
        }
      }
    }
    checkConflict()
  }, [debouncedValues, initialData?.id])

  const duration = useMemo(() => {
    return calculateShiftDuration(watchedValues.startTime || '', watchedValues.endTime || '')
  }, [watchedValues.startTime, watchedValues.endTime])

  const findAvailableEmployees = async () => {
    const { shiftDate, startTime, endTime, shiftType } = form.getValues()
    if (!shiftDate || !startTime || !endTime) {
      toast.error('Vui lòng chọn ngày và giờ trước')
      return
    }
    setIsLoading(true)
    try {
      const res = await SchedulingService.getAvailableEmployees({
        shiftDate: formatToISODate(shiftDate),
        startTime,
        endTime,
        shiftType: shiftType as ShiftType
      })
      setAvailableEmployees(res.data)
      setShowAvailable(true)
    } catch (error) {
      toast.error('Lỗi khi tìm nhân viên rảnh')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnassign = async () => {
    if (!initialData?.id) return
    if (!confirm('Bạn có chắc chắn muốn gỡ nhân viên khỏi ca này?')) return

    setIsLoading(true)
    try {
      await SchedulingService.unassignShift(initialData.id)
      toast.success('Đã gỡ nhân viên khỏi ca')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi gỡ nhân viên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHardDelete = async () => {
    if (!initialData?.id) return
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn ca này? Thao tác này không thể hoàn tác.')) return
    
    setIsLoading(true)
    try {
      await SchedulingService.hardDeleteShift(initialData.id)
      toast.success('Đã xóa vĩnh viễn ca làm việc')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa ca')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!initialData?.id) return
    if (!confirm('Bạn có chắc chắn muốn hủy ca này?')) return

    setIsLoading(true)
    try {
      await SchedulingService.cancelShift(initialData.id)
      toast.success('Đã hủy ca làm việc')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi hủy ca')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: ShiftFormValues) => {
    if (conflict?.hasConflict && conflict.conflictType === 'OVERLAP') {
      toast.error('Không thể thực hiện do trùng lịch!')
      return
    }
    
    setIsLoading(true)
    try {
      if (status === ShiftStatus.PUBLISHED) {
        // Nếu là PUBLISHED và đang gán nhân viên
        if (!values.employeeId) {
          toast.error('Vui lòng chọn nhân viên để gán')
          setIsLoading(false)
          return
        }
        await SchedulingService.assignEmployeeToExistingShift(initialData!.id!, values.employeeId)
        toast.success('Gán nhân viên thành công')
      } else if (initialData?.id) {
        // Cập nhật ca hiện tại
        await SchedulingService.createShift({
          ...values,
          employeeId: values.employeeId || null,
          shiftDate: formatToISODate(values.shiftDate)
        })
        toast.success('Cập nhật thành công')
      } else {
        // Tạo mới
        await SchedulingService.createShift({
          ...values,
          employeeId: values.employeeId || null,
          shiftDate: formatToISODate(values.shiftDate)
        })
        toast.success('Tạo ca thành công')
      }
      onSuccess()
    } catch (error: any) {
      const detail = error.response?.data?.detail
      toast.error(detail || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonDisabled = useMemo(() => {
    if (!conflict) return false
    if (conflict.conflictType === 'OVERLAP') return true
    if (conflict.conflictType === 'BUFFER' && watchedValues.shiftType !== ShiftType.OT_EMERGENCY) return true
    return false
  }, [conflict, watchedValues.shiftType])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhân viên {isPublished ? '*' : ''}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={String(field.value)}
                  disabled={!isEditable}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-gray-100 h-11">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="0">Để trống (Công khai)</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                {isEditable && (
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs text-orange-500 font-bold"
                    onClick={findAvailableEmployees}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Tìm nhân viên rảnh
                  </Button>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khách hàng *</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value)} disabled={!isEditable || !!initialData?.id}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl border-gray-100 h-11">
                      <SelectValue placeholder="Chọn khách hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {customers.map(cust => (
                      <SelectItem key={cust.id} value={String(cust.id)}>
                        {cust.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shiftDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="mb-1">Ngày làm việc *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        disabled={!isEditable || !!initialData?.id}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-xl h-11 border-gray-100",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shiftType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Loại ca *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!isEditable || !!initialData?.id}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ShiftType.NORMAL} />
                    </FormControl>
                    <FormLabel className="font-medium text-xs">Ca thường</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ShiftType.HOLIDAY} />
                    </FormControl>
                    <FormLabel className="font-medium text-xs">Ca Lễ/Tết</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ShiftType.OT_EMERGENCY} />
                    </FormControl>
                    <FormLabel className="font-medium text-xs">OT đột xuất</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <ShiftTimeSelector
            startTime={watchedValues.startTime || '08:00'}
            endTime={watchedValues.endTime || '17:00'}
            disabled={!isEditable || !!initialData?.id}
            onChange={(start, end) => {
              form.setValue('startTime', start, { shouldValidate: true })
              form.setValue('endTime', end, { shouldValidate: true })
            }}
          />
        </div>

        {/* Conflict Check Results */}
        <div className="min-h-[60px]">
          {isCheckingConflict ? (
            <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Đang kiểm tra lịch...
            </div>
          ) : conflict?.hasConflict ? (
            <div className={cn(
              "p-4 rounded-2xl text-xs border flex items-start",
              conflict.conflictType === 'OVERLAP' ? "bg-red-50 border-red-100 text-red-600" : "bg-orange-50 border-orange-100 text-orange-600"
            )}>
              {conflict.conflictType === 'OVERLAP' ? (
                <AlertTriangle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-black uppercase tracking-wider mb-1">
                  {conflict.conflictType === 'OVERLAP' ? 'Trùng lịch làm việc' : 'Thiếu thời gian nghỉ'}
                </p>
                <p className="font-medium opacity-80">{conflict.detail}</p>
              </div>
            </div>
          ) : watchedValues.employeeId && watchedValues.employeeId !== 0 ? (
            <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-xs flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="font-black uppercase tracking-wider">Nhân viên sẵn sàng</span>
            </div>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Thêm ghi chú nếu có..." {...field} className="rounded-2xl border-gray-100 min-h-[100px] focus:ring-orange-500" disabled={!isEditable} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attendance Adjustment Section */}
        {(isMissed || isMissingOut) && (
          <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-[2.5rem] space-y-4 animate-in fade-in slide-in-from-bottom-2 shadow-inner">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Chỉnh sửa giờ công</h3>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Cập nhật dữ liệu chấm công thực tế</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Giờ vào thực tế</label>
                <Input 
                  type="time" 
                  value={adminCheckIn} 
                  onChange={(e) => setAdminCheckIn(e.target.value)}
                  className="rounded-2xl border-gray-100 h-12 bg-white focus:ring-orange-500 font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Giờ ra thực tế</label>
                <Input 
                  type="time" 
                  value={adminCheckOut} 
                  onChange={(e) => setAdminCheckOut(e.target.value)}
                  className="rounded-2xl border-gray-100 h-12 bg-white focus:ring-orange-500 font-mono text-sm"
                />
              </div>
            </div>

            <Button 
              type="button"
              onClick={handleUpdateAttendance}
              disabled={isUpdatingAttendance || (!adminCheckIn && !adminCheckOut)}
              className="w-full bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-black rounded-2xl h-12 shadow-sm transition-all"
            >
              {isUpdatingAttendance ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Xác nhận cập nhật giờ công
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-50">
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold text-gray-400 hover:text-gray-600">
            Huỷ
          </Button>

          {isCancellable && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancelShift}
              disabled={isLoading}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold px-6"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Hủy ca
            </Button>
          )}

          {isHardDeletable && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleHardDelete}
              disabled={isLoading}
              className="bg-red-50 text-red-600 hover:bg-red-100 border-none rounded-xl font-black px-6"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa vĩnh viễn
            </Button>
          )}

          {isUnassignable && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleUnassign}
              disabled={isLoading}
              className="border-red-100 text-red-500 hover:bg-red-50 rounded-xl font-bold px-6"
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Gỡ nhân viên
            </Button>
          )}

          {isEditable && (
            <Button 
              type="submit" 
              disabled={isLoading || isButtonDisabled || (isPublished && (!watchedValues.employeeId || watchedValues.employeeId === 0))}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-100 px-8"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (initialData?.id ? '💾 Cập nhật' : '💾 Tạo ca')}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

export default ShiftForm
