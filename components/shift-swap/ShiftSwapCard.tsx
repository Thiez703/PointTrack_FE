'use client'

import { ShiftSwapResponse, ShiftSwapType } from '@/app/types/shift-swap.schema'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  RefreshCw, 
  Calendar, 
  Gift, 
  Clock, 
  MapPin, 
  User,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Timer,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

interface ShiftSwapCardProps {
  swap: ShiftSwapResponse
  type: 'sent' | 'received'
  onCancel?: (id: string) => void
  onRespond?: (id: string) => void
  onView?: (id: string) => void
}

const typeConfig = {
  SWAP: { icon: RefreshCw, label: 'Hoán đổi', color: 'text-blue-500', bg: 'bg-blue-50' },
  SAME_DAY: { icon: Calendar, label: 'Cùng ngày', color: 'text-orange-500', bg: 'bg-orange-50' },
  OTHER_DAY: { icon: Calendar, label: 'Ngày khác', color: 'text-purple-500', bg: 'bg-purple-50' },
  TRANSFER: { icon: Gift, label: 'Nhường ca', color: 'text-pink-500', bg: 'bg-pink-50' },
}

const statusConfig = {
  PENDING_EMPLOYEE: { label: 'Chờ NV xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Timer },
  PENDING_ADMIN: { label: 'Chờ Admin duyệt', color: 'bg-blue-100 text-blue-700', icon: Timer },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

export const ShiftSwapCard = ({ swap, type, onCancel, onRespond, onView }: ShiftSwapCardProps) => {
  const config = typeConfig[swap.type]
  const status = statusConfig[swap.status]
  const Icon = config.icon
  const StatusIcon = status.icon

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEEE, dd/MM', { locale: vi })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5)
  }

  return (
    <Card className="mb-4 overflow-hidden border-none shadow-sm bg-white">
      <CardContent className="p-0">
        <div className={cn("h-1 w-full", config.color.replace('text', 'bg'))} />
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{config.label}</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                  {format(parseISO(swap.createdAt), 'HH:mm - dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={cn("border-none font-bold py-1", status.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="space-y-4">
            {/* My Shift / Requester Shift */}
            <div className="bg-gray-50 p-3 rounded-2xl relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded bg-orange-100 text-orange-600">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-gray-500">Ca của {type === 'sent' ? 'bạn' : swap.requester.name}</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-black text-gray-800">{swap.myShift.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(swap.myShift.startTime)} - {formatTime(swap.myShift.endTime)}</span>
                    <span className="mx-1">|</span>
                    <span>{formatDate(swap.myShift.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{swap.myShift.location}</span>
                </div>
              </div>

              {/* Arrow if there's a target */}
              {(swap.targetShift || swap.receiver) && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white p-1.5 rounded-full shadow-md border border-gray-50">
                  <ArrowRight className="w-4 h-4 text-orange-500 rotate-90" />
                </div>
              )}
            </div>

            {/* Target Shift / Receiver */}
            {(swap.targetShift || swap.receiver) && (
              <div className="bg-orange-50/50 p-3 rounded-2xl pt-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-600">
                    <User className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {swap.type === 'TRANSFER' ? 'Nhường cho' : 'Đổi sang'} {swap.receiver?.name || 'Admin sắp xếp'}
                  </span>
                </div>
                {swap.targetShift ? (
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-black text-gray-800">{swap.targetShift.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(swap.targetShift.startTime)} - {formatTime(swap.targetShift.endTime)}</span>
                        <span className="mx-1">|</span>
                        <span>{formatDate(swap.targetShift.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{swap.targetShift.location}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-gray-700 italic">Theo sự sắp xếp của quản lý</p>
                )}
              </div>
            )}
          </div>

          {swap.reason && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lý do</p>
              <p className="text-xs text-slate-600 line-clamp-2 italic">"{swap.reason}"</p>
            </div>
          )}

          {swap.rejectReason && (
            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Lý do từ chối</p>
              <p className="text-xs text-red-600 italic">"{swap.rejectReason}"</p>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 rounded-xl h-10 text-xs font-bold text-gray-600 border-gray-100"
              onClick={() => onView?.(swap.id)}
            >
              Chi tiết
            </Button>
            
            {type === 'sent' && swap.status.startsWith('PENDING') && (
              <Button 
                variant="destructive" 
                className="flex-1 rounded-xl h-10 text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 border-none"
                onClick={() => onCancel?.(swap.id)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Hủy yêu cầu
              </Button>
            )}

            {type === 'received' && swap.status === 'PENDING_EMPLOYEE' && (
              <Button 
                className="flex-1 rounded-xl h-10 text-xs font-bold bg-orange-500 text-white shadow-lg shadow-orange-100"
                onClick={() => onRespond?.(swap.id)}
              >
                Phản hồi
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
