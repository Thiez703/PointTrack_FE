import React from 'react'
import { AttendanceSummary, AttendanceStatus } from '@/app/types/attendance'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Clock, LogOut, XCircle, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  summary?: AttendanceSummary
  activeStatus: AttendanceStatus
  onStatusClick: (status: AttendanceStatus) => void
}

const AttendanceSummaryCards: React.FC<SummaryCardsProps> = ({ summary, activeStatus, onStatusClick }) => {
  const cards = [
    { label: 'Tổng records', value: summary?.totalRecords || 0, status: '' as AttendanceStatus, icon: null, color: 'text-blue-600' },
    { label: 'Đúng giờ ✅', value: summary?.onTime || 0, status: 'on_time' as AttendanceStatus, icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600' },
    { label: 'Đi trễ 🕐', value: summary?.late || 0, status: 'late' as AttendanceStatus, icon: <Clock className="w-4 h-4" />, color: 'text-red-600' },
    { label: 'Về sớm 🏃', value: summary?.earlyLeave || 0, status: 'early_leave' as AttendanceStatus, icon: <LogOut className="w-4 h-4" />, color: 'text-yellow-600' },
    { label: 'Vắng mặt ❌', value: summary?.absent || 0, status: 'absent' as AttendanceStatus, icon: <XCircle className="w-4 h-4" />, color: 'text-gray-600' },
    { label: 'Tăng ca ➕', value: summary?.overtime || 0, status: 'overtime' as AttendanceStatus, icon: <Timer className="w-4 h-4" />, color: 'text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            "p-4 cursor-pointer transition-all hover:shadow-md border-2",
            activeStatus === card.status ? "border-orange-500 bg-orange-50/30" : "border-transparent"
          )}
          onClick={() => onStatusClick(card.status)}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <span className="text-sm font-medium text-gray-500 text-center">{card.label}</span>
            <div className="flex items-center space-x-2">
              <span className={cn("text-2xl font-bold", card.color)}>{card.value}</span>
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default AttendanceSummaryCards
