import React from 'react'
import { AttendanceRecord } from '@/app/types/attendance'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StickyNote } from 'lucide-react'

interface NoteModalProps {
  record: AttendanceRecord | null
  open: boolean
  onClose: () => void
  onSave: (id: string, note: string) => Promise<any>
  isSaving: boolean
}

const AttendanceNoteModal: React.FC<NoteModalProps> = ({ record, open, onClose, onSave, isSaving }) => {
  const [note, setNote] = React.useState('')

  React.useEffect(() => {
    if (record) setNote(record.note || '')
  }, [record])

  const handleSave = async () => {
    if (!record) return
    await onSave(record.id, note)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <StickyNote className="w-5 h-5 text-orange-500" />
            Ghi chú Chấm công
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-3">
            Cập nhật ghi chú cho nhân viên <span className="font-bold text-gray-700">{record?.employee.name}</span>
          </p>
          <Textarea
            placeholder="Nhập nội dung ghi chú..."
            className="min-h-[120px] rounded-xl"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AttendanceNoteModal
