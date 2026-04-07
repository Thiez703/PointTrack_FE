'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, MapPin, CheckCircle2, AlertTriangle, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { customerSchema, CustomerFormValues } from '@/app/validations/customerSchema'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/useCustomer'
import type { Customer } from '@/app/types/customer'
import { SITE_CONFIG } from '@/lib/Constant'
import { toast } from 'sonner'

// ✅ Import bản đồ chọn vị trí (Sử dụng Leaflet - Miễn phí)
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
  const isEditMode = !!customer
  const [isVerifying, setIsVerifying] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

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

  // ✅ Khi chọn vị trí thủ công từ Bản đồ Leaflet
  const handleLocationConfirm = (location: any) => {
    form.setValue('address', location.address, { shouldValidate: true })
    form.setValue('latitude', location.lat, { shouldValidate: true })
    form.setValue('longitude', location.lng, { shouldValidate: true })
    setIsMapOpen(false)
  }

  // ✅ Hàm gọi Geocoding API để gợi ý vị trí từ địa chỉ văn bản
  const handleVerifyLocation = async () => {
    const address = form.getValues('address')
    if (!address || address.length < 5) {
      toast.error('Vui lòng nhập địa chỉ đầy đủ trước khi kiểm tra')
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${SITE_CONFIG.googleMapsApiKey}&language=vi`
      )
      const data = await response.json()

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        const formattedAddress = data.results[0].formatted_address
        
        setGeocodeResult({ lat, lng, formattedAddress })
        form.setValue('latitude', lat)
        form.setValue('longitude', lng)
        toast.success('Đã xác định được tọa độ vị trí!')
      } else {
        toast.error('Không tìm thấy vị trí này trên bản đồ. Vui lòng kiểm tra lại địa chỉ.')
        setGeocodeResult(null)
      }
    } catch (error) {
      toast.error('Lỗi kết nối với Google Maps API')
    } finally {
      setIsVerifying(false)
    }
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

  const lat = form.watch('latitude')
  const lng = form.watch('longitude')

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

          <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-1">
                    <FormLabel className="font-bold text-gray-700 uppercase text-[11px] tracking-widest">Địa chỉ chi tiết *</FormLabel>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleVerifyLocation}
                        disabled={isVerifying}
                        className="h-7 text-[10px] font-black uppercase tracking-tighter text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        {isVerifying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Search className="w-3 h-3 mr-1" />}
                        Tự động tìm
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsMapOpen(true)}
                        className="h-7 text-[10px] font-black uppercase tracking-tighter text-orange-600 hover:bg-orange-100 rounded-lg"
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Ghim bản đồ
                      </Button>
                    </div>
                  </div>
                  <FormControl>
                    <Input placeholder="Số 1, Đường ABC, Quận 1..." {...field} className="rounded-xl border-gray-200 bg-white focus:ring-orange-500 font-semibold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hiển thị vị trí đã chọn (Leaflet Mini Map) */}
            <div className="mt-2">
              {lat && lng ? (
                <div className="space-y-2">
                   <div className="relative w-full h-[180px] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
                      <MiniMapPreview 
                        lat={lat} 
                        lng={lng} 
                        label={form.getValues('address')} 
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg z-[400]">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 px-1">
                      <div className="flex items-center gap-1.5 bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-black border border-green-100">
                        <MapPin className="w-3 h-3" />
                        <span>GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold italic">Vị trí đã được xác nhận</span>
                   </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-bold leading-tight">
                    Khách hàng này chưa có tọa độ GPS. Hãy nhấn "Tự động tìm" hoặc "Ghim bản đồ" để xác định điểm mốc chấm công.
                  </p>
                </div>
              )}
            </div>
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

      {/* ✅ Modal chọn vị trí thủ công (Leaflet) */}
      <LocationPickerModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={lat && lng ? { lat, lng } : undefined}
      />
    </>
  )
}
