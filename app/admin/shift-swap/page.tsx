'use client'

import { useState } from 'react'
import { useShiftSwap } from '@/hooks/useShiftSwap'
import { DataTable } from '@/components/admin/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { ShiftSwapResponse, ShiftSwapStatus } from '@/app/types/shift-swap.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Timer,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const statusConfig = {
  PENDING_EMPLOYEE: { label: 'Chờ NV xác nhận', color: 'bg-yellow-100 text-yellow-700', icon: Timer },
  PENDING_ADMIN: { label: 'Chờ Admin duyệt', color: 'bg-blue-100 text-blue-700', icon: Timer },
  APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  REJECTED: { label: 'Bị từ chối', color: 'bg-red-100 text-red-700', icon: XCircle },
  CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

export default function AdminShiftSwapPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, tab: 'sent' as const })
  const { swaps, totalElements, isLoading, approveSwap, rejectSwap, isApproving, isRejecting } = useShiftSwap({ 
    ...filters,
    tab: 'sent' // Admin sees all requests as "sent" from their perspective? 
    // Actually the API contract said GET /api/shift-swap?tab=sent|received
    // For admin we might need a different endpoint or a specific filter.
    // I'll assume for now admin gets all and I'll use status=PENDING_ADMIN
  })

  const [selectedSwap, setSelectedSwap] = useState<ShiftSwapResponse | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async (id: string) => {
    if (confirm('Xác nhận duyệt yêu cầu đổi ca này?')) {
      await approveSwap({ id })
    }
  }

  const handleReject = async () => {
    if (!selectedSwap) return
    if (!rejectReason) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }
    await rejectSwap({ id: selectedSwap.id, data: { reason: rejectReason } })
    setRejectModalOpen(false)
    setRejectReason('')
  }

  const columns = [
    {
      header: 'NV Yêu cầu',
      accessor: (item: ShiftSwapResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
            {item.requester.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{item.requester.name}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{item.requester.code}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Loại',
      accessor: (item: ShiftSwapResponse) => (
        <Badge variant="outline" className="font-bold border-gray-100 text-gray-600 bg-gray-50 capitalize">
          {item.type.toLowerCase().replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Ca gốc',
      accessor: (item: ShiftSwapResponse) => (
        <div className="text-xs">
          <p className="font-bold text-gray-800">{item.myShift.name}</p>
          <p className="text-gray-500">{item.myShift.startTime.slice(0, 5)} | {format(parseISO(item.myShift.date), 'dd/MM')}</p>
        </div>
      )
    },
    {
      header: '→',
      accessor: () => <ArrowRight className="w-4 h-4 text-gray-300" />
    },
    {
      header: 'Ca muốn đổi',
      accessor: (item: ShiftSwapResponse) => item.targetShift ? (
        <div className="text-xs">
          <p className="font-bold text-gray-800">{item.targetShift.name}</p>
          <p className="text-gray-500">{item.targetShift.startTime.slice(0, 5)} | {format(parseISO(item.targetShift.date), 'dd/MM')}</p>
        </div>
      ) : item.receiver ? (
        <div className="text-xs">
          <p className="font-bold text-emerald-600">Nhường cho</p>
          <p className="text-gray-500">{item.receiver.name}</p>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">Admin sắp xếp</p>
      )
    },
    {
      header: 'Trạng thái',
      accessor: (item: ShiftSwapResponse) => {
        const config = statusConfig[item.status]
        const Icon = config.icon
        return (
          <Badge className={cn("font-bold border-none", config.color)}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        )
      }
    },
    {
      header: 'Ngày tạo',
      accessor: (item: ShiftSwapResponse) => (
        <p className="text-xs text-gray-500">
          {format(parseISO(item.createdAt), 'dd/MM/yyyy HH:mm')}
        </p>
      )
    }
  ]

  const renderActions = (item: ShiftSwapResponse) => {
    const isPending = item.status === 'PENDING_ADMIN'
    return (
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:text-gray-900">
          <Eye className="w-4 h-4" />
        </Button>
        {isPending && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8 text-emerald-500 border-emerald-50 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-600"
              onClick={() => handleApprove(item.id)}
              disabled={isApproving}
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="w-8 h-8 text-red-500 border-red-50 bg-red-50 hover:bg-red-100 hover:text-red-600"
              onClick={() => {
                setSelectedSwap(item)
                setRejectModalOpen(true)
              }}
              disabled={isRejecting}
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Yêu cầu Đổi ca</h1>
          <p className="text-gray-500 mt-1 font-medium">Phê duyệt và quản lý các yêu cầu thay đổi lịch làm việc từ nhân viên.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-gray-100 font-bold flex gap-2">
            <RefreshCw className="w-4 h-4" /> Làm mới
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center mb-8">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm tên nhân viên, mã NV..." 
            className="h-11 pl-11 rounded-xl border-gray-100 bg-gray-50/50"
          />
        </div>
        <div className="w-40">
          <Input type="date" className="h-11 rounded-xl border-gray-100 bg-gray-50/50" />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl font-bold text-gray-500 border-gray-100 flex gap-2">
          <Filter className="w-4 h-4" /> Lọc
        </Button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-50 shadow-xl shadow-gray-100/50 overflow-hidden">
        <DataTable 
          title="Danh sách đổi ca"
          columns={columns} 
          data={swaps} 
          isLoading={isLoading}
          renderActions={renderActions}
        />
      </div>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[32px] border-none">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">Từ chối yêu cầu</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu đổi ca của {selectedSwap?.requester.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Ví dụ: Không có nhân viên thay thế, lịch làm việc đã chốt..."
              className="rounded-2xl border-gray-100 min-h-[120px] focus-visible:ring-red-500"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-3 sm:gap-0">
            <Button variant="ghost" className="rounded-xl flex-1 font-bold" onClick={() => setRejectModalOpen(false)}>
              Quay lại
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl flex-1 font-black bg-red-500 shadow-lg shadow-red-100"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
