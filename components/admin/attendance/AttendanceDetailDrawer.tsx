import React from 'react'
import { AttendanceRecord, AttendanceStatus } from '@/app/types/attendance'
import { AttendanceService } from '@/app/services/attendance.service'
import { SchedulingService } from '@/app/services/scheduling.service'
// ... (other imports)
import { 
  Clock, 
  MapPin, 
  User, 
  Briefcase, 
  CalendarDays, 
  ArrowRightCircle, 
  CheckCircle2,
  StickyNote,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface DetailDrawerProps {
  record: AttendanceRecord | null
  open: boolean
  onClose: () => void
  onUpdateNote: (id: string, note: string) => Promise<any>
  isUpdating: boolean
  onRefresh?: () => void
}

const DetailItem = ({ icon: Icon, label, value, colorClass }: any) => (
// ...
)

const AttendanceDetailDrawer: React.FC<DetailDrawerProps> = ({ record, open, onClose, onUpdateNote, isUpdating, onRefresh }) => {
  const [note, setNote] = React.useState('')
  const [adminCheckIn, setAdminCheckIn] = React.useState('')
  const [adminCheckOut, setAdminCheckOut] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)

  React.useEffect(() => {
    if (record) {
      setNote(record.note || '')
      setAdminCheckIn(record.checkIn.time || '')
      setAdminCheckOut(record.checkOut.time || '')
    }
  }, [record])

  if (!record) return null

  const isMissed = record.status === 'missed'
  const isMissingOut = record.status === 'missing_out'

  const handleSaveNote = async () => {
    await onUpdateNote(record.id, note)
  }

  const handleUpdateAttendance = async () => {
    setIsProcessing(true)
    try {
      await AttendanceService.adminUpdate(Number(record.id), {
        checkInTime: adminCheckIn || null,
        checkOutTime: adminCheckOut || null,
        status: isMissed ? 'MISSED' : isMissingOut ? 'MISSING_OUT' : null
      })
      toast.success('Cập nhật giờ công thành công')
      onRefresh?.()
    } catch (error: any) {
      toast.error('Lỗi khi cập nhật giờ công')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelShift = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy ca này?')) return
    setIsProcessing(true)
    try {
      // Giả định record.id ở đây là attendance record id, 
      // nhưng SchedulingService.cancelShift cần shift id.
      // AttendanceRecord trong types/attendance.ts có shift: AttendanceShift
      await SchedulingService.cancelShift(Number(record.shift.id))
      toast.success('Đã hủy ca làm việc')
      onClose()
      onRefresh?.()
    } catch (error: any) {
      toast.error('Lỗi khi hủy ca')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
// ...
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l overflow-y-auto">
        <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-8 text-white relative">
          <SheetHeader className="text-left">
            <SheetTitle className="text-white text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              Chi tiết Chấm công
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-8 flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
              <AvatarImage src={record.employee.avatar || ''} />
              <AvatarFallback className="text-3xl font-bold bg-white text-orange-500">
                {record.employee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold leading-tight">{record.employee.name}</h2>
              <p className="text-white/80 font-medium">{record.employee.department}</p>
              <Badge variant="secondary" className="mt-2 w-fit bg-white/20 text-white border-none backdrop-blur-md">
                {record.employee.code}
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <DetailItem 
              icon={CalendarDays} 
              label="Ngày làm việc" 
              value={`${format(new Date(record.date), 'dd/MM/yyyy')} (${format(new Date(record.date), 'EEEE', { locale: vi })})`}
              colorClass="bg-blue-100 text-blue-600"
            />
            <DetailItem 
              icon={MapPin} 
              label="Địa điểm & Ca làm" 
              value={`${record.location.name} - ${record.shift.name}`}
              colorClass="bg-red-100 text-red-600"
            />
          </div>

          <div className="relative p-6 border rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="absolute left-10 top-16 bottom-16 w-0.5 bg-gradient-to-b from-blue-400 to-green-400 opacity-20" />
            
            <div className="space-y-12">
              {/* Check In */}
              <div className="relative flex items-center gap-6 group">
                <div className="relative z-10 w-10 h-10 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                  <ArrowRightCircle className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-blue-500 uppercase">Giờ Vào</span>
                  <span className="text-xl font-mono font-bold text-gray-800">{record.checkIn.time || '--:--'}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                      {record.checkIn.method || 'N/A'}
                    </Badge>
                    {record.checkIn.lateMinutes ? (
                      <span className="text-xs text-red-500 font-medium">Trễ {record.checkIn.lateMinutes} phút</span>
                    ) : (
                      <span className="text-xs text-green-500 font-medium">Đúng giờ</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Check Out */}
              <div className="relative flex items-center gap-6 group">
                <div className="relative z-10 w-10 h-10 rounded-full bg-green-100 border-4 border-white shadow-md flex items-center justify-center text-green-600 transition-transform group-hover:scale-110">
                  <ArrowRightCircle className="w-5 h-5 rotate-180" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-green-500 uppercase">Giờ Ra</span>
                  <span className="text-xl font-mono font-bold text-gray-800">{record.checkOut.time || '--:--'}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                      {record.checkOut.method || 'N/A'}
                    </Badge>
                    {record.checkOut.earlyMinutes ? (
                      <span className="text-xs text-yellow-500 font-medium">Sớm {record.checkOut.earlyMinutes} phút</span>
                    ) : (
                      record.checkOut.time && <span className="text-xs text-green-500 font-medium">Đúng giờ</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Adjustment Section */}
          {(isMissed || isMissingOut) && (
            <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl space-y-4 animate-in zoom-in-95 duration-300">
              <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                ĐIỀU CHỈNH GIỜ CÔNG (ADMIN)
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Giờ vào thực tế</label>
                  <Input 
                    type="time" 
                    value={adminCheckIn} 
                    onChange={(e) => setAdminCheckIn(e.target.value)}
                    className="bg-white border-red-100 rounded-xl h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Giờ ra thực tế</label>
                  <Input 
                    type="time" 
                    value={adminCheckOut} 
                    onChange={(e) => setAdminCheckOut(e.target.value)}
                    className="bg-white border-red-100 rounded-xl h-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold h-11 rounded-xl shadow-sm"
                  onClick={handleUpdateAttendance}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Cập nhật
                </Button>
                <Button 
                  variant="outline"
                  className="bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold h-11 rounded-xl px-4"
                  onClick={handleCancelShift}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2 mb-4">
              <StickyNote className="w-4 h-4 text-orange-500" />
              GHI CHÚ CHẤM CÔNG
            </h3>
            <Textarea
              placeholder="Nhập ghi chú hoặc phản hồi của nhân viên..."
              className="bg-white border-gray-200 min-h-[120px] rounded-xl focus:ring-orange-500/20"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <Button 
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-orange-200"
              onClick={handleSaveNote}
              disabled={isUpdating}
            >
              {isUpdating ? 'Đang lưu...' : 'Lưu Ghi chú'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default AttendanceDetailDrawer
