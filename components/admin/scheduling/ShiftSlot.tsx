'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { Plus, UserPlus } from 'lucide-react'

interface ShiftSlotProps {
  id: string // Format: slot-{employeeId}-{date}
  children?: React.ReactNode
  isOverClassName?: string
}

export const ShiftSlot: React.FC<ShiftSlotProps> = ({ id, children, isOverClassName }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] p-2 rounded-2xl border-2 border-dashed border-transparent transition-all relative flex flex-col gap-2",
        isOver && (isOverClassName || "border-orange-400 bg-orange-50/50 scale-[1.02] z-10"),
        !children && "hover:border-gray-200"
      )}
    >
      {children}
      
      {!children && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  )
}
