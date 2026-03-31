'use client'

import React, { useState } from 'react'
import { Plus, Download, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { CustomerTable } from '@/components/admin/customers/CustomerTable'
import { CustomerForm } from '@/components/admin/customers/CustomerForm'
import {
  useCustomerList,
  useDeactivateCustomer
} from '@/hooks/useCustomer'
import { Customer, CustomerListParams } from '@/app/types/customer'
import { customerService } from '@/app/services/customer.service'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

export default function CustomersPage() {
  // 1. Params & Search State
  const [params, setParams] = useState<CustomerListParams>({
    page: 1,
    size: 10,
    keyword: '',
    status: 'ALL',
    source: 'ALL'
  })
  const debouncedKeyword = useDebounce(params.keyword, 500)

  // 2. UI States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // 3. React Query Hooks
  const queryParams: CustomerListParams = {
    ...params,
    keyword: debouncedKeyword || undefined,
    status: params.status === 'ALL' ? undefined : params.status,
    source: params.source === 'ALL' ? undefined : params.source,
    page: (params.page ?? 1) - 1,  // convert display(1-indexed) → Spring(0-indexed)
  }

  const { data, isLoading } = useCustomerList(queryParams)
  const { mutate: deactivateCustomer } = useDeactivateCustomer()

  // 4. Handlers
  const handleAddClick = () => {
    setSelectedCustomer(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const customers = data?.content ?? []
  const totalItems = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Quản lý Khách hàng</h1>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
              {totalItems} hồ sơ khách hàng được lưu trữ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => customerService.downloadTemplate()}
            className="hidden sm:flex border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Tải mẫu Excel
          </Button>
          <Button
            size="sm"
            onClick={handleAddClick}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm khách hàng
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Filter Bar */}
        <Card className="p-4 bg-white shadow-sm border-gray-100 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, số điện thoại hoặc địa chỉ..."
                value={params.keyword}
                onChange={(e) => setParams(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
                className="pl-10 h-11 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-orange-500 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái:</span>
              <Select
                value={params.status}
                onValueChange={(val) => setParams(prev => ({ ...prev, status: val, page: 1 }))}
              >
                <SelectTrigger className="w-[160px] h-11 text-sm bg-gray-50/50 border-gray-100 rounded-xl font-bold text-gray-700">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="ALL" className="font-bold">Tất cả</SelectItem>
                  <SelectItem value="ACTIVE" className="font-bold">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE" className="font-bold">Ngừng hoạt động</SelectItem>
                  <SelectItem value="SUSPENDED" className="font-bold">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nguồn:</span>
              <Select
                value={params.source}
                onValueChange={(val) => setParams(prev => ({ ...prev, source: val, page: 1 }))}
              >
                <SelectTrigger className="w-[160px] h-11 text-sm bg-gray-50/50 border-gray-100 rounded-xl font-bold text-gray-700">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  <SelectItem value="ALL" className="font-bold">Tất cả nguồn</SelectItem>
                  <SelectItem value="FACEBOOK" className="font-bold">Facebook</SelectItem>
                  <SelectItem value="ZALO" className="font-bold">Zalo</SelectItem>
                  <SelectItem value="HOTLINE" className="font-bold">Hotline</SelectItem>
                  <SelectItem value="REFERRAL" className="font-bold">Người giới thiệu</SelectItem>
                  <SelectItem value="OTHER" className="font-bold">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Data Table */}
        <CustomerTable
          data={customers}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDeactivate={(id) => {
            if (confirm('Hệ thống sẽ vô hiệu hóa khách hàng này. Bạn có chắc chắn?')) {
              deactivateCustomer(id)
            }
          }}
          onViewHistory={(id) => toast.info('Lịch sử dịch vụ sẽ hiển thị tại đây')}
          onViewMap={(customer) => {
            if (customer.latitude && customer.longitude) {
              window.open(`https://www.google.com/maps?q=${customer.latitude},${customer.longitude}`, '_blank')
            } else {
              toast.error('Khách hàng này chưa có tọa độ GPS')
            }
          }}
        />

        {/* Pagination logic would go here, usually part of CustomerTable or separate component */}
      </div>

      {/* Dialogs */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[840px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-[0_0_50px_rgba(0,0,0,0.15)] rounded-3xl">
          <div className="bg-orange-500 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-3xl font-black tracking-tight leading-none uppercase">
                {selectedCustomer ? 'Cập nhật hồ sơ' : 'Thêm hồ sơ mới'}
              </DialogTitle>
              <DialogDescription className="text-orange-100 text-[11px] uppercase tracking-[0.3em] font-black mt-3 opacity-90">
                {selectedCustomer ? `Mã định danh: ${selectedCustomer.id}` : 'Vui lòng cung cấp đầy đủ thông tin bên dưới'}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 bg-white">
            <CustomerForm
              customer={selectedCustomer}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
