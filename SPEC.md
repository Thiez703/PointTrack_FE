# PointTrack FE — Đặc Tả Kỹ Thuật Toàn Bộ Codebase

> Ngày cập nhật: 2026-03-30
> Phiên bản: dựa trên nhánh `main`, commit `a92bfb9`

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu hình & môi trường](#2-cấu-hình--môi-trường)
3. [Kiến trúc routing](#3-kiến-trúc-routing)
4. [Luồng xác thực (Auth Flow)](#4-luồng-xác-thực-auth-flow)
5. [Lớp HTTP & proxy API](#5-lớp-http--proxy-api)
6. [Services (API Layer)](#6-services-api-layer)
7. [Next.js API Routes (Proxy)](#7-nextjs-api-routes-proxy)
8. [Types & Schema Validation](#8-types--schema-validation)
9. [State Management (Zustand)](#9-state-management-zustand)
10. [Custom Hooks](#10-custom-hooks)
11. [Các trang (Pages)](#11-các-trang-pages)
12. [Components](#12-components)
13. [Utilities & Libraries](#13-utilities--libraries)
14. [Biến môi trường](#14-biến-môi-trường)
15. [Dependencies đầy đủ](#15-dependencies-đầy-đủ)
16. [Danh sách API tích hợp với backend](#16-danh-sách-api-tích-hợp-với-backend)
17. [Cấu trúc thư mục đầy đủ](#17-cấu-trúc-thư-mục-đầy-đủ)

---

## 1. TỔNG QUAN DỰ ÁN

**PointTrack** là ứng dụng web quản lý chấm công nhân viên dựa trên GPS. Frontend được xây dựng bằng **Next.js 15 App Router**, giao tiếp với backend **Spring Boot Java** (mặc định `http://localhost:8080/api`) thông qua lớp proxy API của Next.js.

### Đặc điểm chính
- Chấm công dựa trên GPS (check-in/check-out kèm xác thực vị trí)
- Quản lý ca làm việc (lịch tuần, kéo-thả phân ca, lặp lịch, sao chép tuần)
- Quản lý khách hàng (địa điểm làm việc) với bản đồ Leaflet + OpenStreetMap
- Dashboard nhân viên (thống kê lương, giờ làm, ngày muộn, lịch sử)
- Dashboard admin (quản lý nhân sự, khách hàng, ca, chấm công, cài đặt hệ thống)
- Xác thực JWT với cookie HttpOnly, tự động refresh token
- Hỗ trợ Dark mode, responsive mobile/desktop

---

## 2. CẤU HÌNH & MÔI TRƯỜNG

### 2.1 `package.json`
```json
{
  "name": "pointtrack-fe",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prettier": "prettier --check .",
    "prettier:fix": "prettier --write ."
  }
}
```

### 2.2 `next.config.js`
| Thuộc tính | Giá trị | Ghi chú |
|---|---|---|
| `output` | `'standalone'` | Tương thích Docker |
| `distDir` | `'dist'` | Thư mục build output |
| `eslint.ignoreDuringBuilds` | `true` | Bỏ qua lint khi build |
| `images.unoptimized` | `true` | Tắt tối ưu ảnh Next.js |
| `images.remotePatterns` | S3 AWS bucket | `chat-webapp-nghiadev.s3.ap-southeast-1.amazonaws.com` |
| `logging.fullUrl` | `true` | Log URL đầy đủ khi dev |

### 2.3 `tsconfig.json`
| Thuộc tính | Giá trị |
|---|---|
| `target` | `ES5` |
| `strict` | `true` |
| `moduleResolution` | `bundler` |
| `paths` | `@/*` → root `.` |
| `incremental` | `true` |
| `plugins` | `next` |

### 2.4 `tailwind.config.ts`
- Dark mode: `class` (next-themes điều khiển)
- Content: `./app/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`
- Theme extend:
  - CSS variables HSL cho toàn bộ màu sắc (light & dark)
  - Brand: Primary teal `#376E60`, Secondary orange `#FFA500`
  - Custom animations: `accordion-up`, `accordion-down`
  - Custom color schemes: AI Doctor, Pond Management

### 2.5 `components.json` (shadcn/ui config)
- Style: `default`
- Tailwind CSS + TypeScript
- Path aliases: `@/components/ui`, `@/lib/utils`

---

## 3. KIẾN TRÚC ROUTING

### 3.1 Cấu trúc thư mục `app/`

```
app/
├── (auth)/                   # Group layout: trang auth công khai
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── reset-password/page.tsx
├── auth/                     # Luồng auth bắt buộc
│   └── first-change-password/page.tsx
├── admin/                    # Dashboard admin (protected)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── customers/page.tsx
│   ├── personnel/
│   │   ├── page.tsx
│   │   └── create/page.tsx
│   ├── schedule/page.tsx
│   ├── shift-templates/page.tsx
│   ├── salary-levels/page.tsx
│   ├── attendance/page.tsx
│   └── settings/page.tsx
├── api/                      # Next.js API routes (proxy)
│   └── auth/
│       ├── login/route.ts
│       ├── logout/route.ts
│       ├── me/route.ts
│       ├── me-token/route.ts
│       ├── refresh/route.ts
│       └── clear-force-password/route.ts
├── services/                 # API service layer (client)
├── types/                    # TypeScript types & Zod schemas
├── validations/              # Form validation schemas
├── globals.css
├── layout.tsx                # Root layout (server)
├── layoutClient.tsx          # Root layout (client)
├── page.tsx                  # Trang chủ / Dashboard
├── profile/page.tsx
├── checkin/page.tsx
├── calendar/page.tsx
├── exchange/page.tsx
├── holiday/page.tsx
├── error.tsx
├── global-error.tsx
└── not-found.tsx
```

### 3.2 `middleware.ts`

**Vị trí**: gốc dự án
**Matcher**: Tất cả routes trừ `/_next/static`, `/_next/image`, `*.ico`, `*.png`, `*.jpg`, `*.svg`

**Logic bảo vệ**:

| Điều kiện | Hành động |
|---|---|
| Route protected + không có token → | Redirect `/login` |
| Route protected + có cookie `forcePasswordChange=true` + chưa ở trang đổi mật khẩu → | Redirect `/auth/first-change-password` |
| Route auth (`/login`, `/reset-password`, ...) + đã có token → | Redirect `/` |
| Các route khác → | Cho qua |

**Routes protected**: `/`, `/profile`, `/checkin`, `/calendar`, `/exchange`, `/holiday`, `/admin/*`
**Routes auth công khai**: `/login`, `/signup`, `/reset-password`, `/forgot-password`
**Tokens đọc từ cookies**: `accessToken`, `refreshToken`

---

## 4. LUỒNG XÁC THỰC (AUTH FLOW)

### 4.1 Đăng nhập
1. User nhập số điện thoại + mật khẩu + CAPTCHA Turnstile
2. `LoginForm` gọi `AuthService.login()` → `POST /api/auth/login` (Next.js proxy)
3. Next.js API route `app/api/auth/login/route.ts`:
   - Gọi `AuthService.loginJava()` → `POST /v1/auth/login` (Spring Boot trực tiếp)
   - Decode JWT để lấy `exp`
   - Set HttpOnly cookies: `accessToken` (expires = JWT exp), `refreshToken` (expires = JWT exp)
   - Nếu `forcePasswordChange = true` → set cookie `forcePasswordChange=true`
   - Trả `AuthResponse` về client
4. Client nhận response:
   - Gọi `setAuth(data)` → lưu vào Zustand store
   - Gọi `tokenUtils.setToken()` + `setRefreshToken()` → lưu vào localStorage
   - Nếu `forcePasswordChange` → redirect `/auth/first-change-password`
   - Nếu role = ADMIN → redirect `/admin`
   - Ngược lại → redirect `/`

### 4.2 Khôi phục session (Page reload)
1. `components/providers/UserInitializer.tsx` mount khi app load
2. Gọi `useCurrentUser()` hook:
   - `AuthService.meTokenNext()` → `GET /api/auth/me-token` → trả `AuthResponse` từ cookie
   - `AuthService.me(accessToken)` → `GET /v1/auth/me` → trả user profile đầy đủ
3. Sync data vào Zustand (`setUserDetail`, `setAccessAndRefreshToken`)
4. Sync tokens vào localStorage (cho `apiJava` interceptor)

### 4.3 Refresh Token
1. `apiJava` response interceptor nhận 401
2. Nếu không phải đang refresh → đặt `isRefreshing = true`, thêm request vào queue
3. Gọi `POST /api/auth/refresh` (Next.js proxy):
   - Lấy `refreshToken` từ cookie
   - Gọi `AuthService.refresh(refreshToken)` → Spring Boot
   - Decode tokens mới, set cookies mới
4. Sau khi refresh thành công:
   - Cập nhật token trong localStorage và Zustand
   - Xử lý toàn bộ queue (retry các request bị fail)
5. Nếu refresh thất bại → `logout()`, redirect `/login`

### 4.4 Đăng xuất
1. Gọi `AuthService.logoutNext()` → `POST /api/auth/logout`
2. Next.js API route xóa cookies `accessToken` + `refreshToken`
3. Gọi `AuthService.logout()` với token (best-effort, tiếp tục dù fail)
4. Zustand `logout()`: xóa localStorage, reset store
5. Redirect `/login`

### 4.5 Đổi mật khẩu lần đầu
1. Middleware bắt cookie `forcePasswordChange=true` → redirect `/auth/first-change-password`
2. User điền mật khẩu mới (Zod validation: min 8 chars, 1 uppercase, 1 digit)
3. Gọi `AuthService.firstChangePassword()` → `PUT /v1/auth/password/first-change`
4. Gọi `POST /api/auth/clear-force-password` → xóa cookie `forcePasswordChange`
5. Redirect `/`

### 4.6 Quên mật khẩu / Reset qua OTP
1. Nhập số điện thoại → `POST /v1/auth/password/forgot`
2. Nhập OTP 6 chữ số → `POST /v1/auth/password/verify-otp` → nhận `resetToken`
3. Nhập mật khẩu mới → `PUT /v1/auth/password/reset` với `resetToken`

---

## 5. LỚP HTTP & PROXY API

### 5.1 `lib/axios.ts`

Xuất **2 Axios instances**:

#### `apiJava` — Gọi trực tiếp Spring Boot (server-side & đặc biệt)
```typescript
baseURL: NEXT_PUBLIC_API_BASE_URL || NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
```
- **Request interceptor**: Đính `Authorization: Bearer <token>` từ `tokenUtils.getToken()`
- **Response interceptor (401 handling)**:
  - Nếu `isRefreshing = false`: bắt đầu refresh, set flag, thêm vào queue
  - Nếu `isRefreshing = true`: thêm vào queue (pending requests)
  - Sau refresh thành công: retry toàn bộ queue với token mới
  - Sau refresh thất bại: reject toàn bộ queue, gọi logout

#### `apiNext` — Gọi Next.js API routes `/api` (client-side)
```typescript
baseURL: '/api'
withCredentials: true  // Tự động gửi HttpOnly cookies
```
- **Response interceptor**: Chuyển đổi lỗi thành `{ message, errorCode }`

#### `api` (default export)
- Alias của `apiJava`

### 5.2 Refresh Token Queue
```typescript
let isRefreshing = false
let failedQueue: Array<{ resolve, reject }> = []

function processQueue(error, token = null) {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token))
  failedQueue = []
}
```

---

## 6. SERVICES (API LAYER)

Tất cả service files nằm trong `app/services/`, dùng `apiNext` cho client-side calls, `apiJava` cho một số direct calls.

### 6.1 `auth.service.ts` — `AuthService`

| Method | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `loginJava(userData)` | POST | `/v1/auth/login` | Đăng nhập trực tiếp Spring Boot |
| `login(userData)` | POST | `/api/auth/login` | Đăng nhập qua Next.js proxy (set cookie) |
| `refresh(refreshToken)` | POST | `/v1/auth/token/refresh` | Làm mới token |
| `logout(token?)` | POST | `/v1/auth/logout` | Đăng xuất khỏi backend |
| `logoutNext()` | POST | `/api/auth/logout` | Xóa cookie qua Next.js proxy |
| `meNext()` | GET | `/api/auth/me` | Lấy profile qua Next.js proxy |
| `meTokenNext()` | GET | `/api/auth/me-token` | Lấy AuthResponse từ cookie |
| `me(token?)` | GET | `/v1/auth/me` | Lấy profile trực tiếp Spring Boot |
| `getProfile()` | GET | `/v1/auth/profile` | Lấy profile đầy đủ |
| `updateProfile(data)` | PUT | `/v1/auth/profile` | Cập nhật profile |
| `forgotPassword(phoneNumber)` | POST | `/v1/auth/password/forgot` | Quên mật khẩu |
| `verifyOtp(phoneNumber, otp)` | POST | `/v1/auth/password/verify-otp` | Xác thực OTP |
| `resetPasswordWithToken(data)` | PUT | `/v1/auth/password/reset` | Reset mật khẩu với token |
| `changePassword(data)` | PUT | `/v1/auth/password/change` | Đổi mật khẩu |
| `firstChangePassword(data)` | PUT | `/v1/auth/password/first-change` | Đổi mật khẩu lần đầu (bắt buộc) |

### 6.2 `user.service.ts` — `UserService`

| Method | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `signup(userData)` | POST | `/user/signup` | Đăng ký (deprecated) |
| `getProfile(userId)` | GET | `/user/profile/{userId}` | Lấy profile theo userId |
| `saveEdit(userData)` | POST | `/user/saveEdit` | Lưu chỉnh sửa |
| `updateProfile(userData)` | POST | `/user/edit-profile` | Cập nhật profile |
| `changePassword(data)` | POST | `/user/change-password` | Đổi mật khẩu |
| `getAddresses()` | GET | `/user/address` | Lấy danh sách địa chỉ |
| `addAddress(data)` | POST | `/user/address/add` | Thêm địa chỉ |
| `updateAddress(id, data)` | PUT | `/user/address/{id}` | Cập nhật địa chỉ |
| `deleteAddress(id)` | DELETE | `/user/address/{id}` | Xóa địa chỉ |
| `setDefaultAddress(id)` | POST | `/user/address/{id}/set-default` | Đặt địa chỉ mặc định |
| `getAll()` | GET | `/user/getAll` | Lấy tất cả user |
| `uploadAvatar(formData)` | POST | `/user/upload-avatar` | Upload avatar |
| `getMe()` | GET | `/v1/employees/me` | Lấy profile nhân viên hiện tại |
| `connectUser(stompClient, user)` | STOMP | `/app/user.connectUser` | Kết nối WebSocket |
| `disconnectUser(stompClient, user)` | STOMP | `/app/user.disconnectUser` | Ngắt kết nối WebSocket |

### 6.3 `admin.service.ts` — `AdminService`

#### Personnel (Nhân sự)
| Method | HTTP | Endpoint |
|---|---|---|
| `getPersonnel(params)` | GET | `/v1/employees` (paginated) |
| `getPersonnelStats()` | GET | `/v1/employees/statistics` |
| `createEmployee(data)` | POST | `/v1/employees` |
| `deleteEmployee(id)` | DELETE | `/v1/employees/{id}` |
| `updateEmployee(id, data)` | PUT | `/v1/employees/{id}` |
| `updateEmployeeStatus(id, status)` | PATCH | `/v1/employees/{id}/status` |
| `assignSalaryLevel(employeeId, salaryLevelId)` | PATCH | `/v1/employees/{employeeId}/salary-level` |

#### Shift Templates
| Method | HTTP | Endpoint |
|---|---|---|
| `createShiftTemplate(data)` | POST | `/v1/shift-templates` |
| `updateShiftTemplate(id, data)` | PUT | `/v1/shift-templates/{id}` |
| `deleteShiftTemplate(id)` | DELETE | `/v1/shift-templates/{id}` |

#### Attendance & Scheduling
| Method | HTTP | Endpoint |
|---|---|---|
| `scheduleWork(data)` | POST | `/v1/attendance/schedule` |
| `getAttendanceRecords(params)` | GET | `/v1/attendance/records` |
| `approveExplanation(explanationId)` | POST | `/v1/attendance/approve` |

#### Settings
| Method | HTTP | Endpoint |
|---|---|---|
| `getSettings()` | GET | `/v1/settings` |
| `updateGracePeriod(data)` | PUT | `/v1/settings/grace-period` |

#### Salary Levels
| Method | HTTP | Endpoint |
|---|---|---|
| `getSalaryLevels()` | GET | `/v1/salary-levels` |
| `createSalaryLevel(data)` | POST | `/v1/salary-levels` |

### 6.4 `attendance.service.ts` — `AttendanceService`

| Method | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `createSchedule(data)` | POST | `/v1/attendance/schedule/create` | Tạo lịch làm việc |
| `getAllSchedules()` | GET | `/v1/attendance/schedule/all` | Lấy toàn bộ lịch |
| `checkIn(data)` | POST | `/v1/shifts/{shiftId}/check-in` | Check-in (GPS + ảnh) |
| `checkOut(data)` | POST | `/v1/shifts/{shiftId}/check-out` | Check-out (GPS + ảnh) |
| `approveExplanation(id, reviewNote)` | PUT | `/v1/attendance/explanations/{id}/approve` | Duyệt giải trình |
| `rejectExplanation(id, reviewNote)` | PUT | `/v1/attendance/explanations/{id}/reject` | Từ chối giải trình |
| `adminUpdate(recordId, data)` | PUT | `/v1/attendance/{recordId}/admin-update` | Admin sửa bản ghi |

### 6.5 `file.service.ts` — `FileService`

| Method | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `tmpUpload(formData)` | POST | `/tmpUpload` | Upload tạm (trả S3 URL) |
| `fileDownload(body)` | POST | `/files/download` | Tải file |

### 6.6 `customer.service.ts` — `customerService`

| Method | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `getList(params)` | GET | `/v1/customers` | Danh sách (phân trang, lọc) |
| `getById(id)` | GET | `/v1/customers/{id}` | Chi tiết khách hàng |
| `create(data)` | POST | `/v1/customers` | Tạo khách hàng |
| `update(id, data)` | PUT | `/v1/customers/{id}` | Cập nhật |
| `deactivate(id)` | DELETE | `/v1/customers/{id}` | Vô hiệu hóa (soft delete) |
| `updateGps(id, lat, lng)` | PUT | `/v1/customers/{id}/gps` | Cập nhật toạ độ GPS |
| `reGeocode(id)` | POST | `/v1/customers/{id}/geocode` | Reverse geocode địa chỉ |
| `getActiveWithGps()` | GET | `/v1/customers/active-with-gps` | KH active có GPS |
| `importExcel(file)` | POST | `/v1/customers/import` | Import từ Excel |
| `downloadTemplate()` | GET | `/v1/customers/import/template` | Tải template XLSX |

### 6.7 `scheduling.service.ts` — `SchedulingService`

| Method | HTTP | Endpoint | Mô tả |
|---|---|---|---|
| `getShifts(params)` | GET | `/v1/shifts` | Danh sách ca (lọc tuần/tháng/NV) |
| `checkConflict(params)` | GET | `/v1/shifts/conflict-check` | Kiểm tra xung đột ca |
| `getAvailableEmployees(params)` | GET | `/v1/shifts/available-employees` | NV rảnh trong khoảng giờ |
| `getShiftTemplates()` | GET | `/v1/shift-templates` | Danh sách mẫu ca |
| `createShift(data)` | POST | `/v1/shifts` | Tạo ca |
| `assignShift(data)` | POST | `/v1/shifts/assign` | Phân ca (kéo-thả) |
| `createRecurringShift(data)` | POST | `/v1/shifts/recurring` | Tạo ca lặp lịch |
| `assignEmployeeToExistingShift(shiftId, employeeId)` | PUT | `/v1/shifts/{shiftId}/assign` | Gán NV vào ca có sẵn |
| `copyWeek(data)` | POST | `/v1/shifts/copy-week` | Sao chép lịch tuần |
| `cancelShift(id)` | DELETE | `/v1/shifts/{id}` | Hủy ca |
| `getOpenShifts()` | GET | `/v1/shifts/open` | Ca mở (tự đăng ký) |
| `claimShift(shiftId)` | POST | `/v1/shifts/{shiftId}/claim` | NV tự nhận ca |
| `confirmShift(shiftId)` | POST | `/v1/shifts/{shiftId}/confirm` | Xác nhận ca |

---

## 7. NEXT.JS API ROUTES (PROXY)

Tất cả nằm trong `app/api/auth/`:

### `POST /api/auth/login` — `login/route.ts`
**Input**: `{ phoneNumber, password, captchaToken }`
**Logic**:
1. Gọi `AuthService.loginJava()` → Spring Boot
2. Decode JWT lấy `exp`
3. Set HttpOnly cookies: `accessToken`, `refreshToken`
4. Set cookie `forcePasswordChange` nếu flag = true
5. Return `AuthResponse`

**Errors**: AxiosError → trả error của backend hoặc 500

---

### `POST /api/auth/logout` — `logout/route.ts`
**Logic**:
1. Xóa cookies `accessToken`, `refreshToken`
2. Gọi `AuthService.logout()` với token (best-effort)
3. Return `{ success: true }`

---

### `GET /api/auth/me` — `me/route.ts`
**Logic**:
1. Đọc `accessToken` từ cookie
2. Nếu không có → 401
3. Gọi `AuthService.me(accessToken)` → Spring Boot
4. Return user profile

---

### `GET /api/auth/me-token` — `me-token/route.ts`
**Logic**: Đọc `AuthResponse` từ cookies, trả về client

---

### `POST /api/auth/refresh` — `refresh/route.ts`
**Logic**:
1. Đọc `refreshToken` từ cookie
2. Nếu không có → 401
3. Gọi `AuthService.refresh(refreshToken)` → Spring Boot
4. Decode tokens mới, set cookies mới
5. Return `AuthResponse` mới

---

### `POST /api/auth/clear-force-password` — `clear-force-password/route.ts`
**Logic**: Xóa cookie `forcePasswordChange`

---

## 8. TYPES & SCHEMA VALIDATION

### 8.1 `app/types/auth.schema.ts`

#### Zod Schemas
```typescript
LoginSchema = z.object({
  phoneNumber: z.string().regex(/^0\d{9}$/),
  password: z.string().min(1),
  captchaToken: z.string().min(1)
})

newPasswordSchema = z.string()
  .min(8)
  .regex(/[A-Z]/, 'Phải có ít nhất 1 chữ hoa')
  .regex(/[0-9]/, 'Phải có ít nhất 1 chữ số')

ConfirmResetPasswordSchema = z.object({
  resetToken: z.string(),
  newPassword: newPasswordSchema,
  confirmPassword: z.string()
}).refine(confirmMatch)

ForgotPasswordSchema = z.object({ phoneNumber: z.string().regex(/^0\d{9}$/) })

VerifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^0\d{9}$/),
  otp: z.string().length(6).regex(/^\d+$/)
})
```

#### Types
```typescript
LoginFormValues    // Inferred từ LoginSchema
AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl: string | null
  role: string
  forcePasswordChange: boolean
}
UserMeResponse {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  avatarUrl: string | null
  status: string
  role: { id, name, description }
  salaryLevelId: string | null
  salaryLevelName: string | null
  createdAt: string
}
```

### 8.2 `app/types/user.schema.ts`
```typescript
WorkStatistics {
  summary: {
    totalWorkDaysThisMonth: number
    otHoursThisMonth: number
    lateDaysThisMonth: number
    estimatedSalary: number
    totalWorkHours: number
  }
  history: Array<{ date: string, hours: number, status: string }>
}
EmployeeProfile {
  id: string
  employeeCode: string
  fullName: string
  phoneNumber: string
  email: string
  role: string
  avatarUrl: string | null
  position: string
  department: string
  hiredDate: string
  status: string
  workStatistics: WorkStatistics
}
EmployeeProfileResponse {
  success: boolean
  message: string
  data: EmployeeProfile
}
```

### 8.3 `app/types/attendance.schema.ts`
```typescript
// Enums
ShiftType: 'NORMAL' | 'HOLIDAY' | 'OT_EMERGENCY'
ShiftStatus: 'DRAFT' | 'PUBLISHED' | 'ASSIGNED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'MISSING_OUT' | 'CANCELLED'

// Check-in/out
CheckInFormData { shiftId: string, latitude: number, longitude: number, photoUrl?: string }
CheckInResponse {
  attendanceRecordId: string
  status: 'ON_TIME' | 'LATE' | 'PENDING_APPROVAL'
  checkInTime: string
  distanceMeters: number
  gpsValid: boolean
  lateMinutes: number
  explanationRequestId?: string
  message: string
}
CheckOutFormData { shiftId: string, latitude: number, longitude: number, photoUrl?: string }
CheckOutResponse {
  attendanceRecordId: string
  status: string
  checkOutTime: string
  actualMinutes: number
  earlyLeaveMinutes: number
  otMultiplier: number
  message: string
}
ApiAttendanceResponse<T> {
  success: boolean
  data: T
  message: string
  warning?: string
  errorCode?: string
  conflictDetail?: object
}

// Shift
ShiftSchema {
  id: string
  employee: { id, name, avatarUrl }
  customer: { id, name, address, latitude, longitude }
  shiftTemplate: { id, name, startTime, endTime, type }
  shiftDate: string
  startTime: string
  endTime: string
  status: ShiftStatus
  checkInTime?: string
  checkOutTime?: string
  checkInLat?: number
  checkInLng?: number
  checkOutLat?: number
  checkOutLng?: number
  distanceMeters?: number
  lateMinutes?: number
  earlyLeaveMinutes?: number
  explanationId?: string
}

// Conflict
ShiftConflictResponse {
  hasConflict: boolean
  conflictType: 'OVERLAP' | 'BUFFER'
  detail: string
  conflictingShiftId?: string
  minutesShort?: number
}
AvailableEmployee {
  employeeId: string
  employeeName: string
  phoneNumber: string
  nextShiftEndTime?: string
}

// Request DTOs
CreateShiftRequest { employeeId, customerId, shiftTemplateId, shiftDate, startTime?, endTime?, type? }
AssignShiftRequest { employeeId, customerId, shiftTemplateId, shiftDate }
RecurringShiftRequest { employeeId, customerId, shiftTemplateId, startDate, endDate, daysOfWeek[] }
CopyWeekRequest { sourceWeekStart: string, targetWeekStart: string }
AdminUpdateAttendanceRequest { checkInTime?, checkOutTime?, status?, note? }
WorkScheduleRequest { employeeId, customerId, shiftTemplateId, workDate }
WorkScheduleResponse { id, employeeName, customerName, shiftName, workDate, status }
```

### 8.4 `app/types/admin.schema.ts`

#### Zod Schemas
```typescript
CreateEmployeeSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().regex(/^0\d{9}$/),
  email: z.string().email(),
  salaryLevelId: z.string().optional(),
  hiredDate: z.string().optional(),
  area: z.string().optional(),
  skills: z.string().optional(),
  avatarUrl: z.string().optional()
})

ShiftTemplateSchema = z.object({
  name: z.string().min(1),
  startTime: z.string(),     // HH:mm
  endTime: z.string(),       // HH:mm
  type: z.enum(['OFFICE', 'SHIFT'])
})

ScheduleSchema = z.object({
  employeeId: z.string(),
  customerId: z.string(),
  shiftTemplateId: z.string(),
  workDate: z.string()       // YYYY-MM-DD
})

GracePeriodSchema = z.object({
  lateMinutes: z.number().min(0),
  earlyLeaveMinutes: z.number().min(0)
})

PenaltyRuleSchema = z.object({
  ruleName: z.string(),
  amount: z.number()
})

SalaryLevelSchema = z.object({
  name: z.string(),
  baseSalary: z.number(),
  allowance: z.number()
})
```

#### Types
```typescript
Employee {
  id: string
  employeeCode: string
  fullName: string
  phone: string
  email: string
  position: string
  department: string
  avatarUrl: string | null
  area: string
  skills: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  role: string
  isFirstLogin: boolean
  hiredDate: string
  salaryLevelId: string | null
  salaryLevelName: string | null
  createdAt: string
  updatedAt: string
}
PersonnelStats {
  totalEmployees: number
  activeEmployees: number
  onLeaveEmployees: number
  newEmployeesThisMonth: number
  totalTrend: number
  activeRate: number
}
ShiftTemplate {
  id: string
  name: string
  startTime: string   // HH:mm
  endTime: string     // HH:mm
  type: 'OFFICE' | 'SHIFT'
}
AttendanceRecord {
  id: string
  employeeName: string
  customerName: string
  shiftName: string
  checkInTime: string
  checkOutTime: string
  status: string
}
SystemSettings {
  lateMinutes: number
  earlyLeaveMinutes: number
  penaltyRules: PenaltyRule[]
}
SalaryLevel {
  id: string
  name: string
  baseSalary: number
  allowance: number
}
ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
```

### 8.5 `app/types/customer.ts`
```typescript
Customer {
  id: string
  name: string
  phone: string
  secondaryPhone?: string
  address: string
  latitude: number
  longitude: number
  hasGps?: boolean
  specialNotes?: string
  preferredTimeNote?: string
  source: 'ZALO' | 'FACEBOOK' | 'REFERRAL' | 'HOTLINE' | 'OTHER'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt?: string
  stats?: CustomerStats
  recentShifts?: RecentShift[]
}
CustomerStats {
  totalShifts: number
  completedShifts: number
  activePackages: number
  totalLateCheckouts: number
}
RecentShift {
  id: string
  employeeName: string
  shiftDate: string
  startTime: string
  endTime: string
  status: string
}
CustomerListResponse {
  content: Customer[]
  totalElements: number
  totalPages: number
  number: number        // current page (0-based)
  size: number
  first: boolean
  last: boolean
  empty: boolean
}
CustomerCreateRequest {
  name: string
  phone: string
  secondaryPhone?: string
  address: string
  latitude?: number
  longitude?: number
  specialNotes?: string
  preferredTimeNote?: string
  source: string
  status?: string
}
CustomerListParams {
  status?: string
  keyword?: string
  source?: string
  hasGps?: boolean
  page?: number
  size?: number
}
```

### 8.6 `app/types/file.schema.ts`
```typescript
FileControlDetailSchema = z.object({
  detailNo: z.number(),
  tmpPath: z.string(),
  fileName: z.string(),
  deleteFlag: z.boolean(),
  createDatetime: z.string(),
  createUserCode: z.string(),
  fileNameDifferenceFlag: z.boolean()
})
FileControlSchema = z.object({
  fileControlId: z.string().optional(),
  objectId: z.string().optional(),
  fileControlDetails: z.array(FileControlDetailSchema)
})
FileControlRes = { data: FileControlSchema, message: string }
FileControlListRes = { data: FileControlSchema[], message: string }
```

### 8.7 `app/validations/customerSchema.ts`
```typescript
customerSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().regex(/^0\d{9}$/),
  secondaryPhone: z.string().optional().or(z.literal('')),
  address: z.string().min(1, 'Vui lòng chọn địa chỉ từ bản đồ'),
  latitude: z.number({ required_error: 'Vui lòng chọn vị trí trên bản đồ' }),
  longitude: z.number({ required_error: 'Vui lòng chọn vị trí trên bản đồ' }),
  specialNotes: z.string().max(1000).optional(),
  preferredTimeNote: z.string().max(255).optional(),
  source: z.enum(['ZALO', 'FACEBOOK', 'REFERRAL', 'HOTLINE', 'OTHER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
})
CustomerFormValues  // Inferred từ customerSchema
```

---

## 9. STATE MANAGEMENT (ZUSTAND)

### 9.1 `stores/useAuthStore.ts`

**Persistence**: localStorage (`auth-storage`)

#### State
```typescript
interface AuthState {
  userInfo?: {
    userId: string
    fullName: string
    email: string
    phoneNumber: string
    avatarUrl: string | null
    role: string
  }
  accessToken: string | null
  refreshToken?: string | null
  forcePasswordChange: boolean
}
```

#### Actions
| Action | Mô tả |
|---|---|
| `setAccessToken(token)` | Set access token |
| `setRefreshToken(token)` | Set refresh token |
| `setAuth(data: AuthResponse)` | Điền đầy đủ user info + tokens từ login response |
| `setUserInfo(info?)` | Cập nhật user info |
| `setAccessAndRefreshToken(data)` | Sync tokens từ AuthResponse |
| `setUserDetail(info)` | Cập nhật linh hoạt (xử lý cả `AuthResponse` lẫn `UserMeResponse`) |
| `logout()` | Xóa tokens khỏi localStorage + store, redirect `/login` |

### 9.2 `stores/useSidebarStore.ts`

**Persistence**: localStorage (chỉ `isCollapsed`)

#### State
```typescript
interface SidebarState {
  isOpen: boolean        // Mobile drawer open/close
  isCollapsed: boolean   // Desktop sidebar collapse
}
```

#### Actions
| Action | Mô tả |
|---|---|
| `toggleSidebar()` | Toggle `isOpen` (mobile) |
| `toggleCollapse()` | Toggle `isCollapsed` (desktop) |
| `setIsOpen(isOpen)` | Set mobile drawer state |
| `setIsCollapsed(isCollapsed)` | Set desktop collapse state |

---

## 10. CUSTOM HOOKS

### 10.1 `hooks/useCurrentUser.ts`
**Mục đích**: Khôi phục session khi tải lại trang

**Logic**:
1. Query `AuthService.meTokenNext()` → lấy `AuthResponse` từ cookie
2. Query `AuthService.me(accessToken)` → lấy user profile đầy đủ từ Spring Boot
3. `setUserDetail(data)` → sync vào Zustand
4. `setAccessAndRefreshToken(data)` → sync tokens
5. `tokenUtils.setToken(accessToken)` → sync localStorage

**Return**: `{ user: UserMeResponse | undefined, isLoading: boolean }`

---

### 10.2 `hooks/use-debounce.ts`
```typescript
function useDebounce<T>(value: T, delay?: number): T
// Debounce value với delay mặc định 500ms
// Dùng cho search input, filter params
```

---

### 10.3 `hooks/useCustomer.ts`

**Query Keys** (cache management):
```typescript
customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (params) => [...customerKeys.lists(), params],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
  activeWithGps: () => [...customerKeys.all, 'active-with-gps']
}
```

**Query Hooks**:
| Hook | Mô tả |
|---|---|
| `useCustomerList(params)` | Danh sách khách hàng (phân trang) |
| `useCustomerDetail(id)` | Chi tiết khách hàng (enabled khi có id) |
| `useActiveCustomersWithGps()` | KH active có GPS (dùng cho check-in) |

**Mutation Hooks** (đều có toast thành công/thất bại):
| Hook | Mô tả | Invalidate Cache |
|---|---|---|
| `useCreateCustomer()` | Tạo khách hàng mới | `customerKeys.lists()` |
| `useUpdateCustomer(id)` | Cập nhật khách hàng | `customerKeys.lists()`, `customerKeys.detail(id)` |
| `useDeactivateCustomer()` | Vô hiệu hóa | `customerKeys.lists()` |
| `useImportCustomers()` | Import Excel (toast chi tiết với stats) | `customerKeys.lists()` |

---

### 10.4 `hooks/useGeolocation.ts`
```typescript
interface GeolocationState {
  lat: number | null
  lng: number | null
  error: string | null    // Thông báo lỗi tiếng Việt
  loading: boolean
}

function useGeolocation(): GeolocationState & {
  getCurrentLocation: () => void
}
```

**Error messages (tiếng Việt)**:
- Permission denied → "Vui lòng cấp quyền truy cập vị trí"
- Position unavailable → "Không thể xác định vị trí hiện tại"
- Timeout → "Hết thời gian chờ vị trí"

**Config**: `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 0`

---

### 10.5 `hooks/useLogout.ts`
**Mục đích**: Xử lý đăng xuất
**Logic**: Gọi `AuthService.logoutNext()` + `useAuthStore.logout()`

---

## 11. CÁC TRANG (PAGES)

### 11.1 `app/layout.tsx` — Root Layout (Server Component)
- Import `globals.css`, Bootstrap Icons CDN, Cloudflare Turnstile script
- Set metadata: title "PointTrack", description
- `dynamic = 'force-dynamic'`
- Render `LayoutClient` với children

### 11.2 `app/layoutClient.tsx` — Root Layout (Client)
- `QueryClientProvider` (retry: 0)
- `ThemeProvider` (next-themes, attribute="class")
- `UserInitializer` (khôi phục session)
- Responsive sidebar layout:
  - Desktop: sidebar 280px (expanded) / 88px (collapsed) + main content
  - Mobile: bottom navigation
- Ẩn Navigation trên trang auth
- `Toaster` (Sonner, position top-right)

### 11.3 `app/page.tsx` — Trang chủ / Dashboard (~390 dòng)
**Điều kiện hiển thị**:
- **Chưa đăng nhập**: Hero landing page với feature cards, nút login
- **Đã đăng nhập**: Dashboard nhân viên

**Dashboard (đã đăng nhập)**:
- Query `UserService.getMe()` (React Query)
- Stats cards:
  - Lương ước tính tháng này
  - Tổng giờ làm
  - Số ngày đi muộn
  - Tổng ngày làm
- Nút Check-in nổi bật (redirect `/checkin`)
- Biểu đồ hoạt động 7 ngày (Chart.js)
- Panel thông báo (với biểu tượng chuông nháy)
- Section hỗ trợ 24/7
- Animations Framer Motion

### 11.4 `app/(auth)/login/page.tsx`
- Layout 2 cột (desktop): cột trái hero + cột phải form
- Responsive: mobile chỉ hiển thị form
- Hero: gradient background + branding PointTrack + feature list
- Render `LoginForm` component

### 11.5 `app/(auth)/reset-password/page.tsx`
- Luồng reset mật khẩu:
  1. Nhập số điện thoại
  2. Nhập OTP
  3. Đặt mật khẩu mới

### 11.6 `app/auth/first-change-password/page.tsx`
- Hiển thị form đổi mật khẩu bắt buộc (lần đầu đăng nhập)
- Validation: min 8 chars, 1 uppercase, 1 digit
- Sau khi đổi: xóa cookie `forcePasswordChange`, redirect dashboard

### 11.7 `app/checkin/page.tsx`
- Bản đồ Leaflet hiển thị vị trí hiện tại và vị trí khách hàng
- Sử dụng `useGeolocation()` hook
- Hiển thị ca làm việc hôm nay của nhân viên
- Check-in: gửi GPS coordinates + ảnh (optional)
- Check-out: tương tự check-in

### 11.8 `app/calendar/page.tsx`
- Lịch làm việc cá nhân theo tuần/tháng
- Hiển thị các ca được phân công
- Xem chi tiết ca (click vào)

### 11.9 `app/exchange/page.tsx`
- Trao đổi/hoán đổi ca giữa nhân viên
- Danh sách ca mở để tự đăng ký

### 11.10 `app/holiday/page.tsx`
- Quản lý nghỉ phép
- Đăng ký ngày nghỉ

### 11.11 `app/profile/page.tsx`
- Thông tin cá nhân nhân viên
- Chỉnh sửa profile (fullName, email, phone)
- Upload avatar (qua FileService.tmpUpload → S3)
- Đổi mật khẩu

### 11.12 `app/admin/layout.tsx`
- Layout admin với `AdminSidebar` + `AdminHeader`

### 11.13 `app/admin/page.tsx`
- Dashboard tổng quan admin

### 11.14 `app/admin/customers/page.tsx`
- Bảng danh sách khách hàng với `DataTable`
- Filter: status, keyword search, source, hasGps
- Phân trang
- Nút thêm, sửa, xóa (soft delete)
- Import Excel
- Xem bản đồ vị trí khách hàng

### 11.15 `app/admin/personnel/page.tsx`
- Stats cards: tổng NV, đang hoạt động, đang nghỉ, mới tháng này
- Bảng danh sách nhân viên
- Filter theo status, search
- Sửa, xóa, cập nhật trạng thái
- Assign salary level

### 11.16 `app/admin/personnel/create/page.tsx`
- Form tạo nhân viên mới
- Validation với `CreateEmployeeSchema`
- Upload avatar

### 11.17 `app/admin/schedule/page.tsx`
- Lịch làm việc tuần của toàn bộ nhân viên
- Drag-and-drop phân ca (dnd-kit)
- Tạo ca, tạo ca lặp lịch
- Kiểm tra xung đột trước khi lưu
- Sao chép lịch tuần
- Filter theo nhân viên

### 11.18 `app/admin/shift-templates/page.tsx`
- CRUD mẫu ca làm việc
- Loại: OFFICE (hành chính) và SHIFT (theo ca)
- Hiển thị thời gian bắt đầu/kết thúc

### 11.19 `app/admin/salary-levels/page.tsx`
- CRUD bậc lương
- Lương cơ bản + phụ cấp

### 11.20 `app/admin/attendance/page.tsx`
- Danh sách bản ghi chấm công
- Admin sửa thủ công
- Duyệt/từ chối giải trình đi muộn

### 11.21 `app/admin/settings/page.tsx`
- Cài đặt thời gian ân hạn (muộn, về sớm)
- Quy tắc phạt

---

## 12. COMPONENTS

### 12.1 `components/auth/LoginForm.tsx` (~200 dòng)
```typescript
// Inputs
- phoneNumber: text, regex /^0\d{9}$/, tiếng Việt
- password: text (ẩn/hiện toggle)
- captchaToken: Cloudflare Turnstile

// Behavior
- React Hook Form + Zod (LoginSchema)
- Mutation: AuthService.login()
- Loading state trên nút submit
- Error toast (tiếng Việt qua getErrorMessage)
- Reset CAPTCHA khi lỗi
- Redirect dựa trên role (admin vs user)
```

### 12.2 `components/common/Navigation.tsx` (~300 dòng)
```typescript
// Desktop Sidebar
- Collapsible (isCollapsed state từ useSidebarStore)
- Nav items: Trang chủ, Lịch, Check-in, Đổi ca, Hồ sơ
- Admin dropdown (chỉ hiện cho role ADMIN)
- Logout button với xác nhận toast
- Active link highlight với Framer Motion animation

// Mobile Bottom Nav
- 5 items cố định: Home, Calendar, Check-in (nổi), Exchange, Profile
- Check-in button: elevated, background gradient
```

### 12.3 `components/providers/UserInitializer.tsx`
```typescript
// Client component, mount khi app load
// Gọi useCurrentUser() để khôi phục session
// Không render UI, chỉ side-effects
```

### 12.4 `components/admin/AdminHeader.tsx`
- Header bar cho admin pages
- Tên trang, breadcrumb, toggle sidebar

### 12.5 `components/admin/AdminSidebar.tsx`
- Sidebar navigation admin
- Links: Dashboard, Nhân sự, Lịch làm, Khách hàng, Mẫu ca, Cài đặt

### 12.6 `components/admin/DataTable.tsx`
- Generic table component
- Props: columns (definitions), data, loading state, empty state
- Pagination controls

### 12.7 `components/admin/customers/CustomerTable.tsx`
- Columns: Tên, SĐT, Địa chỉ, Nguồn, Trạng thái, GPS, Actions
- Row actions: Sửa, Xem bản đồ, Vô hiệu hóa

### 12.8 `components/admin/customers/CustomerForm.tsx`
- Form tạo/sửa khách hàng
- React Hook Form + Zod (customerSchema)
- Tích hợp `LocationPickerModal` để chọn vị trí GPS
- Fields: tên, SĐT, SĐT phụ, địa chỉ (auto-fill từ map), ghi chú, nguồn, trạng thái

### 12.9 `components/admin/scheduling/`
```typescript
ShiftForm           // Form tạo/sửa ca, kiểm tra xung đột real-time
DraggableEmployeeCard  // Thẻ nhân viên kéo-thả vào slot ca (dnd-kit)
ShiftSlot           // Ô ca trên lịch, nhận drop event
ShiftBadge          // Badge hiển thị tên ca, giờ, trạng thái
CopyWeekDialog      // Dialog chọn tuần đích để sao chép lịch
```

### 12.10 `components/maps/`
```typescript
LocationPickerMap   // Map Leaflet tương tác, click để chọn toạ độ
  props: { initialLat?, initialLng?, onSelect: (lat, lng, address) => void }

LocationPickerModal // Modal bao bọc LocationPickerMap
  props: { open, onClose, onConfirm, initialCoords? }

MiniMapPreview      // Map nhỏ chỉ xem, không tương tác
  props: { lat, lng, zoom?, className? }
```

### 12.11 `components/file-upload/avatar-upload.tsx`
- Upload ảnh avatar
- Preview ảnh sau khi chọn
- Gọi `FileService.tmpUpload()` → trả S3 URL
- Loading spinner khi upload

### 12.12 `components/form-control/`
```typescript
FormTextField      // Input text với label, error (React Hook Form)
FormTextArea       // Textarea với label, error
FormCheckboxGroup  // Nhóm checkbox (multi-select)
FormRadioGroup     // Nhóm radio button
FormImageUpload    // Upload file ảnh với preview
```

### 12.13 `components/ui/` (shadcn/ui — 50+ files)
Radix UI primitives được wrap với Tailwind CSS:
- `accordion`, `alert`, `alert-dialog`, `avatar`
- `badge`, `button`
- `calendar`, `card`, `checkbox`, `command`
- `dialog`, `dropdown-menu`
- `form`, `hover-card`
- `input`
- `label`
- `popover`, `progress`
- `radio-group`
- `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `sonner`, `switch`
- `table`, `tabs`, `textarea`, `toast`, `toggle`, `tooltip`

---

## 13. UTILITIES & LIBRARIES

### 13.1 `lib/axios.ts`
*(Xem chi tiết ở mục 5)*

### 13.2 `lib/tokenUtils.ts`
```typescript
setToken(token: string): void          // localStorage 'token'
getToken(): string | null
removeToken(): void                    // Xóa cả 'token' và 'refreshToken'
setRefreshToken(token: string): void   // localStorage 'refreshToken'
getRefreshToken(): string | null
```

### 13.3 `lib/dateUtils.ts`
```typescript
formatMessageTimestamp(timestamp: string): string
// → "Hôm nay", "Hôm qua", "Thứ Hai", "16/03/2026"

formatToISODate(date: Date): string
// → "2026-03-30"

formatVietnameseDay(date: Date): string
// → "Thứ Hai (16/03)"

getDaysInWeek(date: Date): Date[]
// → [Mon, Tue, Wed, Thu, Fri, Sat, Sun] (7 ngày từ thứ Hai)

formatWeekRange(date: Date): string
// → "16/03 – 22/03/2026"

calculateShiftDuration(startTime: string, endTime: string, shiftType: ShiftType): number
// → Số phút (xử lý ca qua đêm)

getWeekYearString(date: Date): string
// → "2026-W12"
```

### 13.4 `lib/errorMessages.ts`
```typescript
ERROR_MESSAGES: Record<string, string> = {
  // Customers
  CUSTOMER_NOT_FOUND: "Không tìm thấy khách hàng",
  CUSTOMER_INACTIVE: "Khách hàng đã ngừng hoạt động",
  CUSTOMER_SUSPENDED: "Khách hàng đang bị tạm khóa",
  CUSTOMER_NO_GPS: "Khách hàng chưa có tọa độ GPS",
  GPS_COORDINATES_INVALID: "Tọa độ GPS không hợp lệ",
  IMPORT_FILE_INVALID: "File import không hợp lệ",

  // Employees
  PHONE_ALREADY_EXISTS: "Số điện thoại đã được sử dụng",
  EMAIL_ALREADY_EXISTS: "Email đã được sử dụng",
  EMPLOYEE_NOT_FOUND: "Không tìm thấy nhân viên",
  EMPLOYEE_INACTIVE: "Nhân viên đã ngừng hoạt động",
  EMPLOYEE_ON_LEAVE: "Nhân viên đang trong kỳ nghỉ phép",
  SALARY_LEVEL_NOT_FOUND: "Không tìm thấy bậc lương",
  SALARY_LEVEL_IN_USE: "Bậc lương đang được sử dụng",

  // Auth
  OTP_INVALID: "Mã OTP không hợp lệ",
  OTP_EXPIRED: "Mã OTP đã hết hạn",
  RESET_TOKEN_INVALID: "Token đặt lại mật khẩu không hợp lệ",
  PASSWORD_POLICY_VIOLATED: "Mật khẩu không đáp ứng yêu cầu bảo mật",

  // Shifts
  SHIFT_CONFLICT: "Ca làm việc bị trùng lịch",
  SHIFT_BUFFER_VIOLATION: "Vi phạm thời gian đệm giữa các ca",
  SHIFT_OVERNIGHT_INVALID: "Ca qua đêm không hợp lệ",

  // Common
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định",
  FORBIDDEN: "Bạn không có quyền thực hiện hành động này",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn"
}

getErrorMessage(error: unknown): string
// Nhận AxiosError, Error, hoặc string → trả thông báo tiếng Việt
```

### 13.5 `lib/utils.ts`
```typescript
cn(...inputs: ClassValue[]): string
// Merge Tailwind classes (clsx + tailwind-merge)
```

### 13.6 `app/globals.css`
- `@tailwind base/components/utilities`
- Import CSS Leaflet
- CSS variables (HSL):
  - Light mode: `--background`, `--foreground`, `--primary`, `--secondary`, ...
  - Dark mode: overrides trong `.dark` class
- Custom login form styles
- Scrollbar hiding: `.hide-scrollbar`
- Leaflet map container overrides

---

## 14. BIẾN MÔI TRƯỜNG

| Biến | Ví dụ | Mục đích |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api` | URL Spring Boot (apiJava) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | Fallback URL Spring Boot |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000/api` | URL Next.js proxy |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x000...AA` | Cloudflare Turnstile CAPTCHA (test key) |
| `STITCH_API_KEY` | `AQ.Ab8RN...` | Stitch service API key |

**AWS S3** (qua backend, không trực tiếp từ FE):
- Bucket: `chat-webapp-nghiadev.s3.ap-southeast-1.amazonaws.com`

**Maps**: OpenStreetMap (miễn phí, không cần API key)

---

## 15. DEPENDENCIES ĐẦY ĐỦ

### Core Framework
| Package | Version | Mục đích |
|---|---|---|
| `next` | 15.5.3 | Framework |
| `react` | 18.2.0 (via overrides) | UI library |
| `react-dom` | 18.2.0 | DOM rendering |
| `typescript` | 5.6.3 | Type safety |

### State & Data Fetching
| Package | Version | Mục đích |
|---|---|---|
| `zustand` | 5.0.8 | Client state management |
| `@tanstack/react-query` | 5.87.4 | Server state (cache, refetch) |
| `axios` | 1.13.4 | HTTP client |

### Forms & Validation
| Package | Version | Mục đích |
|---|---|---|
| `react-hook-form` | 7.71.1 | Form state management |
| `zod` | 3.25.76 | Schema validation |
| `@hookform/resolvers` | latest | Kết nối RHF + Zod |

### UI Components
| Package | Version | Mục đích |
|---|---|---|
| `tailwindcss` | 3.3.3 | Utility CSS |
| `@radix-ui/react-*` | various | Headless UI (13 packages) |
| `class-variance-authority` | latest | Component variants |
| `clsx` | latest | Class merging |
| `tailwind-merge` | latest | Tailwind class dedup |
| `lucide-react` | latest | Icons |

### Animations
| Package | Version | Mục đích |
|---|---|---|
| `framer-motion` | 12.23.22 | Animations & transitions |

### Maps & Geolocation
| Package | Version | Mục đích |
|---|---|---|
| `leaflet` | 1.9.4 | Map library |
| `react-leaflet` | 5.0.0 | React wrapper |
| `@types/leaflet` | latest | TypeScript types |

### Charts
| Package | Version | Mục đích |
|---|---|---|
| `chart.js` | 4.5.1 | Chart library |
| `react-chartjs-2` | latest | React wrapper |
| `recharts` | latest | Alternative charts |

### Drag & Drop
| Package | Version | Mục đích |
|---|---|---|
| `@dnd-kit/core` | latest | Drag-and-drop core |
| `@dnd-kit/sortable` | latest | Sortable lists |
| `@dnd-kit/utilities` | latest | DnD utilities |

### Authentication & Security
| Package | Version | Mục đích |
|---|---|---|
| `jwt-decode` | 4.0.0 | Decode JWT tokens |
| `js-cookie` | 3.0.5 | Cookie management |
| `@marsidev/react-turnstile` | 1.4.1 | Cloudflare CAPTCHA |

### Notifications
| Package | Version | Mục đích |
|---|---|---|
| `sonner` | 1.7.4 | Toast notifications |

### Theme
| Package | Version | Mục đích |
|---|---|---|
| `next-themes` | latest | Dark/light mode |

### Real-time
| Package | Version | Mục đích |
|---|---|---|
| `@stomp/stompjs` | 7.3.0 | WebSocket (STOMP) |
| `sockjs-client` | latest | SockJS fallback |

### Date/Time
| Package | Version | Mục đích |
|---|---|---|
| `date-fns` | latest | Date utilities |

### Excel
| Package | Version | Mục đích |
|---|---|---|
| `xlsx` | latest | Excel parsing/generation |

---

## 16. DANH SÁCH API TÍCH HỢP VỚI BACKEND

### Authentication (`/v1/auth/`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/v1/auth/login` | Đăng nhập |
| POST | `/v1/auth/token/refresh` | Refresh token |
| POST | `/v1/auth/logout` | Đăng xuất |
| GET | `/v1/auth/me` | Lấy thông tin người dùng hiện tại |
| GET | `/v1/auth/profile` | Lấy profile đầy đủ |
| PUT | `/v1/auth/profile` | Cập nhật profile |
| POST | `/v1/auth/password/forgot` | Quên mật khẩu |
| POST | `/v1/auth/password/verify-otp` | Xác thực OTP |
| PUT | `/v1/auth/password/reset` | Reset mật khẩu |
| PUT | `/v1/auth/password/change` | Đổi mật khẩu |
| PUT | `/v1/auth/password/first-change` | Đổi mật khẩu lần đầu |

### Employees (`/v1/employees/`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/v1/employees` | Danh sách nhân viên (paginated) |
| GET | `/v1/employees/statistics` | Thống kê nhân sự |
| GET | `/v1/employees/me` | Profile nhân viên hiện tại |
| POST | `/v1/employees` | Tạo nhân viên |
| PUT | `/v1/employees/{id}` | Cập nhật nhân viên |
| DELETE | `/v1/employees/{id}` | Xóa nhân viên |
| PATCH | `/v1/employees/{id}/status` | Cập nhật trạng thái |
| PATCH | `/v1/employees/{id}/salary-level` | Gán bậc lương |

### Shifts (`/v1/shifts/`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/v1/shifts` | Danh sách ca (lọc tuần/tháng/NV) |
| GET | `/v1/shifts/conflict-check` | Kiểm tra xung đột ca |
| GET | `/v1/shifts/available-employees` | NV rảnh |
| GET | `/v1/shifts/open` | Ca mở (tự nhận) |
| POST | `/v1/shifts` | Tạo ca |
| POST | `/v1/shifts/assign` | Phân ca (drag-drop) |
| POST | `/v1/shifts/recurring` | Tạo ca lặp |
| POST | `/v1/shifts/copy-week` | Sao chép tuần |
| POST | `/v1/shifts/{id}/check-in` | Check-in |
| POST | `/v1/shifts/{id}/check-out` | Check-out |
| POST | `/v1/shifts/{id}/claim` | Tự nhận ca |
| POST | `/v1/shifts/{id}/confirm` | Xác nhận ca |
| PUT | `/v1/shifts/{id}/assign` | Gán NV vào ca |
| DELETE | `/v1/shifts/{id}` | Hủy ca |

### Customers (`/v1/customers/`)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/v1/customers` | Danh sách KH (paginated) |
| GET | `/v1/customers/{id}` | Chi tiết KH |
| GET | `/v1/customers/active-with-gps` | KH active có GPS |
| GET | `/v1/customers/import/template` | Template Excel |
| POST | `/v1/customers` | Tạo KH |
| POST | `/v1/customers/import` | Import Excel |
| POST | `/v1/customers/{id}/geocode` | Reverse geocode |
| PUT | `/v1/customers/{id}` | Cập nhật KH |
| PUT | `/v1/customers/{id}/gps` | Cập nhật GPS |
| DELETE | `/v1/customers/{id}` | Vô hiệu hóa KH |

### Attendance (`/v1/attendance/`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/v1/attendance/schedule/create` | Tạo lịch |
| GET | `/v1/attendance/schedule/all` | Tất cả lịch |
| GET | `/v1/attendance/records` | Bản ghi chấm công |
| POST | `/v1/attendance/approve` | Duyệt giải trình |
| PUT | `/v1/attendance/explanations/{id}/approve` | Duyệt giải trình (v2) |
| PUT | `/v1/attendance/explanations/{id}/reject` | Từ chối giải trình |
| PUT | `/v1/attendance/{id}/admin-update` | Admin sửa bản ghi |

### Shift Templates (`/v1/shift-templates/`)
| Method | Endpoint |
|---|---|
| GET | `/v1/shift-templates` |
| POST | `/v1/shift-templates` |
| PUT | `/v1/shift-templates/{id}` |
| DELETE | `/v1/shift-templates/{id}` |

### Salary Levels (`/v1/salary-levels/`)
| Method | Endpoint |
|---|---|
| GET | `/v1/salary-levels` |
| POST | `/v1/salary-levels` |

### Settings (`/v1/settings/`)
| Method | Endpoint |
|---|---|
| GET | `/v1/settings` |
| PUT | `/v1/settings/grace-period` |

### Files
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/tmpUpload` | Upload tạm thời (trả S3 URL) |
| POST | `/files/download` | Tải file |

---

## 17. CẤU TRÚC THƯ MỤC ĐẦY ĐỦ

```
PointTrack_FE/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── auth/
│   │   └── first-change-password/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── attendance/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── personnel/
│   │   │   ├── page.tsx
│   │   │   └── create/page.tsx
│   │   ├── salary-levels/page.tsx
│   │   ├── schedule/page.tsx
│   │   ├── settings/page.tsx
│   │   └── shift-templates/page.tsx
│   ├── api/
│   │   └── auth/
│   │       ├── clear-force-password/route.ts
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       ├── me/route.ts
│   │       ├── me-token/route.ts
│   │       └── refresh/route.ts
│   ├── services/
│   │   ├── admin.service.ts
│   │   ├── attendance.service.ts
│   │   ├── auth.service.ts
│   │   ├── customer.service.ts
│   │   ├── file.service.ts
│   │   ├── scheduling.service.ts
│   │   └── user.service.ts
│   ├── types/
│   │   ├── admin.schema.ts
│   │   ├── attendance.schema.ts
│   │   ├── auth.schema.ts
│   │   ├── customer.ts
│   │   ├── file.schema.ts
│   │   └── user.schema.ts
│   ├── validations/
│   │   └── customerSchema.ts
│   ├── calendar/page.tsx
│   ├── checkin/page.tsx
│   ├── exchange/page.tsx
│   ├── holiday/page.tsx
│   ├── profile/page.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── global.d.ts
│   ├── layout.tsx
│   ├── layoutClient.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   ├── customers/
│   │   │   ├── CustomerForm.tsx
│   │   │   └── CustomerTable.tsx
│   │   ├── scheduling/
│   │   │   ├── CopyWeekDialog.tsx
│   │   │   ├── DraggableEmployeeCard.tsx
│   │   │   ├── ShiftBadge.tsx
│   │   │   ├── ShiftForm.tsx
│   │   │   └── ShiftSlot.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── DataTable.tsx
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── common/
│   │   └── Navigation.tsx
│   ├── file-upload/
│   │   └── avatar-upload.tsx
│   ├── form-control/
│   │   ├── FormCheckboxGroup.tsx
│   │   ├── FormImageUpload.tsx
│   │   ├── FormRadioGroup.tsx
│   │   ├── FormTextArea.tsx
│   │   └── FormTextField.tsx
│   ├── maps/
│   │   ├── LocationPickerMap.tsx
│   │   ├── LocationPickerModal.tsx
│   │   └── MiniMapPreview.tsx
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   └── UserInitializer.tsx
│   └── ui/
│       └── [50+ shadcn/ui components]
├── hooks/
│   ├── use-debounce.ts
│   ├── useCurrentUser.ts
│   ├── useCustomer.ts
│   ├── useGeolocation.ts
│   └── useLogout.ts
├── lib/
│   ├── axios.ts
│   ├── dateUtils.ts
│   ├── errorMessages.ts
│   ├── tokenUtils.ts
│   └── utils.ts
├── stores/
│   ├── useAuthStore.ts
│   └── useSidebarStore.ts
├── public/
│   └── [static assets]
├── .env
├── .eslintrc.json
├── .prettierrc
├── CLAUDE.md
├── GEMINI.md
├── SPEC.md (file này)
├── components.json
├── middleware.ts
├── next.config.js
├── package.json
├── package-lock.json
├── tailwind.config.ts
└── tsconfig.json
```

---

*Đặc tả này phản ánh trạng thái codebase tại thời điểm 2026-03-30, nhánh `main`.*
