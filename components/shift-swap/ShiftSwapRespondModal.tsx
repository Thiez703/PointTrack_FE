'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ShiftSwapResponse } from '@/app/types/shift-swap.schema'
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Clock,
  Calendar
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ShiftSwapRespondModalProps {
  swap: ShiftSwapResponse | null
  isOpen: boolean
  onClose: () => void
  onRespond: (id: string, action: 'ACCEPT' | 'REJECT', reason?: string) => void
  isSubmitting: boolean
}

export const ShiftSwapRespondModal = ({ 
  swap, 
  isOpen, 
  onClose, 
  onRespond, 
  isSubmitting 
}: ShiftSwapRespondModalProps) => {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  if (!swap) return null

  const handleRespond = (action: 'ACCEPT' | 'REJECT') => {
    if (action === 'REJECT' && !showRejectInput) {
      setShowRejectInput(true)
      return
    }
    onRespond(swap.id, action, action === 'REJECT' ? rejectReason : undefined)
  }

  const formatDateTime = (dateStr: string, timeStr: string) => {
    return `${timeStr.slice(0, 5)} | ${format(parseISO(dateStr), 'dd/MM', { locale: vi })}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-orange-500" />
            Yêu cầu đổi ca
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            {swap.requester.name} muốn hoán đổi ca làm việc với bạn
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Comparison View */}
          <div className="flex flex-col gap-4 relative">
            {/* Requester Shift */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ca của {swap.requester.name}</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{swap.myShift.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatDateTime(swap.myShift.date, swap.myShift.startTime)}</span>
                  </div>
                </div>
                <div className="text-[10px] bg-white px-2 py-1 rounded-lg border border-gray-100 text-gray-400 font-bold">
                  {swap.myShift.location}
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg border-4 border-white">
              <RefreshCw className="w-5 h-5 text-orange-500" />
            </div>

            {/* Target Shift (My Shift) */}
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-2">Ca của bạn</p>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-orange-900">{swap.targetShift?.name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-orange-600/70 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{swap.targetShift ? formatDateTime(swap.targetShift.date, swap.targetShift.startTime) : 'N/A'}</span>
                  </div>
                </div>
                <div className="text-[10px] bg-white px-2 py-1 rounded-lg border border-orange-100 text-orange-400 font-bold">
                  {swap.targetShift?.location}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lý do từ {swap.requester.name}</p>
            <p className="text-sm text-slate-700 italic">"{swap.reason}"</p>
          </div>

          {showRejectInput && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <p className="text-xs font-bold text-gray-500">Lý do từ chối (không bắt buộc):</p>
              <Textarea 
                placeholder="Nhập lý do của bạn..."
                className="rounded-2xl border-gray-100 bg-gray-50 focus-visible:ring-orange-500 min-h-[80px]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-2xl text-yellow-700 border border-yellow-100/50">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-[10px] font-bold leading-relaxed">
              Việc chấp nhận sẽ tự động cập nhật lịch làm việc của cả hai bên. Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex gap-3 sm:gap-0">
          {!showRejectInput ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1 rounded-2xl h-12 font-bold text-red-500 border-red-50 hover:bg-red-50 hover:text-red-600"
                onClick={() => handleRespond('REJECT')}
                disabled={isSubmitting}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
              <Button 
                className="flex-1 rounded-2xl h-12 font-bold bg-orange-500 text-white shadow-lg shadow-orange-100 hover:bg-orange-600"
                onClick={() => handleRespond('ACCEPT')}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Chấp nhận
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="flex-1 rounded-2xl h-12 font-bold text-gray-500"
                onClick={() => setShowRejectInput(false)}
                disabled={isSubmitting}
              >
                Quay lại
              </Button>
              <Button 
                variant="destructive"
                className="flex-1 rounded-2xl h-12 font-bold bg-red-500 text-white shadow-lg shadow-red-100"
                onClick={() => handleRespond('REJECT')}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
