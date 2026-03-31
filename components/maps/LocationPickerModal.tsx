'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Check } from 'lucide-react'
import { LocationPickerMap, PickedLocation } from './LocationPickerMap'

interface LocationPickerModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (location: PickedLocation) => void
  initialLocation?: { lat: number; lng: number }
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  onClose,
  onConfirm,
  initialLocation,
}) => {
  const [picked, setPicked] = useState<PickedLocation | null>(null)

  const handleConfirm = () => {
    if (!picked) return
    onConfirm(picked)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[720px] p-0 border-none shadow-2xl rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-orange-500 px-6 py-4 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white font-black text-lg">
              <MapPin className="w-5 h-5" />
              Chọn vị trí trên bản đồ
            </DialogTitle>
          </DialogHeader>
          <p className="text-orange-100 text-[11px] uppercase tracking-widest font-bold mt-1">
            Nhấn hoặc kéo ghim · OpenStreetMap (miễn phí)
          </p>
        </div>

        {/* Map */}
        <div className="p-4 bg-white">
          <LocationPickerMap
            initialLocation={initialLocation}
            onLocationChange={(loc) => setPicked(loc)}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 pb-4 bg-white gap-2 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold text-gray-500"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!picked}
            className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 min-w-[160px]"
          >
            <Check className="w-4 h-4 mr-2" />
            Xác nhận vị trí
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
