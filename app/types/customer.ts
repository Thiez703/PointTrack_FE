export interface Customer {
  id: number          // ✅ BE Long = number
  name: string
  phone: string
  secondaryPhone?: string
  address: string
  latitude: number | null
  longitude: number | null
  hasGps?: boolean    // ✅ Thêm field này (BE trả về)
  specialNotes?: string
  preferredTimeNote?: string
  source: 'ZALO' | 'FACEBOOK' | 'REFERRAL' | 'HOTLINE' | 'OTHER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt?: string
  stats?: CustomerStats
  recentShifts?: RecentShift[]
}

export interface CustomerStats {
  totalShifts: number
  completedShifts: number
  activePackages: number
  totalLateCheckouts: number
}

export interface RecentShift {
  id: number          // ✅ number not string
  employeeName: string
  shiftDate: string
  startTime: string
  endTime: string
  status: string
}

// ✅ Matches Spring Page<CustomerResponse>
export interface CustomerListResponse {
  content: Customer[]       // ✅ Spring dùng 'content' không phải 'data'
  totalElements: number     // ✅ Spring dùng 'totalElements'
  totalPages: number
  number: number            // ✅ 0-indexed page number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CustomerCreateRequest {
  name: string
  phone: string
  secondaryPhone?: string
  address: string
  latitude: number | null     // null = let BE geocode
  longitude: number | null
  specialNotes?: string
  preferredTimeNote?: string
  source: Customer['source']
  status?: Customer['status']
}

export interface CustomerListParams {
  status?: string
  keyword?: string
  source?: string
  hasGps?: boolean
  page?: number    // 0-indexed để gửi lên BE
  size?: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  warning?: string
  errorCode?: string
}

