'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  Plus, 
  Send, 
  Inbox,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react'
import { useShiftSwap } from '@/hooks/useShiftSwap'
import { ShiftSwapCard } from '@/components/shift-swap/ShiftSwapCard'
import { ShiftSwapRespondModal } from '@/components/shift-swap/ShiftSwapRespondModal'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ShiftSwapResponse } from '@/app/types/shift-swap.schema'

export default function ShiftSwapPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent')
  const [selectedSwap, setSelectedSwap] = useState<ShiftSwapResponse | null>(null)
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false)

  const { 
    swaps, 
    isLoading, 
    cancelSwap, 
    respondToSwap, 
    isResponding 
  } = useShiftSwap({ tab: activeTab })

  const handleRespond = (swap: ShiftSwapResponse) => {
    setSelectedSwap(swap)
    setIsRespondModalOpen(true)
  }

  const onRespondAction = async (id: string, action: 'ACCEPT' | 'REJECT', reason?: string) => {
    await respondToSwap({ id, data: { action, reason } })
    setIsRespondModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Đổi ca làm việc</h1>
        </div>

        <Button 
          onClick={() => router.push('/shift-swap/create')}
          className="w-full h-14 rounded-[20px] bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-lg shadow-orange-100 flex items-center justify-center gap-3 mb-6"
        >
          <Plus className="w-5 h-5" />
          Tạo yêu cầu đổi ca
        </Button>

        {/* Tabs */}
        <div className="bg-gray-100/80 p-1 rounded-2xl flex gap-1">
          <button
            onClick={() => setActiveTab('sent')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-sm font-bold transition-all",
              activeTab === 'sent' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
            )}
          >
            <Send className="w-4 h-4" />
            Đã gửi
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-sm font-bold transition-all",
              activeTab === 'received' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"
            )}
          >
            <Inbox className="w-4 h-4" />
            Đã nhận
          </button>
        </div>
      </div>

      <div className="px-6 mt-6 max-w-2xl mx-auto">
        {/* Search & Filter Bar (Optional) */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..."
              className="w-full h-11 pl-11 pr-4 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <button className="w-11 h-11 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                <p className="text-gray-400 font-bold text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : swaps.length > 0 ? (
              swaps.map((swap) => (
                <ShiftSwapCard 
                  key={swap.id} 
                  swap={swap} 
                  type={activeTab}
                  onCancel={(id) => cancelSwap(id)}
                  onRespond={() => handleRespond(swap)}
                  onView={(id) => router.push(`/shift-swap/${id}`)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                  {activeTab === 'sent' ? (
                    <Send className="w-10 h-10 text-gray-100" />
                  ) : (
                    <Inbox className="w-10 h-10 text-gray-100" />
                  )}
                </div>
                <p className="text-gray-400 font-bold text-base">Trống rỗng!</p>
                <p className="text-gray-300 text-xs text-center mt-2 max-w-[200px]">
                  {activeTab === 'sent' 
                    ? "Bạn chưa gửi yêu cầu đổi ca nào gần đây." 
                    : "Bạn chưa nhận được yêu cầu đổi ca nào từ đồng nghiệp."}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <ShiftSwapRespondModal 
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        swap={selectedSwap}
        onRespond={onRespondAction}
        isSubmitting={isResponding}
      />
    </div>
  )
}
