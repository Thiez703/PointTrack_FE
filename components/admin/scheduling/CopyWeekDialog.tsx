'use client'

import React, { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SchedulingService } from '@/app/services/scheduling.service'
import { CopyWeekResponse } from '@/app/types/attendance.schema'
import { Loader2, CheckCircle, AlertCircle, SkipForward } from 'lucide-react'
import { toast } from 'sonner'

interface CopyWeekDialogProps {
  isOpen: boolean
  onClose: () => void
  currentWeek: string
  onSuccess: () => void
}

const CopyWeekDialog: React.FC<CopyWeekDialogProps> = ({ isOpen, onClose, currentWeek, onSuccess }) => {
  const [targetWeek, setTargetWeek] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CopyWeekResponse | null>(null)

  const handleCopy = async () => {
    if (!targetWeek) {
      toast.error('Vui lòng chọn tuần đích')
      return
    }
    
    setIsLoading(true)
    try {
      const res = await SchedulingService.copyWeek({
        sourceWeek: currentWeek,
        targetWeek: targetWeek
      })
      setResult(res.data)
      if (res.data.copied > 0) {
        toast.success(`Đã sao chép ${res.data.copied} ca làm việc`)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi sao chép lịch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (result) {
      onSuccess()
    }
    setResult(null)
    setTargetWeek('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>SAO CHÉP LỊCH TUẦN</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Tuần nguồn:</Label>
              <Input value={currentWeek} disabled className="col-span-3 bg-muted" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-bold">Tuần đích:</Label>
              <Input 
                type="week" 
                value={targetWeek} 
                onChange={(e) => setTargetWeek(e.target.value)}
                className="col-span-3"
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              * Hệ thống sẽ tự động bỏ qua các ca bị trùng lịch ở tuần đích.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center text-green-600 font-bold mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              Sao chép hoàn tất
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50 rounded-md border border-green-100">
                <div className="font-bold text-green-800">📋 Đã copy</div>
                <div className="text-2xl">{result.copied} ca</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-md border border-yellow-100">
                <div className="font-bold text-yellow-800">⏭ Bỏ qua</div>
                <div className="text-2xl">{result.skipped} ca</div>
              </div>
            </div>

            {result.conflicts.length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-bold flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 mr-1 text-red-500" />
                  Chi tiết ca bị bỏ qua:
                </div>
                <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 text-xs space-y-1 bg-muted/30">
                  {result.conflicts.map((c, i) => (
                    <div key={i} className="flex items-start border-b pb-1 last:border-0">
                      <SkipForward className="w-3 h-3 mr-1 mt-0.5 text-muted-foreground" />
                      <span>{c.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={onClose}>Huỷ</Button>
              <Button onClick={handleCopy} disabled={isLoading || !targetWeek}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                📋 Sao chép
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Đóng</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CopyWeekDialog
