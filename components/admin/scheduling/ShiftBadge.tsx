'use client'

import React from 'react'
import { ShiftSchema, ShiftStatus, ShiftType } from '@/app/types/attendance.schema'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Play, CheckCircle2, XCircle } from 'lucide-react'

import { format } from 'date-fns'

interface ShiftBadgeProps {
  shift: ShiftSchema
  onClick?: (e: React.MouseEvent) => void
}

const shiftTypeColors: Record<ShiftType, string> = {
  [ShiftType.NORMAL]: 'bg-[#4CAF50] hover:bg-[#45a049]',
  [ShiftType.HOLIDAY]: 'bg-[#FF9800] hover:bg-[#f57c00]',
  [ShiftType.OT_EMERGENCY]: 'bg-[#F44336] hover:bg-[#d32f2f]',
}

const ShiftBadge: React.FC<ShiftBadgeProps> = ({ shift, onClick }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isPast = shift.shiftDate < todayStr
  
  const isCompleted = shift.status === ShiftStatus.COMPLETED || 
                      !!shift.checkOutTime || 
                      (!!shift.checkInTime && isPast)

  const isCancelled = shift.status === ShiftStatus.CANCELLED
  
  const isInProgress = !isCompleted && !isCancelled && 
                       (shift.status === ShiftStatus.IN_PROGRESS || !!shift.checkInTime)

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer mb-1 p-1 rounded-md text-xs text-white transition-all shadow-sm',
        shiftTypeColors[shift.shiftType],
        isCompleted && 'opacity-60 line-through',
        isCancelled && 'bg-gray-400 line-through'
      )}
    >
      <div className="flex items-center justify-between font-medium">
        <span className="truncate">{shift.startTime} – {shift.endTime}</span>
        {isInProgress && <Play className="w-3 h-3 ml-1 fill-white" />}
        {isCompleted && <CheckCircle2 className="w-3 h-3 ml-1" />}
        {isCancelled && <XCircle className="w-3 h-3 ml-1" />}
      </div>
      <div className="text-[10px] opacity-90 truncate">{shift.customerName || 'No Customer'}</div>
    </div>
  )
}

export default ShiftBadge
