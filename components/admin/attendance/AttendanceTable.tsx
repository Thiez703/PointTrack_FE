import React from 'react'
import { AttendanceRecord, AttendanceStatus } from '@/app/types/attendance'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, Edit, MapPin, QrCode, Keyboard, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface AttendanceTableProps {
  records: AttendanceRecord[]
  isLoading: boolean
  onView: (record: AttendanceRecord) => void
  onEditNote: (record: AttendanceRecord) => void
}

const MethodIcon = ({ method }: { method: string | null }) => {
  switch (method) {
    case 'gps': return <MapPin className="w-3 h-3 text-blue-500" title="GPS" />
    case 'qr': return <QrCode className="w-3 h-3 text-green-500" title="QR Code" />
    case 'manual': return <Keyboard className="w-3 h-3 text-gray-500" title="Thủ công" />
    default: return null
  }
}

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
  const configs = {
    on_time: { label: 'Đúng giờ', className: 'bg-green-100 text-green-700 border-green-200' },
    late: { label: 'Đi trễ', className: 'bg-red-100 text-red-700 border-red-200' },
    early_leave: { label: 'Về sớm', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    absent: { label: 'Vắng mặt', className: 'bg-gray-100 text-gray-700 border-gray-200' },
    overtime: { label: 'Tăng ca', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    missed: { label: 'Vắng mặt', className: 'bg-red-50 text-red-500 border-red-200' },
    missing_out: { label: 'Thiếu check-out', className: 'bg-orange-600 text-white border-orange-700' },
    "": { label: 'N/A', className: '' }
  }
  const config = configs[status as keyof typeof configs] || configs[""]
  return (
    <Badge variant="outline" className={cn("px-2 py-0.5 rounded-full font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ records, isLoading, onView, onEditNote }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border rounded-xl shadow-sm">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-12 h-12 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Không tìm thấy dữ liệu chấm công</p>
      </div>
    )
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-12 text-center">#</TableHead>
            <TableHead>NHÂN VIÊN</TableHead>
            <TableHead>ĐỊA ĐIỂM / CA</TableHead>
            <TableHead>NGÀY</TableHead>
            <TableHead>GIỜ VÀO</TableHead>
            <TableHead>GIỜ RA</TableHead>
            <TableHead>THỜI GIAN</TableHead>
            <TableHead>TRẠNG THÁI</TableHead>
            <TableHead className="text-right">THAO TÁC</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, index) => {
            const dateObj = new Date(record.date)
            const dayName = format(dateObj, 'EEEE', { locale: vi })
            const isAbsent = record.status === 'absent'

            return (
              <TableRow 
                key={record.id} 
                className={cn(
                  "hover:bg-orange-50/50 transition-colors group",
                  isAbsent && "bg-red-50/30"
                )}
              >
                <TableCell className="text-center text-gray-400 text-xs font-medium">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={record.employee.avatar || ''} alt={record.employee.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold">
                        {record.employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 leading-tight">{record.employee.name}</span>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{record.employee.code}</span>
                        <span>•</span>
                        <span>{record.employee.department}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-orange-500" />
                      {record.location.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Clock className="w-3 h-3" />
                      {record.shift.name} ({record.shift.startTime} - {record.shift.endTime})
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{format(dateObj, 'dd/MM/yyyy')}</span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{dayName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-mono", !record.checkIn.time && "text-gray-300")}>
                        {record.checkIn.time || '--:--'}
                      </span>
                      <MethodIcon method={record.checkIn.method} />
                    </div>
                    {record.checkIn.lateMinutes ? (
                      <Badge variant="outline" className="text-[10px] w-fit px-1.5 py-0 bg-red-50 text-red-600 border-red-100">
                        Trễ {record.checkIn.lateMinutes}m
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-mono", !record.checkOut.time && "text-gray-300")}>
                        {record.checkOut.time || '--:--'}
                      </span>
                      <MethodIcon method={record.checkOut.method} />
                    </div>
                    {record.checkOut.earlyMinutes ? (
                      <Badge variant="outline" className="text-[10px] w-fit px-1.5 py-0 bg-yellow-50 text-yellow-600 border-yellow-100">
                        Sớm {record.checkOut.earlyMinutes}m
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      {Math.floor(record.totalMinutes / 60)}h {record.totalMinutes % 60}m
                    </span>
                    {record.overtimeMinutes > 0 && (
                      <Badge variant="outline" className="text-[10px] w-fit px-1.5 py-0 bg-purple-50 text-purple-600 border-purple-100">
                        OT +{record.overtimeMinutes}m
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={record.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                      onClick={() => onView(record)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-orange-600 hover:bg-orange-50"
                      onClick={() => onEditNote(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default AttendanceTable
