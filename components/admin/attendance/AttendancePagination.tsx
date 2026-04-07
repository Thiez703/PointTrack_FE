import React from 'react'
import { AttendancePagination as IPagination } from '@/app/types/attendance'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  pagination?: IPagination
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

const AttendancePagination: React.FC<PaginationProps> = ({ pagination, onPageChange, onLimitChange }) => {
  if (!pagination) return null

  const { page, limit, total, totalPages } = pagination
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const getPageNumbers = () => {
    const pages = []
    const range = 2 // Number of pages to show before and after current page
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= page - range && i <= page + range)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
      <p className="text-sm text-gray-500">
        Hiển thị <span className="font-semibold text-gray-900">{start}-{end}</span> trên <span className="font-semibold text-gray-900">{total}</span> kết quả
      </p>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 whitespace-nowrap">Số dòng/trang:</span>
          <Select value={String(limit)} onValueChange={(val) => onLimitChange(Number(val))}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map(l => (
                <SelectItem key={l} value={String(l)}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {getPageNumbers().map((p, i) => (
            p === '...' ? (
              <span key={i} className="px-2 text-gray-400">...</span>
            ) : (
              <Button
                key={i}
                variant={p === page ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  "h-8 w-8",
                  p === page ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-gray-600"
                )}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AttendancePagination
