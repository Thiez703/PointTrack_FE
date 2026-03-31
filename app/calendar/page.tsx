'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Building2, 
  Sun, 
  Moon, 
  Sunset,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Info,
  ArrowRight
} from 'lucide-react'
import { SchedulingService } from '@/app/services/scheduling.service'
import { ShiftStatus, type ShiftSchema } from '@/app/types/attendance.schema'
import { cn } from '@/lib/utils'
import { format, addDays, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { formatToISODate, getDaysInWeek } from '@/lib/dateUtils'

// --- Helpers ---
function getShiftPeriod(startTime: string): 'Sáng' | 'Chiều' | 'Đêm' {
  const h = parseInt(startTime.split(':')[0])
  if (h >= 5 && h < 12) return 'Sáng'
  if (h >= 12 && h < 18) return 'Chiều'
  return 'Đêm'
}

const TODAY = new Date()
const TODAY_STR = format(TODAY, 'yyyy-MM-dd')

const shiftIcons = { Sáng: Sun, Chiều: Sunset, Đêm: Moon } as const

const statusThemes = {
  [ShiftStatus.ASSIGNED]: {
    bg: 'bg-green-50/50',
    border: 'border-green-100',
    text: 'text-green-700',
    accent: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
    label: 'Đã gán'
  },
  [ShiftStatus.CONFIRMED]: {
    bg: 'bg-blue-50/50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    accent: 'bg-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Đã xác nhận'
  },
  [ShiftStatus.IN_PROGRESS]: {
    bg: 'bg-orange-50/50',
    border: 'border-orange-100',
    text: 'text-orange-700',
    accent: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Đang làm'
  },
  [ShiftStatus.COMPLETED]: {
    bg: 'bg-gray-50/50',
    border: 'border-gray-100',
    text: 'text-gray-700',
    accent: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-700',
    label: 'Hoàn thành'
  },
  [ShiftStatus.MISSED]: {
    bg: 'bg-red-50/50',
    border: 'border-red-100',
    text: 'text-red-700',
    accent: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    label: 'Vắng mặt'
  },
  [ShiftStatus.CANCELLED]: {
    bg: 'bg-slate-50/50',
    border: 'border-slate-100',
    text: 'text-slate-700',
    accent: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700',
    label: 'Đã hủy'
  },
  // Default for others
  default: {
    bg: 'bg-blue-50/50',
    border: 'border-blue-100',
    text: 'text-blue-700',
    accent: 'bg-blue-500',
    badge: 'bg-blue-100 text-blue-700',
    label: 'Ca làm'
  }
} as const

const WEEKDAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export default function CalendarPage() {
  const { userInfo } = useAuthStore()
  const userId = userInfo?.userId || userInfo?.id
  const router = useRouter()
  const queryClient = useQueryClient()

  const [viewMode, setViewMode] = useState<'month' | 'week'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_STR)
  const scrollRef = useRef<HTMLDivElement>(null)

  const days = getDaysInWeek(currentDate)
  const startDate = formatToISODate(days[0])
  const endDate = formatToISODate(days[6])

  const { data: shiftsResponse, isLoading: shiftsLoading } = useQuery({
    queryKey: ["shifts", "calendar", userId, startDate, endDate],
    queryFn: () => SchedulingService.getShifts({
      employeeId: userId,
      startDate,
      endDate,
    }),
    enabled: !!userId,
  })

  const confirmMutation = useMutation({
    mutationFn: (shiftId: number) => SchedulingService.confirmShift(shiftId),
    onSuccess: () => {
      toast.success('Đã xác nhận ca làm việc!')
      queryClient.invalidateQueries({ queryKey: ['shifts', 'calendar'] })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể xác nhận ca làm việc')
    }
  })

  const shiftsByDate = useMemo(() => {
    const map: Record<string, ShiftSchema[]> = {}
    const content = shiftsResponse?.data?.content || []
    content.forEach(s => {
      if (!map[s.shiftDate]) map[s.shiftDate] = []
      map[s.shiftDate].push(s)
    })
    return map
  }, [shiftsResponse])

  // Week days for scroller
  const weekDays = useMemo(() => {
    return getDaysInWeek(currentDate)
  }, [currentDate])

  // Calendar days for month view
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const daysInMonth = eachDayOfInterval({ start, end })
    
    const firstDayIndex = start.getDay() // 0 (Sun) to 6 (Sat)
    const days: Array<Date | null> = []
    
    for (let i = 0; i < firstDayIndex; i++) days.push(null)
    daysInMonth.forEach(d => days.push(d))
    
    return days
  }, [currentDate])

  const selectedShifts = useMemo(() =>
    selectedDate ? (shiftsByDate[selectedDate] ?? []) : []
  , [selectedDate, shiftsByDate])

  useEffect(() => {
    if (viewMode === 'week') {
      const el = document.getElementById(`date-${selectedDate}`)
      if (el && scrollRef.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    }
  }, [selectedDate, viewMode])

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else {
      setCurrentDate(addDays(currentDate, 7))
    }
  }

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else {
      setCurrentDate(addDays(currentDate, -7))
    }
  }

  const renderShiftCard = (shift: ShiftSchema, index: number) => {
    const period = getShiftPeriod(shift.startTime)
    const theme = (statusThemes[shift.status] || statusThemes.default) as typeof statusThemes.default
    const Icon = shiftIcons[period]
    
    return (
      <motion.div
        key={shift.id}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
      >
        <Card className={cn("overflow-hidden border-none shadow-sm mb-4", theme.bg)}>
          <CardContent className="p-0">
            <div className={cn("h-1.5 w-full", theme.accent)} />
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2.5 rounded-2xl bg-white shadow-sm", theme.text)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">Ca {period}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={cn("font-bold border-none", theme.badge)}>
                  {theme.label}
                </Badge>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-100/50">
                {shift.customerName && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 p-1 rounded-lg bg-gray-100 text-gray-400">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Khách hàng</p>
                      <p className="font-semibold text-gray-700">{shift.customerName}</p>
                    </div>
                  </div>
                )}
                {(shift.notes || shift.customerAddress) && (
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 p-1 rounded-lg bg-gray-100 text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Địa chỉ / Ghi chú</p>
                      <p className="text-gray-600 line-clamp-2">{shift.customerAddress || shift.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                <button className="flex-1 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5 text-orange-500" />
                  Chi tiết
                </button>
                {shift.status === ShiftStatus.ASSIGNED && (
                  <button 
                    onClick={() => confirmMutation.mutate(shift.id)}
                    disabled={confirmMutation.isPending}
                    className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {confirmMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận ca'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {(shift.status === ShiftStatus.CONFIRMED || shift.status === ShiftStatus.IN_PROGRESS) && (
                  <button 
                    onClick={() => router.push('/checkin')}
                    className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {shift.status === ShiftStatus.IN_PROGRESS ? 'Check-out' : 'Check-in ngay'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Header Section */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Lịch làm việc</h1>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">Hôm nay, {format(TODAY, 'dd MMMM', { locale: vi })}</p>
          </div>
          <button 
            onClick={() => {
              setCurrentDate(new Date())
              setSelectedDate(TODAY_STR)
            }}
            className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors"
          >
            <CalendarIcon className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="bg-gray-100/80 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => setViewMode('week')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] text-sm font-bold transition-all",
              viewMode === 'week' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
            )}
          >
            <List className="w-4 h-4" />
            Theo tuần
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[14px] text-sm font-bold transition-all",
              viewMode === 'month' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            Theo tháng
          </button>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-5xl mx-auto">
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevPeriod}
            className="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-black text-gray-800">
            {viewMode === 'month' 
              ? format(currentDate, 'MMMM, yyyy', { locale: vi })
              : `Tháng ${format(currentDate, 'MM / yyyy', { locale: vi })}`
            }
          </h2>
          <button
            onClick={nextPeriod}
            className="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week View: Horizontal Scroller */}
        {viewMode === 'week' && (
          <div className="mb-8">
            <div 
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1"
            >
              {weekDays.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const isSelected = selectedDate === dateStr
                const isToday = isSameDay(date, TODAY)
                const hasShifts = (shiftsByDate[dateStr]?.length || 0) > 0
                
                return (
                  <button
                    key={dateStr}
                    id={`date-${dateStr}`}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-[24px] transition-all relative shrink-0",
                      isSelected 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-100 scale-105" 
                        : isToday
                        ? "bg-orange-50 text-orange-600 border border-orange-200"
                        : "bg-white border border-gray-100 text-gray-400"
                    )}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">
                      {WEEKDAYS_SHORT[date.getDay()]}
                    </span>
                    <span className="text-lg font-black">{date.getDate()}</span>
                    {hasShifts && !isSelected && (
                      <div className="absolute bottom-2 flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-orange-400" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Month View: Grid */}
        {viewMode === 'month' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="grid grid-cols-7 gap-2 mb-3">
              {WEEKDAYS_SHORT.map(wd => (
                <div key={wd} className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">{wd}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, i) => {
                if (!date) return <div key={`empty-${i}`} className="aspect-square" />
                
                const dateStr = format(date, 'yyyy-MM-dd')
                const isSelected = selectedDate === dateStr
                const isToday = isSameDay(date, TODAY)
                const shifts = shiftsByDate[dateStr] || []
                const hasShifts = shifts.length > 0
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-2xl transition-all relative",
                      isSelected 
                        ? "bg-orange-500 text-white shadow-md z-10 scale-110" 
                        : isToday
                        ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200"
                        : hasShifts
                        ? "bg-gray-50 text-gray-800"
                        : "text-gray-400 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-xs font-bold">{date.getDate()}</span>
                    {hasShifts && (
                      <div className="flex gap-0.5 mt-1">
                        {shifts.slice(0, 3).map((s, si) => {
                          const statusTheme = (statusThemes[s.status] || statusThemes.default) as typeof statusThemes.default
                          return (
                            <div 
                              key={si} 
                              className={cn(
                                "w-1 h-1 rounded-full",
                                isSelected ? "bg-white" : statusTheme.accent
                              )} 
                            />
                          )
                        })}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Selected Day Content */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">
              {isSameDay(parseISO(selectedDate), TODAY) ? 'Ca làm hôm nay' : `Lịch ngày ${format(parseISO(selectedDate), 'dd/MM')}`}
            </h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {selectedShifts.length} Ca làm
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {shiftsLoading ? (
                <div className="flex justify-center py-10">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : selectedShifts.length > 0 ? (
                selectedShifts.map((s, i) => renderShiftCard(s, i))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <CalendarIcon className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold text-sm">Nghỉ ngơi thôi!</p>
                  <p className="text-gray-300 text-[10px] uppercase tracking-widest mt-1">Không có lịch làm việc cho ngày này</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
