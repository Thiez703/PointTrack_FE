'use client'

import React, { useMemo } from 'react'
import { ShiftTimePicker } from './ShiftTimePicker'
import { Moon, Clock, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShiftTimeSelectorProps {
  startTime: string
  endTime: string
  disabled?: boolean
  onChange: (start: string, end: string) => void
}

const PRESETS = [
  { label: 'Ca Sáng', start: '08:00', end: '12:00' },
  { label: 'Ca Chiều', start: '13:00', end: '17:00' },
  { label: 'Ca Tối', start: '18:00', end: '22:00' },
  { label: 'Ca Đêm', start: '22:00', end: '06:00' },
  { label: 'Hành chính', start: '08:00', end: '17:00' },
]

export const ShiftTimeSelector: React.FC<ShiftTimeSelectorProps> = ({ 
  startTime, 
  endTime, 
  disabled = false,
  onChange 
}) => {
  const { durationMinutes, isOvernight, totalHours, remainingMinutes } = useMemo(() => {
    const [sH, sM] = startTime.split(':').map(Number)
    const [eH, eM] = endTime.split(':').map(Number)

    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) {
      return { durationMinutes: 0, isOvernight: false, totalHours: 0, remainingMinutes: 0 }
    }

    const startTotal = sH * 60 + sM
    const endTotal = eH * 60 + eM
    
    let diff = endTotal - startTotal
    const overnight = diff < 0
    if (overnight) {
      diff += 24 * 60
    }

    return {
      durationMinutes: diff,
      isOvernight: overnight,
      totalHours: Math.floor(diff / 60),
      remainingMinutes: diff % 60
    }
  }, [startTime, endTime])

  const validation = useMemo(() => {
    if (durationMinutes === 0) return null
    if (durationMinutes < 30) {
      return { type: 'error', message: '❌ Ca quá ngắn (tối thiểu 30 phút)', color: 'text-red-600 bg-red-50 border-red-100' }
    }
    if (durationMinutes > 720) { // 12 hours
      return { type: 'warning', message: '⚠️ Ca làm việc vượt 12 giờ', color: 'text-amber-600 bg-amber-50 border-amber-100' }
    }
    if (isOvernight) {
      return { type: 'info', message: '🌙 Ca qua đêm - kết thúc ngày hôm sau', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
    }
    return null
  }, [durationMinutes, isOvernight])

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset.start, preset.end)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed",
              startTime === preset.start && endTime === preset.end
                ? "bg-orange-500 border-orange-500 text-white shadow-md scale-105"
                : "bg-white border-orange-100 text-orange-500 hover:bg-orange-50 hover:border-orange-200"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Pickers */}
      <div className="grid grid-cols-2 gap-6 relative">
        <ShiftTimePicker
          label="Giờ bắt đầu"
          value={startTime}
          disabled={disabled}
          onChange={(val) => onChange(val, endTime)}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-1 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center border-2 border-orange-100 z-10 hidden sm:flex">
           <Clock className="w-4 h-4 text-orange-400" />
        </div>
        <ShiftTimePicker
          label="Giờ kết thúc"
          value={endTime}
          disabled={disabled}
          onChange={(val) => onChange(startTime, val)}
        />
      </div>

      {/* Timeline Visual Bar */}
      {durationMinutes > 0 && (
        <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
          <div className="relative h-10 w-full bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden flex items-center px-4">
            <div 
              className={cn(
                "absolute inset-y-1.5 rounded-xl transition-all duration-500 flex items-center justify-center text-[10px] font-black uppercase text-white shadow-sm",
                isOvernight ? "bg-indigo-500 left-1 right-1" : "bg-orange-500 left-1 right-1"
              )}
            >
              <div className="flex items-center gap-2">
                <span>{startTime}</span>
                <div className="h-px w-8 bg-white/30" />
                <span className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                   {totalHours > 0 ? `${totalHours} giờ` : ''} {remainingMinutes > 0 ? `${remainingMinutes} phút` : ''}
                </span>
                <div className="h-px w-8 bg-white/30" />
                <span>{endTime}</span>
                {isOvernight && <Moon className="w-3 h-3 ml-1" />}
              </div>
            </div>
          </div>

          {/* Smart Validation */}
          {validation && (
            <div className={cn(
              "px-4 py-2 rounded-xl text-[11px] font-bold border flex items-center gap-2 animate-in fade-in duration-500",
              validation.color
            )}>
              {validation.type === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
              {validation.type === 'warning' && <AlertCircle className="w-3.5 h-3.5" />}
              {validation.type === 'info' && <Info className="w-3.5 h-3.5" />}
              {validation.message}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
