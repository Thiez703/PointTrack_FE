'use client'

import React from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Map, History } from 'lucide-react'
import { Customer } from '@/app/types/customer'
import { cn } from '@/lib/utils'

interface CustomerTableProps {
  data: Customer[]
  onEdit: (customer: Customer) => void
  onDeactivate: (id: number | string) => void
  onViewHistory: (id: number | string) => void
  onViewMap: (customer: Customer) => void
  isLoading?: boolean
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  data,
  onEdit,
  onDeactivate,
  onViewHistory,
  onViewMap,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Đang tải dữ liệu khách hàng...</span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm responsive-scroll-x">
      <Table className="min-w-[760px]">
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="w-[250px] font-black uppercase text-[10px] tracking-widest text-gray-400 p-5">Khách hàng</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-gray-400 p-5">Liên hệ</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-gray-400 p-5">Địa chỉ & Tọa độ</TableHead>
            <TableHead className="font-black uppercase text-[10px] tracking-widest text-gray-400 p-5 text-center">Trạng thái</TableHead>
            <TableHead className="w-[100px] text-right p-5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-gray-400 font-bold">
                Không tìm thấy khách hàng nào.
              </TableCell>
            </TableRow>
          ) : (
            data.map((customer) => (
              <TableRow key={customer.id} className="group border-gray-50 hover:bg-orange-50/20 transition-colors">
                <TableCell className="p-5">
                  <div className="flex flex-col">
                    <span className="font-black text-gray-800 text-[15px]">{customer.name}</span>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-0.5">
                      {customer.source}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="p-5">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-bold text-gray-700">{customer.phone}</div>
                    {customer.secondaryPhone && (
                      <div className="text-[11px] text-gray-400 font-medium">{customer.secondaryPhone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-5">
                  <div className="flex flex-col max-w-[300px]">
                    <span className="text-sm text-gray-600 break-words mb-1 font-medium">{customer.address}</span>
                    <div className="flex items-center gap-2">
                      {customer.latitude && customer.longitude ? (
                        <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                          <Map className="w-3 h-3" />
                          <span>{customer.latitude.toFixed(4)}, {customer.longitude.toFixed(4)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                          <XCircle className="w-3 h-3" />
                          <span>Chưa có GPS</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="p-5 text-center">
                  <Badge className={cn(
                    "rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-none",
                    customer.status === 'ACTIVE' && "bg-green-100 text-green-700 hover:bg-green-100",
                    customer.status === 'INACTIVE' && "bg-gray-100 text-gray-500 hover:bg-gray-100",
                    customer.status === 'SUSPENDED' && "bg-orange-100 text-orange-700 hover:bg-orange-100"
                  )}>
                    {customer.status}
                  </Badge>
                </TableCell>
                <TableCell className="p-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl hover:bg-white hover:shadow-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-gray-100 shadow-xl min-w-[160px]">
                      <DropdownMenuItem onClick={() => onEdit(customer)} className="font-bold text-gray-600 py-2.5 rounded-lg cursor-pointer">
                        <Edit className="w-4 h-4 mr-2 text-blue-500" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewMap(customer)} className="font-bold text-gray-600 py-2.5 rounded-lg cursor-pointer">
                        <Map className="w-4 h-4 mr-2 text-orange-500" />
                        Xem trên bản đồ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewHistory(customer.id)} className="font-bold text-gray-600 py-2.5 rounded-lg cursor-pointer">
                        <History className="w-4 h-4 mr-2 text-purple-500" />
                        Lịch sử dịch vụ
                      </DropdownMenuItem>
                      <div className="h-[1px] bg-gray-50 my-1" />
                      <DropdownMenuItem 
                        onClick={() => onDeactivate(customer.id)}
                        className="font-bold text-red-500 py-2.5 rounded-lg cursor-pointer hover:bg-red-50 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Vô hiệu hóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

const XCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)
