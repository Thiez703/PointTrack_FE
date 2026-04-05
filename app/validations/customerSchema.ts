import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string()
    .min(2, 'Tên tối thiểu 2 ký tự')
    .max(255, 'Tên tối đa 255 ký tự'),

  phone: z.string()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'),

  secondaryPhone: z.string()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),

  address: z.string()
    .min(1, 'Vui lòng chọn vị trí trên bản đồ'),

  latitude: z.number({
    required_error: 'Vui lòng chọn vị trí trên bản đồ'
  }).nullable(),

  longitude: z.number({
    required_error: 'Vui lòng chọn vị trí trên bản đồ'
  }).nullable(),

  specialNotes: z.string().max(1000).optional(),

  preferredTimeNote: z.string().max(255).optional(),

  source: z.enum(['ZALO', 'FACEBOOK', 'REFERRAL', 'HOTLINE', 'OTHER']),

  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

