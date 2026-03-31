'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Loader2, Save } from 'lucide-react'
import dynamic from 'next/dynamic'
import { customerSchema, CustomerFormValues } from '@/app/validations/customerSchema'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomer'
import type { Customer } from '@/app/types/customer'
import type { PickedLocation } from '@/components/maps/LocationPickerMap'

// ✅ Dynamically import map components to avoid "window is not defined" during SSR
const LocationPickerModal = dynamic(
  () => import('@/components/maps/LocationPickerModal').then((mod) => mod.LocationPickerModal),
  { ssr: false }
)

const MiniMapPreview = dynamic(
  () => import('@/components/maps/MiniMapPreview').then((mod) => mod.MiniMapPreview),
  { ssr: false, loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-xl" /> }
)
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface CustomerFormProps {
  customer?: Customer | null   // null/undefined = create, Customer = edit
  onSuccess: () => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [isMapOpen, setIsMapOpen] = useState(false)
  const isEditMode = !!customer

  // ✅ Dùng hooks thay vì AdminService
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer()
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer(
    customer?.id  // ✅ number | undefined (safe)
  )
  const isPending = isCreating || isUpdating

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: isEditMode ? {
      name: customer.name,
      phone: customer.phone,
      secondaryPhone: customer.secondaryPhone ?? '',
      address: customer.address ?? '',
      latitude: customer.latitude,
      longitude: customer.longitude,
      specialNotes: customer.specialNotes ?? '',
      preferredTimeNote: customer.preferredTimeNote ?? '',
      source: customer.source,
      status: customer.status,
    } : {
      name: '', phone: '', secondaryPhone: '',
      address: '', latitude: null, longitude: null,
      source: 'OTHER', status: 'ACTIVE',
      specialNotes: '', preferredTimeNote: '',
    }
  })

  const lat = form.watch('latitude')
  const lng = form.watch('longitude')
  const address = form.watch('address')
  const hasLocation = lat !== null && lng !== null

  // ✅ Nhận kết quả từ Google Maps picker
  const handleLocationConfirm = (location: PickedLocation) => {
    form.setValue('address', location.address, { shouldValidate: true })
    form.setValue('latitude', location.lat, { shouldValidate: true })
    form.setValue('longitude', location.lng, { shouldValidate: true })
    setIsMapOpen(false)
  }

  const onSubmit = (values: CustomerFormValues) => {
    const payload = {
      ...values,
      secondaryPhone: values.secondaryPhone || undefined,
    }
    if (isEditMode) {
      updateCustomer(payload, { onSuccess })
    } else {
      createCustomer(payload, { onSuccess })
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Tên khách hàng *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-orange-500 font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Số điện thoại *</FormLabel>
                  <FormControl>
                    <Input placeholder="090xxxxxxx" {...field} className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondaryPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Số điện thoại phụ</FormLabel>
                  <FormControl>
                    <Input placeholder="091xxxxxxx" {...field} className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Nguồn khách hàng</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white font-semibold">
                        <SelectValue placeholder="Chọn nguồn" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl shadow-xl border-gray-100">
                      <SelectItem value="FACEBOOK" className="font-bold">Facebook</SelectItem>
                      <SelectItem value="ZALO" className="font-bold">Zalo</SelectItem>
                      <SelectItem value="HOTLINE" className="font-bold">Hotline</SelectItem>
                      <SelectItem value="REFERRAL" className="font-bold">Người giới thiệu</SelectItem>
                      <SelectItem value="OTHER" className="font-bold">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* ✅ REPLACE: text input address → Google Maps picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Vị trí / Địa chỉ <span className="text-red-500">*</span>
            </label>

            {!hasLocation ? (
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="w-full h-24 border-2 border-dashed border-gray-300 
                           rounded-lg flex flex-col items-center justify-center 
                           gap-2 text-gray-400 hover:border-orange-400 
                           hover:text-orange-500 transition-colors cursor-pointer"
              >
                <MapPin className="w-6 h-6" />
                <span className="text-sm font-medium">
                  Nhấn để chọn vị trí trên bản đồ
                </span>
              </button>
            ) : (
              <div className="space-y-2">
                <MiniMapPreview lat={lat!} lng={lng!} label={address} />
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="text-xs text-orange-500 hover:underline 
                             flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  Thay đổi vị trí
                </button>
              </div>
            )}

            {(form.formState.errors.latitude || 
              form.formState.errors.address) && (
              <p className="text-sm text-red-500">
                Vui lòng chọn vị trí trên bản đồ
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="specialNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Lưu ý đặc biệt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ghi chú về sức khỏe, thú cưng..." 
                      {...field} 
                      className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white min-h-[100px] font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredTimeNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Ghi chú thời gian</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Làm vào sáng Thứ 2..." 
                      {...field} 
                      className="rounded-xl border-gray-100 bg-gray-50 focus:bg-white min-h-[100px] font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              className="flex-1 rounded-xl font-bold text-gray-400 hover:text-gray-600 uppercase text-xs"
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 uppercase tracking-wider"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditMode ? 'Cập nhật' : 'Tạo khách hàng'}
            </Button>
          </div>
        </form>
      </Form>

      <LocationPickerModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={hasLocation 
          ? { lat: lat!, lng: lng! } 
          : undefined}
      />
    </>
  )
}
