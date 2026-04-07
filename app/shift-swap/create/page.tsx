'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Calendar, 
  Gift, 
  Clock, 
  MapPin, 
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react'
import { useShiftSwap, useAvailableShifts, useAvailableEmployees } from '@/hooks/useShiftSwap'
import { SchedulingService } from '@/app/services/scheduling.service'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/useAuthStore'
import { ShiftSwapType } from '@/app/types/shift-swap.schema'
import { ShiftSchema, ShiftStatus } from '@/app/types/attendance.schema'
import { cn } from '@/lib/utils'
import { format, addDays, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const STEPS = [
  { id: 1, title: 'Loại đổi ca' },
  { id: 2, title: 'Chọn ca của bạn' },
  { id: 3, title: 'Chọn mục tiêu' },
  { id: 4, title: 'Xác nhận' }
]

const TODAY = new Date()
const TODAY_STR = format(TODAY, 'yyyy-MM-dd')

export default function CreateShiftSwapPage() {
  const router = useRouter()
  const { userInfo } = useAuthStore()
  const userId = userInfo?.userId || userInfo?.id
  const [currentStep, setCurrentStep] = useState(1)
  
  // Form State
  const [type, setType] = useState<ShiftSwapType | null>(null)
  const [myShift, setMyShift] = useState<ShiftSchema | null>(null)
  const [targetShift, setTargetShift] = useState<any | null>(null)
  const [targetEmployee, setTargetEmployee] = useState<any | null>(null)
  const [targetDate, setTargetDate] = useState<string>(TODAY_STR)
  const [reason, setReason] = useState('')
  const [employeeSearch, setEmployeeSearch] = useState('')

  const { createSwap, isCreating } = useShiftSwap()

  // Fetch upcoming shifts for Step 2
  const { data: upcomingShiftsData, isLoading: isLoadingShifts } = useQuery({
    queryKey: ['my-upcoming-shifts', userId],
    queryFn: () => SchedulingService.getShifts({
      employeeId: userId,
      startDate: TODAY_STR,
      endDate: format(addDays(TODAY, 14), 'yyyy-MM-dd')
    }),
    enabled: currentStep === 2 && !!userId
  })

  const upcomingShifts = useMemo(() => {
    return upcomingShiftsData?.data?.content?.filter(s => 
      s.status !== ShiftStatus.COMPLETED && 
      s.status !== ShiftStatus.CANCELLED &&
      !s.checkInTime
    ) || []
  }, [upcomingShiftsData])

  // Fetch target options for Step 3
  const { data: availShiftsData, isLoading: isLoadingAvailShifts } = useAvailableShifts({
    date: type === 'SAME_DAY' ? (myShift?.shiftDate || TODAY_STR) : targetDate,
    locationId: myShift?.customerId,
    excludeShiftId: myShift?.id
  })

  const { data: availEmployeesData, isLoading: isLoadingAvailEmployees } = useAvailableEmployees({
    shiftId: myShift?.id || 0,
    date: myShift?.shiftDate || TODAY_STR
  })

  const nextStep = () => {
    if (currentStep === 1 && !type) {
      toast.error('Vui lòng chọn loại đổi ca')
      return
    }
    if (currentStep === 2 && !myShift) {
      toast.error('Vui lòng chọn ca làm việc của bạn')
      return
    }
    if (currentStep === 3) {
      if ((type === 'SWAP' || type === 'SAME_DAY' || type === 'OTHER_DAY') && !targetShift) {
        toast.error('Vui lòng chọn ca muốn đổi sang')
        return
      }
      if (type === 'TRANSFER' && !targetEmployee) {
        toast.error('Vui lòng chọn nhân viên nhận ca')
        return
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => setCurrentStep(prev => prev - 1)

  const handleSubmit = async () => {
    if (reason.length < 10) {
      toast.error('Lý do phải ít nhất 10 ký tự')
      return
    }

    try {
      await createSwap({
        type: type!,
        myShiftId: myShift!.id,
        targetShiftId: targetShift?.id,
        targetEmployeeId: targetEmployee?.id || targetShift?.employeeId,
        targetDate: type === 'OTHER_DAY' ? targetDate : undefined,
        reason
      })
      router.push('/shift-swap')
    } catch (error) {
      // toast error handled in hook
    }
  }

  const renderStep1 = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        { id: 'SWAP', label: 'Hoán đổi', desc: 'Đổi ca với NV khác', icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'TRANSFER', label: 'Nhường ca', desc: 'Không lấy ca lại', icon: Gift, color: 'text-pink-500', bg: 'bg-pink-50' },
        { id: 'SAME_DAY', label: 'Ca khác', desc: 'Trong cùng ngày', icon: Calendar, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'OTHER_DAY', label: 'Ngày khác', desc: 'Đổi sang ngày mới', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' },
      ].map((item) => {
        const Icon = item.icon
        const isSelected = type === item.id
        return (
          <button
            key={item.id}
            onClick={() => setType(item.id as ShiftSwapType)}
            className={cn(
              "flex flex-col items-center justify-center p-6 rounded-[32px] border-2 transition-all gap-3 h-48",
              isSelected 
                ? "border-orange-500 bg-orange-50/50 shadow-lg shadow-orange-100" 
                : "border-gray-50 bg-white hover:border-gray-100"
            )}
          >
            <div className={cn("p-4 rounded-2xl shadow-sm", item.bg, item.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-black text-gray-900 leading-tight">{item.label}</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.desc}</p>
            </div>
            {isSelected && (
              <div className="absolute top-4 right-4 text-orange-500">
                <CheckCircle2 className="w-5 h-5 fill-orange-500 text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      {isLoadingShifts ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : upcomingShifts.length > 0 ? (
        upcomingShifts.map((shift) => {
          const isSelected = myShift?.id === shift.id
          return (
            <button
              key={shift.id}
              onClick={() => setMyShift(shift)}
              className={cn(
                "w-full p-5 rounded-[24px] border-2 transition-all text-left relative overflow-hidden",
                isSelected 
                  ? "border-orange-500 bg-orange-50 shadow-md scale-[1.02]" 
                  : "border-gray-50 bg-white"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", isSelected ? "bg-orange-200 text-orange-700" : "bg-gray-100 text-gray-400")}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-black text-gray-900">{shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}</span>
                </div>
                <Badge variant="outline" className="border-none bg-white/50 font-bold text-xs">
                  {format(parseISO(shift.shiftDate), 'dd/MM')}
                </Badge>
              </div>
              <p className="font-bold text-gray-800 line-clamp-1 mb-2">{shift.customerName}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{shift.customerAddress}</span>
              </div>
            </button>
          )
        })
      ) : (
        <div className="text-center py-10 px-6 bg-gray-50 rounded-3xl">
          <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-bold text-sm">Bạn không có ca làm việc nào sắp tới để đổi</p>
        </div>
      )}
    </div>
  )

  const renderStep3 = () => {
    if (type === 'SWAP') {
      return (
        <div className="space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm tên nhân viên..."
              className="h-12 pl-12 rounded-2xl border-gray-100 bg-white"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
          </div>

          <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Gợi ý ca có thể đổi</p>
          
          {isLoadingAvailEmployees ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : availEmployeesData?.data?.length ? (
            availEmployeesData.data.map((item: any) => {
              const isSelected = targetShift?.id === item.shiftId
              return (
                <button
                  key={item.shiftId}
                  onClick={() => setTargetShift({ id: item.shiftId, ...item })}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4",
                    isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-50 bg-white"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg">
                    {item.employeeName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-gray-900">{item.employeeName}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3 text-orange-500" />
                      <span>{item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                </button>
              )
            })
          ) : (
            <div className="text-center py-10 px-6 bg-gray-50 rounded-3xl">
              <Info className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-sm">Không tìm thấy ca nào phù hợp để hoán đổi</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-xl text-xs font-bold border-gray-200 h-9"
                onClick={() => setType('SAME_DAY')} // Fallback or suggest Admin
              >
                Gửi Admin sắp xếp giúp
              </Button>
            </div>
          )}
        </div>
      )
    }

    if (type === 'SAME_DAY' || type === 'OTHER_DAY') {
      return (
        <div className="space-y-4">
          {type === 'OTHER_DAY' && (
            <div className="mb-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Chọn ngày muốn đổi</p>
               <Input 
                type="date" 
                min={TODAY_STR}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="h-12 rounded-xl border-gray-100 font-bold"
               />
            </div>
          )}

          <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Ca làm trống</p>

          {isLoadingAvailShifts ? (
             <div className="flex justify-center py-10">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : availShiftsData?.data?.length ? (
            availShiftsData.data.map((shift: any) => {
              const isSelected = targetShift?.id === shift.id
              return (
                <button
                  key={shift.id}
                  onClick={() => setTargetShift(shift)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all text-left",
                    isSelected ? "border-orange-500 bg-orange-50 shadow-md" : "border-gray-50 bg-white"
                  )}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-black text-gray-900">{shift.name}</p>
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-lg">
                      Còn trống
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}</span>
                  </div>
                </button>
              )
            })
          ) : (
            <div className="text-center py-10 px-6 bg-gray-50 rounded-3xl">
              <Info className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-bold text-sm">Không có ca làm trống nào thời điểm này</p>
            </div>
          )}
        </div>
      )
    }

    if (type === 'TRANSFER') {
      return (
        <div className="space-y-4">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm tên nhân viên..."
              className="h-12 pl-12 rounded-2xl border-gray-100 bg-white"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />
          </div>

          <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Nhân viên có thể nhận</p>
          
          {/* Simulated list of employees for Transfer */}
          {[
            { id: 101, name: 'Nguyễn Văn A', code: 'NV001' },
            { id: 102, name: 'Trần Thị B', code: 'NV002' },
          ].map((emp) => {
            const isSelected = targetEmployee?.id === emp.id
            return (
              <button
                key={emp.id}
                onClick={() => setTargetEmployee(emp)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4",
                  isSelected ? "border-pink-500 bg-pink-50 shadow-md" : "border-gray-50 bg-white"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-black text-lg">
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">{emp.code}</p>
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-pink-500" />}
              </button>
            )
          })}
        </div>
      )
    }

    return null
  }

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-50 space-y-6">
        <h3 className="font-black text-gray-900 text-lg">Tóm tắt yêu cầu</h3>
        
        <div className="flex flex-col gap-4 relative">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ca của bạn</p>
            <p className="font-bold text-gray-800">{myShift?.name}</p>
            <p className="text-xs text-gray-500">{myShift?.startTime.slice(0, 5)} | {format(parseISO(myShift?.shiftDate || TODAY_STR), 'dd/MM')}</p>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10">
            <ChevronRight className="w-5 h-5 text-orange-500 rotate-90" />
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">
              {type === 'TRANSFER' ? 'Nhường cho' : 'Đổi sang'}
            </p>
            <p className="font-bold text-orange-900">
              {targetShift?.name || targetEmployee?.name || 'Admin sắp xếp'}
            </p>
            {targetShift && (
              <p className="text-xs text-orange-600/70">{targetShift.startTime.slice(0, 5)} | {format(parseISO(targetShift.shiftDate || targetDate), 'dd/MM')}</p>
            )}
            {targetEmployee && !targetShift && (
              <p className="text-xs text-orange-600/70">{targetEmployee.code}</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-black text-gray-800 flex items-center gap-2">
            Lý do đổi ca <span className="text-red-500">*</span>
          </label>
          <Textarea 
            placeholder="Ví dụ: Có việc gia đình đột xuất, cần người thay thế..."
            className="rounded-[20px] border-gray-100 bg-gray-50 focus-visible:ring-orange-500 min-h-[120px] p-4 font-medium"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            reason.length < 10 ? "text-gray-400" : "text-emerald-500"
          )}>
            Tối thiểu 10 ký tự ({reason.length}/10)
          </p>
        </div>
      </div>

      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
        <Info className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-xs text-orange-700 leading-relaxed font-medium">
          Yêu cầu sẽ được gửi tới {type === 'SWAP' || type === 'TRANSFER' ? 'nhân viên nhận' : 'quản lý'} để xét duyệt. Bạn sẽ nhận được thông báo khi có kết quả.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => currentStep > 1 ? prevStep() : router.back()}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Tạo yêu cầu</h1>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Bước {currentStep}/4: {STEPS[currentStep-1].title}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2">
          {STEPS.map((s) => (
            <div 
              key={s.id} 
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                s.id <= currentStep ? "bg-orange-500" : "bg-gray-100"
              )}
            />
          ))}
        </div>
      </div>

      <div className="px-6 mt-8 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-50 p-6 z-40">
        <div className="max-w-2xl mx-auto flex gap-4">
          {currentStep > 1 && (
            <Button 
              variant="outline"
              className="flex-1 h-14 rounded-2xl font-black text-gray-500 border-gray-100"
              onClick={prevStep}
              disabled={isCreating}
            >
              Quay lại
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button 
              className="flex-[2] h-14 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100"
              onClick={nextStep}
            >
              Tiếp theo
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button 
              className="flex-[2] h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-100"
              onClick={handleSubmit}
              disabled={isCreating}
            >
              {isCreating ? 'Đang gửi...' : 'Gửi yêu cầu'}
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
