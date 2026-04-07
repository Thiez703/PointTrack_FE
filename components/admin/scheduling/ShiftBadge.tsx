'use client'

import React from 'react'
import { ShiftSchema, ShiftStatus, ShiftType } from '@/app/types/attendance.schema'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Play, CheckCircle2, XCircle, Clock } from 'lucide-react'

import { format } from 'date-fns'

interface ShiftBadgeProps {
  shift: ShiftSchema
  onClick?: (e: React.MouseEvent) => void
}

const shiftTypeColors: Record<ShiftType, string> = {
  [ShiftType.NORMAL]: 'bg-green-500 hover:bg-green-600 shadow-green-100',
  [ShiftType.HOLIDAY]: 'bg-orange-500 hover:bg-orange-600 shadow-orange-100',
  [ShiftType.OT_EMERGENCY]: 'bg-red-500 hover:bg-red-600 shadow-red-100',
}

const ShiftBadge: React.FC<ShiftBadgeProps> = ({ shift, onClick }) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isPast = shift.shiftDate < todayStr
  
  const isCompleted = shift.status === ShiftStatus.COMPLETED || 
                      !!shift.checkOutTime || 
                      (!!shift.checkInTime && isPast)

  const isCancelled = shift.status === ShiftStatus.CANCELLED
  
  const isMissed = shift.status === ShiftStatus.MISSED
  const isMissingOut = shift.status === ShiftStatus.MISSING_OUT
  
  const isInProgress = !isCompleted && !isCancelled && !isMissed && !isMissingOut && 
                       (shift.status === ShiftStatus.IN_PROGRESS || !!shift.checkInTime)

  return (
    <div
      onClick={onClick}
      className={cn(
        'cursor-pointer p-2.5 rounded-xl text-[10px] text-white transition-all shadow-md group relative overflow-hidden',
        shiftTypeColors[shift.shiftType],
        isCompleted && 'opacity-60 saturate-50',
        isCancelled && 'bg-gray-400 opacity-50 grayscale',
        isMissed && 'bg-red-50 text-red-500 border border-red-200 shadow-none',
        isMissingOut && 'bg-orange-600 shadow-orange-200 ring-2 ring-orange-400 ring-offset-1'
      )}
    >
      <div className={cn(
        "flex items-center justify-between font-black uppercase tracking-wider",
        isMissed && "text-red-600"
      )}>
        <span className="truncate">{shift.startTime} – {shift.endTime}</span>
        {isInProgress && <Play className="w-2.5 h-2.5 ml-1 fill-white animate-pulse" />}
        {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 ml-1" />}
        {isCancelled && <XCircle className="w-2.5 h-2.5 ml-1" />}
        {isMissed && <span className="ml-1 text-[8px] bg-red-100 px-1 rounded-sm">MISSED</span>}
        {isMissingOut && <Clock className="w-2.5 h-2.5 ml-1 animate-bounce" />}
      </div>
      <div className={cn(
        "text-[9px] font-bold opacity-80 truncate mt-1 flex items-center gap-1",
        isMissed ? "text-red-400" : "text-white"
      )}>
         <span className={cn("w-1 h-1 rounded-full", isMissed ? "bg-red-400" : "bg-white")}></span>
         {shift.customerName || 'Chưa gán khách'}
      </div>
      
      {/* Decorative inner glow */}
      {!isMissed && <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>}
    </div>
  )
}


export default ShiftBadge
