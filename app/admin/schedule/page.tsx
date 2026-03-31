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
  GripHorizontal
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
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null)

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
      setShiftsByEmployee(res.data)
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
    setActiveEmployee(active.data.current.employee)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveEmployee(null)

    if (!over) return

    const employee = active.data.current?.employee as Employee
    const overId = over.id as string // format: slot-{employeeId}-{date}

    if (!overId.startsWith('slot-') || !employee) return

    const parts = overId.split('-')
    const targetEmployeeId = parseInt(parts[1])
    const targetDate = parts[2]

    // 1. Optimistic Update UI
    // Note: Since assigning is actually creating a shift or updating, 
    // we show a temporary badge or trigger the form.
    // In this specific flow, we trigger the ShiftForm with pre-filled data
    setSelectedSlot({ employeeId: targetEmployeeId, date: new Date(targetDate) })
    setSelectedShift(null)
    setIsShiftDialogOpen(true)
    
    toast.info(`Đang gán ${employee.fullName} vào ngày ${format(new Date(targetDate), 'dd/MM')}`)
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
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-4 flex items-center justify-between shadow-sm">
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
                Kéo thả nhân sự để sắp xếp lịch trình
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
          {/* Left Sidebar: Employee List */}
          <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Tìm nhân viên..." 
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-medium"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Danh sách nhân sự ({filteredEmployeesList.length})</span>
                <GripHorizontal className="w-4 h-4 text-gray-300" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredEmployeesList.map(emp => (
                <DraggableEmployeeCard key={emp.id} employee={emp} />
              ))}
              {filteredEmployeesList.length === 0 && (
                <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase italic">
                  Không tìm thấy nhân viên
                </div>
              )}
            </div>
          </div>

          {/* Main Board Area */}
          <div className="flex-1 overflow-auto bg-[#fcfdfe] p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
              {/* Toolbar */}
              <Card className="p-4 bg-white shadow-sm border-gray-100 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={handlePrev} className="h-10 w-10 rounded-xl border-gray-100 hover:bg-orange-50 hover:text-orange-600">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="min-w-[200px] text-center">
                    <div className="text-sm font-black text-gray-800">Tuần {currentWeekStr.split('-W')[1]}, {currentWeekStr.split('-W')[0]}</div>
                    <div className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">{formatWeekRange(currentDate)}</div>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleNext} className="h-10 w-10 rounded-xl border-gray-100 hover:bg-orange-50 hover:text-orange-600">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Bộ lọc:</span>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger className="w-[200px] h-10 text-sm bg-gray-50/50 border-gray-100 rounded-xl font-bold">
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
              </Card>

              {/* Grid Board */}
              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="p-5 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 border-r border-gray-100 w-[240px] sticky left-0 bg-white z-10">Nhân sự</th>
                        {days.map(day => {
                          const isToday = formatToISODate(day) === formatToISODate(new Date())
                          return (
                            <th key={day.toISOString()} className={cn("p-5 text-center border-r border-gray-100 min-w-[160px]", isToday && "bg-orange-50/20")}>
                              <div className={cn("text-[9px] font-black uppercase tracking-[0.2em] mb-1", isToday ? "text-orange-500" : "text-gray-400")}>
                                {format(day, 'EEEE', { locale: vi })}
                              </div>
                              <div className={cn("text-lg font-black", isToday ? "text-orange-600" : "text-gray-800")}>
                                {format(day, 'dd/MM')}
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
                          <tr key={emp.id} className="border-b border-gray-50 group hover:bg-gray-50/30 transition-colors">
                            <td className="p-5 border-r border-gray-100 sticky left-0 bg-white z-10 shadow-[8px_0_12px_-8px_rgba(0,0,0,0.05)]">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-100 uppercase">
                                  {emp.fullName.substring(0, 2)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-black text-gray-800 text-[14px] truncate">{emp.fullName}</span>
                                  <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest truncate">{emp.department || 'Nhân sự'}</span>
                                </div>
                              </div>
                            </td>
                            {days.map(day => {
                              const dateStr = formatToISODate(day)
                              const dayShifts = (shiftsByEmployee[String(emp.id)] || []).filter(s => s.shiftDate === dateStr)
                              
                              return (
                                <td key={`${emp.id}-${dateStr}`} className="p-2 border-r border-gray-50 align-top group/cell">
                                  <ShiftSlot id={`slot-${emp.id}-${dateStr}`}>
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

              {/* Legend */}
              <div className="flex items-center gap-6 pt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4CAF50]"></div><span>Bình thường</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF9800]"></div><span>Ngày lễ</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#F44336]"></div><span>Tăng ca</span></div>
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
          {activeId && activeEmployee && (
            <div className="bg-white p-3 rounded-2xl border-2 border-orange-500 shadow-2xl flex items-center gap-3 scale-105 rotate-2">
               <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">
                {activeEmployee.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800 text-xs">{activeEmployee.fullName}</span>
                <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Đang gán ca...</span>
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
                <DialogTitle className="text-2xl font-black tracking-tight">{selectedShift ? 'CẬP NHẬT CA LÀM' : 'THIẾT LẬP CA MỚI'}</DialogTitle>
                <DialogDescription className="text-orange-100 text-[10px] uppercase tracking-widest font-black mt-2 opacity-80">
                  {selectedShift ? `Mã ca: #${selectedShift.id}` : 'Xác nhận thông tin gán nhân sự'}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 bg-white">
              <ShiftForm 
                initialData={selectedShift ? {
                  ...selectedShift,
                  shiftDate: new Date(selectedShift.shiftDate)
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
