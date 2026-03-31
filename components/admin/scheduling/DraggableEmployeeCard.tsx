'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Employee } from '@/app/types/admin.schema'
import { User, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraggableEmployeeCardProps {
  employee: Employee
}

export const DraggableEmployeeCard: React.FC<DraggableEmployeeCardProps> = ({ employee }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `employee-${employee.id}`,
    data: {
      type: 'employee',
      employee
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 transition-all",
        "hover:border-orange-200 hover:shadow-md cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50 scale-95 border-orange-500 shadow-orange-100 z-50 pointer-events-none"
      )}
    >
      <div 
        {...listeners} 
        {...attributes}
        className="text-gray-300 group-hover:text-orange-400 p-1"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">
        {employee.fullName.substring(0, 2).toUpperCase()}
      </div>
      
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-bold text-gray-800 text-xs truncate">{employee.fullName}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter truncate">
          {employee.department || 'Nhân viên'}
        </span>
      </div>
    </div>
  )
}
