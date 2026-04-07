'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShiftTimePickerProps {
  value: string // "HH:MM"
  onChange: (time: string) => void
  label: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

export const ShiftTimePicker: React.FC<ShiftTimePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hour, minute] = value.split(':')

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateTime = (newHour: string, newMinute: string) => {
    onChange(`${newHour}:${newMinute}`)
  }

  const handleHourScroll = (direction: 'up' | 'down') => {
    let currentHour = parseInt(hour)
    if (direction === 'up') {
      currentHour = (currentHour - 1 + 24) % 24
    } else {
      currentHour = (currentHour + 1) % 24
    }
    updateTime(currentHour.toString().padStart(2, '0'), minute)
  }

  const handleMinuteScroll = (direction: 'up' | 'down') => {
    let currentMinute = parseInt(minute)
    if (direction === 'up') {
      currentMinute = (currentMinute - 1 + 60) % 60
    } else {
      currentMinute = (currentMinute + 1) % 60
    }
    updateTime(hour, currentMinute.toString().padStart(2, '0'))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9:]/g, '')
    if (val.length === 2 && !val.includes(':')) {
      val += ':'
    }
    if (val.length > 5) val = val.substring(0, 5)
    onChange(val)
  }

  const handleBlur = () => {
    let [h, m] = value.split(':')
    if (!h) h = '00'
    if (!m) m = '00'
    h = Math.min(23, parseInt(h) || 0).toString().padStart(2, '0')
    m = Math.min(59, parseInt(m) || 0).toString().padStart(2, '0')
    onChange(`${h}:${m}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const isHour = inputRef.current?.selectionStart !== undefined && inputRef.current.selectionStart <= 2
      if (isHour) {
        handleHourScroll(e.key === 'ArrowUp' ? 'up' : 'down')
      } else {
        handleMinuteScroll(e.key === 'ArrowUp' ? 'up' : 'down')
      }
    } else if (e.key === 'Enter' || e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const DrumColumn = ({ 
    items, 
    current, 
    onScroll 
  }: { 
    items: string[], 
    current: string, 
    onScroll: (dir: 'up' | 'down') => void 
  }) => {
    const currentIndex = items.indexOf(current)
    const prevIndex = (currentIndex - 1 + items.length) % items.length
    const nextIndex = (currentIndex + 1) % items.length

    return (
      <div className="flex flex-col items-center w-12">
        <button 
          type="button"
          onClick={() => onScroll('up')}
          className="p-1 hover:text-orange-500 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        <div className="flex flex-col items-center py-2 space-y-1 relative w-full overflow-hidden h-[120px] justify-center">
           <div className="text-gray-300 text-xs opacity-50 select-none">{items[(prevIndex - 1 + items.length) % items.length]}</div>
           <div className="text-gray-400 text-sm opacity-80 select-none">{items[prevIndex]}</div>
           <div className="bg-orange-50 text-orange-600 font-bold text-lg py-1 px-2 rounded-md w-full text-center shadow-sm border border-orange-100 z-10">
             {current}
           </div>
           <div className="text-gray-400 text-sm opacity-80 select-none">{items[nextIndex]}</div>
           <div className="text-gray-300 text-xs opacity-50 select-none">{items[(nextIndex + 1) % items.length]}</div>
        </div>

        <button 
          type="button"
          onClick={() => onScroll('down')}
          className="p-1 hover:text-orange-500 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">
        {label}
      </label>
      
      <div 
        className={cn(
          "flex items-center bg-white border-2 rounded-2xl px-4 py-3 transition-all duration-200 group",
          isOpen ? "border-teal-500 ring-4 ring-teal-50/50 shadow-sm" : "border-gray-100 hover:border-orange-200"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="HH:MM"
          className="w-full bg-transparent outline-none font-black text-gray-700 text-lg tracking-tight"
        />
        <div className="flex flex-col text-[10px] font-black text-gray-300 uppercase leading-none">
          <span>{parseInt(hour) >= 12 ? 'PM' : 'AM'}</span>
          <span>{isOpen ? 'Close' : 'Set'}</span>
        </div>
      </div>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-4 z-[100] animate-in fade-in zoom-in-95 duration-200 flex gap-4 min-w-[160px] justify-center items-center"
          role="listbox"
        >
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Giờ</span>
            <DrumColumn items={HOURS} current={hour} onScroll={handleHourScroll} />
          </div>
          
          <div className="text-orange-200 font-black text-2xl self-center mt-4">:</div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phút</span>
            <DrumColumn items={MINUTES} current={minute} onScroll={handleMinuteScroll} />
          </div>
        </div>
      )}
    </div>
  )
}
