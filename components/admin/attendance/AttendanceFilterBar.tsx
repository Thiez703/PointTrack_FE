import React from 'react'
import { AttendanceFilterParams, AttendanceStatus, ShiftType } from '@/app/types/attendance'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, RotateCcw, Download, Filter } from 'lucide-react'

interface FilterBarProps {
  filters: AttendanceFilterParams
  locations: { id: string; name: string }[]
  onFilterChange: (newFilters: Partial<AttendanceFilterParams>) => void
  onReset: () => void
  onExport: () => void
  isExporting: boolean
}

const AttendanceFilterBar: React.FC<FilterBarProps> = ({
  filters,
  locations,
  onFilterChange,
  onReset,
  onExport,
  isExporting
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border rounded-xl shadow-sm mb-6">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm tên NV..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      <Select value={filters.locationId} onValueChange={(val) => onFilterChange({ locationId: val })}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Địa điểm" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả địa điểm</SelectItem>
          {locations.map(loc => (
            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(val) => onFilterChange({ status: val as AttendanceStatus })}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="on_time">Đúng giờ</SelectItem>
          <SelectItem value="late">Đi trễ</SelectItem>
          <SelectItem value="early_leave">Về sớm</SelectItem>
          <SelectItem value="absent">Vắng mặt (Check-in trễ)</SelectItem>
          <SelectItem value="missed">Vắng mặt (Không check-in)</SelectItem>
          <SelectItem value="missing_out">Thiếu check-out</SelectItem>
          <SelectItem value="overtime">Tăng ca</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.shiftType} onValueChange={(val) => onFilterChange({ shiftType: val as ShiftType })}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Loại ca" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả ca</SelectItem>
          <SelectItem value="morning">Ca Sáng</SelectItem>
          <SelectItem value="afternoon">Ca Chiều</SelectItem>
          <SelectItem value="night">Ca Tối</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
          className="w-full md:w-40"
        />
        <span className="text-gray-400">-</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
          className="w-full md:w-40"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button onClick={onReset} variant="outline" className="flex gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
        <Button onClick={onExport} disabled={isExporting} variant="secondary" className="bg-green-600 hover:bg-green-700 text-white flex gap-2">
          <Download className="w-4 h-4" /> {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
        </Button>
      </div>
    </div>
  )
}

export default AttendanceFilterBar
