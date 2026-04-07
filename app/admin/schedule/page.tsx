'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Copy, 
  Calendar as CalendarIcon,
  Users,
  Clock,
  ArrowLeft,
  CheckCircle2,
  LayoutGrid,
  Search,
  GripHorizontal,
  Briefcase
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'

import { SchedulingService } from '@/app/services/scheduling.service'
import { AdminService } from '@/app/services/admin.service'
import { ShiftSchema, ShiftStatus } from '@/app/types/attendance.schema'
import { Employee } from '@/app/types/admin.schema'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Components
const ShiftBadge = dynamic(() => import('@/components/admin/scheduling/ShiftBadge'), { ssr: false })
import ShiftForm from '@/components/admin/scheduling/ShiftForm'
import CopyWeekDialog from '@/components/admin/scheduling/CopyWeekDialog'
import { DraggableEmployeeCard } from '@/components/admin/scheduling/DraggableEmployeeCard'
import { ShiftSlot } from '@/components/admin/scheduling/ShiftSlot'

import { 
  getDaysInWeek, 
  formatWeekRange, 
  formatToISODate, 
  getWeekYearString
} from '@/lib/dateUtils'
import { addWeeks, subWeeks, format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function SchedulingPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shiftsByEmployee, setShiftsByEmployee] = useState<Record<string, ShiftSchema[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchEmployee, setSearchEmployee] = useState('')

  // Drag State
  const [activeId, setActiveId] = useState<string | null>(null)

  // Dialog states
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false)
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<ShiftSchema | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ employeeId: number, date: Date } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const days = useMemo(() => getDaysInWeek(currentDate), [currentDate])
  const currentWeekStr = useMemo(() => getWeekYearString(currentDate), [currentDate])

  useEffect(() => {
    setIsMounted(true)
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (isMounted) {
      fetchShifts()
    }
  }, [currentWeekStr, selectedEmployeeId, isMounted])

  const fetchEmployees = async () => {
    try {
      const res = await AdminService.getPersonnel({ size: 100 })
      setEmployees(res.data.content)
    } catch (error) {
      toast.error('Không thể tải danh sách nhân viên')
    }
  }

  const fetchShifts = async () => {
    setIsLoading(true)
    try {
      const empId = selectedEmployeeId === 'all' ? undefined : Number(selectedEmployeeId)
      const res = await SchedulingService.getShifts({ 
        week: currentWeekStr, 
        employeeId: empId 
      })
      setShiftsByEmployee(res.data as any)
    } catch (error) {
      toast.error('Không thể tải lịch làm việc')
    } finally {
      setIsLoading(false)
    }
  }

  // --- Drag & Drop Logic with Optimistic Update ---
  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const overId = over.id as string // format: slot-{employeeId}-{date}
    if (!overId.startsWith('slot-')) return

    const parts = overId.split('-')
    const targetEmployeeId = parseInt(parts[1])
    const targetDate = parts[2]

    // (Chỉ giữ lại logic kéo thả nhân viên nếu có, hiện tại code gốc chỉ xử lý template)
    // Nếu active là employee card, có thể triển khai gán nhanh ở đây
  }

  const handlePrev = () => setCurrentDate(subWeeks(currentDate, 1))
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1))

  const filteredEmployeesList = useMemo(() => {
    return employees.filter(e => 
      e.fullName.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(searchEmployee.toLowerCase())
    )
  }, [employees, searchEmployee])

  const filteredBoardEmployees = useMemo(() => {
    if (selectedEmployeeId === 'all') return employees
    return employees.filter(e => e.id === Number(selectedEmployeeId))
  }, [employees, selectedEmployeeId])

  if (!isMounted) return null

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-[#fcfdfe] pb-24 flex flex-col">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin")}
              className="rounded-full hover:bg-orange-50 text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-orange-500" />
                Bảng Phân Ca Thông Minh
              </h1>
              <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                Phân bổ nhân sự làm việc
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCopyDialogOpen(true)} className="border-gray-200 rounded-xl font-bold text-gray-600 h-10 px-4">
              <Copy className="w-4 h-4 mr-2" />
              Sao chép tuần
            </Button>
            <Button size="sm" onClick={() => { setSelectedSlot(null); setSelectedShift(null); setIsShiftDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-100 transition-all h-10 px-4">
              <Plus className="w-4 h-4 mr-2" />
              Tạo ca mới
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Employees */}
          <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 bg-orange-50/30">
               <p className="text-[9px] font-black text-orange-600 uppercase tracking-[0.2em]">Danh sách nhân sự</p>
            </div>
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Tìm nhân viên..." 
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-medium text-xs"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredEmployeesList.map(emp => (
                <DraggableEmployeeCard key={emp.id} employee={emp} />
              ))}
            </div>
          </div>

          {/* Main Board Area */}
          <div className="flex-1 overflow-auto bg-[#fcfdfe] p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                  <Button variant="ghost" size="icon" onClick={handlePrev} className="h-10 w-10 rounded-xl hover:bg-orange-50 hover:text-orange-600">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="px-6 text-center border-x border-gray-50">
                    <div className="text-sm font-black text-gray-800">Tuần {currentWeekStr.split('-W')[1]}, {currentWeekStr.split('-W')[0]}</div>
                    <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">{formatWeekRange(currentDate)}</div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleNext} className="h-10 w-10 rounded-xl hover:bg-orange-50 hover:text-orange-600">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white px-4 h-12 rounded-2xl border border-gray-100 shadow-sm gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                      <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0 font-bold text-sm h-full p-0">
                        <SelectValue placeholder="Tất cả nhân viên" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                        <SelectItem value="all" className="font-bold">Tất cả nhân viên</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={String(emp.id)} className="font-bold">{emp.fullName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Designer Board */}
              <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-gray-50/30">
                        <th className="p-6 text-left border-r border-gray-100 w-[280px] sticky left-0 bg-white/80 backdrop-blur-md z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
                             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Đội ngũ nhân sự</span>
                           </div>
                        </th>
                        {days.map(day => {
                          const isToday = formatToISODate(day) === formatToISODate(new Date())
                          return (
                            <th key={day.toISOString()} className={cn("p-6 text-center border-r border-gray-100 min-w-[160px]", isToday && "bg-orange-50/10")}>
                              <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", isToday ? "text-orange-500" : "text-gray-400")}>
                                {format(day, 'EEEE', { locale: vi })}
                              </div>
                              <div className={cn("w-10 h-10 mx-auto flex items-center justify-center rounded-2xl text-lg font-black transition-all", 
                                isToday ? "bg-orange-500 text-white shadow-lg shadow-orange-100 scale-110" : "text-gray-800")}>
                                {format(day, 'dd')}
                              </div>
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan={days.length + 1} className="p-40 text-center"><Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" /></td></tr>
                      ) : (
                        filteredBoardEmployees.map(emp => (
                          <tr key={emp.id} className="border-b border-gray-50 group transition-all duration-300">
                            <td className="p-6 border-r border-gray-100 sticky left-0 bg-white z-10 shadow-[8px_0_12px_-8px_rgba(0,0,0,0.05)] group-hover:bg-orange-50/30">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-orange-100 uppercase overflow-hidden">
                                    {emp.fullName.substring(0, 2)}
                                  </div>
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-black text-gray-800 text-[15px] truncate group-hover:text-orange-600 transition-colors">{emp.fullName}</span>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                     <Briefcase className="w-3 h-3 text-gray-300" />
                                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{emp.department || 'Phòng ban'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            {days.map(day => {
                              const dateStr = formatToISODate(day)
                              const dayShifts = (shiftsByEmployee[String(emp.id)] || []).filter(s => s.shiftDate === dateStr)
                              
                              return (
                                <td key={`${emp.id}-${dateStr}`} className="p-3 border-r border-gray-50 align-top group/cell hover:bg-orange-50/20 transition-colors">
                                  <ShiftSlot 
                                    id={`slot-${emp.id}-${dateStr}`}
                                    isOverClassName="bg-orange-100/50 border-orange-400 ring-4 ring-orange-50"
                                  >
                                    <div className="space-y-2">
                                      {dayShifts.map(shift => (
                                        <ShiftBadge 
                                          key={shift.id} 
                                          shift={shift} 
                                          onClick={() => {
                                            setSelectedShift(shift)
                                            setIsShiftDialogOpen(true)
                                          }} 
                                        />
                                      ))}
                                    </div>
                                  </ShiftSlot>
                                </td>
                              )
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Legend */}
              <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-8">
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 ring-4 ring-green-50"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ca Bình thường</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-50"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Ngày lễ / Tết</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-50"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Tăng ca (OT)</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay for smoother experience */}
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.4',
              },
            },
          }),
        }}>
          {activeId && activeId.startsWith('employee-') && (
            <div className="bg-white p-4 rounded-2xl border-2 border-orange-500 shadow-2xl flex items-center gap-4 scale-110 rotate-2 animate-in zoom-in-95">
               <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-sm uppercase">
                  {employees.find(e => `employee-${e.id}` === activeId)?.fullName.substring(0, 2)}
               </div>
               <div className="flex flex-col">
                  <span className="font-black text-gray-800 text-sm">{employees.find(e => `employee-${e.id}` === activeId)?.fullName}</span>
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Đang sắp xếp...</span>
               </div>
            </div>
          )}
        </DragOverlay>

        {/* Create/Edit Shift Dialog */}
        <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
          <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-[2.5rem]">
            <div className="bg-orange-500 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-black tracking-tight uppercase">
                  {selectedShift ? 'Cập nhật lịch trình' : 'Gán ca làm việc'}
                </DialogTitle>
                <DialogDescription className="text-orange-100 text-[10px] uppercase tracking-[0.2em] font-black mt-2 opacity-80">
                  {selectedShift ? `Mã ca: #${selectedShift.id}` : 'Xác nhận thông tin gán nhân sự'}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 bg-white">
              <ShiftForm 
                initialData={selectedShift ? {
                  ...selectedShift,
                  shiftDate: new Date(selectedShift.shiftDate),
                  employeeId: selectedShift.employeeId === null ? undefined : selectedShift.employeeId,
                  notes: selectedShift.notes === null ? undefined : selectedShift.notes
                } : {
                  employeeId: selectedSlot?.employeeId,
                  shiftDate: selectedSlot?.date
                }}
                onSuccess={() => {
                  setIsShiftDialogOpen(false)
                  fetchShifts()
                }}
                onCancel={() => setIsShiftDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>

        <CopyWeekDialog 
          isOpen={isCopyDialogOpen} 
          onClose={() => setIsCopyDialogOpen(false)} 
          currentWeek={currentWeekStr} 
          onSuccess={fetchShifts}
        />
      </div>
    </DndContext>
  )
}


const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

