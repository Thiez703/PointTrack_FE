'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  ShiftType, 
  ShiftConflictResponse,
  AvailableEmployee
} from '@/app/types/attendance.schema'
import { SchedulingService, ShiftTemplate } from '@/app/services/scheduling.service'
import { AdminService } from '@/app/services/admin.service'
import { customerService } from '@/app/services/customer.service'
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
import { CalendarIcon, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { calculateShiftDuration, formatToISODate } from '@/lib/dateUtils'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'

const shiftSchema = z.object({
  employeeId: z.coerce.number().min(1, 'Vui lòng chọn nhân viên'),
  customerId: z.coerce.number().min(1, 'Vui lòng chọn khách hàng'),
  templateId: z.coerce.number().optional(),
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
  initialData?: Partial<ShiftFormValues> & { id?: number, note?: string }
  onSuccess: () => void
  onCancel: () => void
}

const ShiftForm: React.FC<ShiftFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingConflict, setIsCheckingConflict] = useState(false)
  const [conflict, setConflict] = useState<ShiftConflictResponse | null>(null)
  const [availableEmployees, setAvailableEmployees] = useState<AvailableEmployee[]>([])
  const [showAvailable, setShowAvailable] = useState(false)

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      employeeId: initialData?.employeeId || 0,
      customerId: initialData?.customerId || 0,
      templateId: initialData?.templateId,
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
        console.log('Fetching form data for ShiftForm...');
        const [empRes, custRes, tempRes] = await Promise.all([
          AdminService.getPersonnel({ size: 100 }).catch(e => { console.error('AdminService.getPersonnel error:', e); throw e; }),
          customerService.getActiveWithGps().catch(e => { console.error('customerService.getActiveWithGps error:', e); throw e; }),
          SchedulingService.getShiftTemplates().catch(e => { console.error('SchedulingService.getShiftTemplates error:', e); throw e; })
        ])
        
        console.log('Form data fetched successfully:', { 
          employeesCount: empRes.data?.content?.length, 
          customersCount: custRes.data?.length, 
          templatesCount: tempRes.data?.length 
        });

        setEmployees(empRes.data.content || [])
        setCustomers(custRes.data || [])
        setTemplates(tempRes.data)
      } catch (error: any) {
        console.error('General error fetching form data:', error?.message || error);
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
        }
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const checkConflict = async () => {
      const { employeeId, shiftDate, startTime, endTime, shiftType } = debouncedValues
      console.log('Debounced values for conflict check:', { employeeId, shiftDate, startTime, endTime, shiftType })
      if (employeeId && shiftDate && startTime && endTime) {
        setIsCheckingConflict(true)
        try {
          const res = await SchedulingService.checkConflict({
            employeeId,
            shiftDate: formatToISODate(shiftDate),
            startTime,
            endTime,
            shiftType: shiftType as ShiftType,
            excludeShiftId: initialData?.id
          })
          setConflict(res.data)
        } catch (error: any) {
          console.error('Conflict check error:', error?.message || error)
          if (error.response) {
            console.error('Error response data:', error.response.data)
          }
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

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === Number(templateId))
    if (template) {
      form.setValue('startTime', template.defaultStart.substring(0, 5))
      form.setValue('endTime', template.defaultEnd.substring(0, 5))
      form.setValue('shiftType', template.shiftType)
    }
  }

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

  const onSubmit = async (values: ShiftFormValues) => {
    if (conflict?.hasConflict && conflict.conflictType === 'OVERLAP') {
      toast.error('Không thể tạo ca do trùng lịch!')
      return
    }
    
    if (conflict?.hasConflict && conflict.conflictType === 'BUFFER' && values.shiftType !== ShiftType.OT_EMERGENCY) {
      toast.error('Thiếu thời gian nghỉ giữa 2 ca!')
      return
    }

    setIsLoading(true)
    try {
      await SchedulingService.createShift({
        ...values,
        shiftDate: formatToISODate(values.shiftDate)
      })
      toast.success('Tạo ca làm việc thành công')
      onSuccess()
    } catch (error: any) {
      const detail = error.response?.data?.detail
      toast.error(detail || 'Có lỗi xảy ra khi tạo ca')
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
                <FormLabel>Nhân viên *</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={String(emp.id)}>
                        {emp.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <Button 
                  type="button" 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto text-xs"
                  onClick={findAvailableEmployees}
                >
                  Tìm nhân viên rảnh
                </Button>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khách hàng *</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khách hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ca mẫu (tuỳ chọn)</FormLabel>
                <Select 
                  onValueChange={(val) => {
                    field.onChange(val)
                    handleTemplateChange(val)
                  }} 
                  value={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca mẫu" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {templates.map(temp => (
                      <SelectItem key={temp.id} value={String(temp.id)}>
                        {temp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                        className={cn(
                          "w-full pl-3 text-left font-normal",
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
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ShiftType.NORMAL} />
                    </FormControl>
                    <FormLabel className="font-normal">Ca thường</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ShiftType.HOLIDAY} />
                    </FormControl>
                    <FormLabel className="font-normal">Ca Lễ/Tết</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={ShiftType.OT_EMERGENCY} />
                    </FormControl>
                    <FormLabel className="font-normal">OT đột xuất</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giờ bắt đầu *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giờ kết thúc *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="text-sm font-medium text-muted-foreground">
          Thời lượng: {duration} phút
        </div>

        {/* Conflict Check Results */}
        <div className="min-h-[60px]">
          {isCheckingConflict ? (
            <div className="flex items-center text-sm text-muted-foreground animate-pulse">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Đang kiểm tra lịch trùng...
            </div>
          ) : conflict?.hasConflict ? (
            <div className={cn(
              "p-3 rounded-md text-sm border flex items-start",
              conflict.conflictType === 'OVERLAP' ? "bg-red-50 border-red-200 text-red-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"
            )}>
              {conflict.conflictType === 'OVERLAP' ? (
                <AlertTriangle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {conflict.conflictType === 'OVERLAP' ? '🔴 TRÙNG GIỜ:' : '🟡 THIẾU BUFFER:'}
                </p>
                <p>{conflict.detail}</p>
                {conflict.conflictType === 'BUFFER' && watchedValues.shiftType === ShiftType.OT_EMERGENCY && (
                  <p className="mt-1 font-medium italic">⚠️ Ca OT có thể tiếp tục tạo.</p>
                )}
              </div>
            </div>
          ) : watchedValues.employeeId ? (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Nhân viên rảnh vào khung giờ này
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
                <Textarea placeholder="Thêm ghi chú nếu có..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Available Employees Popup/List */}
        {showAvailable && (
          <div className="p-3 border rounded-md bg-muted/50 max-h-[150px] overflow-y-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase">Nhân viên rảnh ({availableEmployees.length})</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowAvailable(false)}>×</Button>
            </div>
            {availableEmployees.length === 0 ? (
              <p className="text-xs text-muted-foreground">Không có nhân viên nào rảnh</p>
            ) : (
              <ul className="space-y-1">
                {availableEmployees.map(emp => (
                  <li key={emp.employeeId} className="flex justify-between items-center text-xs">
                    <span>{emp.employeeName} ({emp.phoneNumber}) - Ca trước: {emp.nextShiftEndTime || 'Không có'}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 px-2 text-[10px]"
                      onClick={() => {
                        form.setValue('employeeId', emp.employeeId)
                        setShowAvailable(false)
                      }}
                    >
                      Chọn
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Huỷ
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || isButtonDisabled}
            className={cn(isButtonDisabled && "bg-gray-400")}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {initialData?.id ? '💾 Cập nhật' : '💾 Tạo ca'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ShiftForm
