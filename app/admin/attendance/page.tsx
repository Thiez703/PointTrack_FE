'use client'

import React, { useState } from 'react'
import { useAttendanceHistory } from '@/hooks/useAttendanceHistory'
import AttendanceSummaryCards from '@/components/admin/attendance/AttendanceSummaryCards'
import AttendanceFilterBar from '@/components/admin/attendance/AttendanceFilterBar'
import AttendanceTable from '@/components/admin/attendance/AttendanceTable'
import AttendancePagination from '@/components/admin/attendance/AttendancePagination'
import AttendanceDetailDrawer from '@/components/admin/attendance/AttendanceDetailDrawer'
import AttendanceNoteModal from '@/components/admin/attendance/AttendanceNoteModal'
import { AttendanceRecord } from '@/app/types/attendance'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AttendanceHistoryPage = () => {
  const {
    records,
    pagination,
    summary,
    locations,
    filters,
    updateFilter,
    resetFilters,
    isLoading,
    isError,
    refetch,
    updateNote,
    isUpdatingNote,
    exportExcel,
    isExporting,
  } = useAttendanceHistory()

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)

  const handleViewDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setDrawerOpen(true)
  }

  const handleEditNote = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setNoteModalOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Lịch sử Chấm công</h1>
        <p className="text-gray-500 mt-1 font-medium">Quản lý và theo dõi thời gian làm việc của nhân viên toàn hệ thống.</p>
      </div>

      {/* Summary Section */}
      <AttendanceSummaryCards 
        summary={summary} 
        activeStatus={filters.status || ''} 
        onStatusClick={(status) => updateFilter({ status, page: 1 })}
      />

      {/* Filters Section */}
      <AttendanceFilterBar 
        filters={filters}
        locations={locations}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        onExport={exportExcel}
        isExporting={isExporting}
      />

      {/* Error State */}
      {isError && (
        <Alert variant="destructive" className="mb-6 rounded-xl border-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi tải dữ liệu</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Đã có lỗi xảy ra khi kết nối với máy chủ. Vui lòng thử lại.</span>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4 flex gap-2">
              <RefreshCcw className="w-3.5 h-3.5" /> Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Table */}
      <AttendanceTable 
        records={records} 
        isLoading={isLoading} 
        onView={handleViewDetail}
        onEditNote={handleEditNote}
      />

      {/* Pagination */}
      {!isLoading && records.length > 0 && (
        <AttendancePagination 
          pagination={pagination}
          onPageChange={(page) => updateFilter({ page })}
          onLimitChange={(limit) => updateFilter({ limit, page: 1 })}
        />
      )}

      {/* Drawer & Modals */}
      <AttendanceDetailDrawer 
        record={selectedRecord}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateNote={(id, note) => updateNote({ id, note })}
        isUpdating={isUpdatingNote}
        onRefresh={refetch}
      />

      <AttendanceNoteModal 
        record={selectedRecord}
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={(id, note) => updateNote({ id, note })}
        isSaving={isUpdatingNote}
      />
    </div>
  )
}

export default AttendanceHistoryPage
