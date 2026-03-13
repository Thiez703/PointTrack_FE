# PointTrack - Hệ thống Chấm công & Quản lý Ca làm việc (Mobile Web)

## 📌 Giới thiệu dự án
**PointTrack** là nền tảng Web Responsive chuyên biệt dành cho các doanh nghiệp cung cấp dịch vụ tại nhà (Tắm bé, vệ sinh công nghiệp, sửa chữa điện nước...). Hệ thống giải quyết bài toán quản lý nhân sự di động, đảm bảo tính minh bạch trong việc chấm công dựa trên vị trí thực tế của nhân viên tại nhà khách hàng.

### 🌟 Tính năng cốt lõi
*   **Chấm công GPS Fencing**: Xác thực vị trí nhân viên trong bán kính 50m quanh tọa độ nhà khách hàng.
*   **Quản lý Ca cứng (Fixed Duration)**: Hỗ trợ buffer di chuyển 15 phút giữa các ca.
*   **Sắp ca Drag & Drop**: Giao diện trực quan hỗ trợ sắp ca đơn lẻ hoặc gói lặp lại.
*   **Hệ thống Giải trình (Reasoning)**: Xử lý đi muộn, checkout trễ hoặc lỗi định vị GPS.
*   **OT Tự động**: Tự động tính toán tăng ca cho ngày Lễ/Tết và các ca phát sinh đột xuất.
*   **Bảng công Heatmap**: Theo dõi mật độ công việc, chốt công và xuất dữ liệu Excel.
*   **Tính lương tạm tính**: Ước tính thu nhập theo ca và cấp bậc nhân viên.

---

## 🛠 Công nghệ sử dụng (Tech Stack)
*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
*   **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
*   **Animation**: [Framer Motion](https://www.framer.com/motion/)
*   **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
*   **Security**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) (Captcha)
*   **Icons**: Lucide React

---

## 📂 Cấu trúc mã nguồn (Project Structure)

```text
PointTrack_FE/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Luồng xác thực (Login, Signup)
│   ├── admin/              # Giao diện quản trị viên
│   ├── services/           # Gọi API (Axios services)
│   ├── types/              # Định nghĩa TypeScript Interfaces & Zod Schemas
│   ├── layout.tsx          # Layout tổng thể (Head, Font, Script)
│   └── page.tsx            # Trang chủ (Welcome Page)
├── components/             # Thư mục chứa các Component tái sử dụng
│   ├── auth/               # Các form login, signup
│   ├── ui/                 # UI Kit cơ bản (Button, Input, Card...)
│   └── providers/          # React Context Providers (Theme, QueryClient)
├── lib/                    # Cấu hình thư viện dùng chung
│   ├── axios.ts            # Cấu hình Axios Interceptors (Xử lý Token/401)
│   ├── Constant.ts         # Hằng số hệ thống
│   └── utils.ts            # Hàm tiện ích (Helper functions)
├── public/                 # Tài nguyên tĩnh (Images, Icons)
├── stores/                 # Quản lý Global State (Zustand)
├── .env.local              # Biến môi trường (API URL, Site Key)
└── tailwind.config.ts      # Cấu hình giao diện Tailwind
```

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu hệ thống
*   Node.js 18.x trở lên
*   NPM hoặc Yarn

### 2. Cài đặt phụ thuộc
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc và cấu hình các biến sau:
```env
# Cloudflare Turnstile Site Key (Dùng key test nếu chạy localhost)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA

# URL Backend API
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4. Chạy môi trường Phát triển (Development)
```bash
npm run dev
```
Truy cập: `http://localhost:3000`

---

## 🛡 Quy tắc Phát triển (Development Guidelines)

1.  **Xác thực (Auth)**: 
    *   Hệ thống sử dụng **Http-Only Cookie** để quản lý Token.
    *   Mọi yêu cầu API phải đi kèm `withCredentials: true`.
    *   Logic chuyển trang sau đăng nhập phụ thuộc vào `role` và `forcePasswordChange`.

2.  **Giao diện (UI)**: 
    *   Ưu tiên thiết kế **Mobile-First**.
    *   Sử dụng các component trong thư mục `components/ui` để đảm bảo tính nhất quán.

3.  **Xử lý lỗi**:
    *   Sử dụng `sonner` (Toast) để hiển thị thông báo lỗi từ server.
    *   Khi gặp lỗi xác thực 401, `axios.ts` sẽ tự động chuyển hướng người dùng về trang `/login`.

4.  **Bảo mật**:
    *   Tuyệt đối không lưu các thông tin nhạy cảm vào `localStorage`.
    *   Mọi Form phải được bảo vệ bởi **Cloudflare Turnstile**.

---

## 🛠 Hướng dẫn Phát triển tính năng mới (Workflow)

Để đảm bảo code sạch và dễ bảo trì, mọi tính năng mới cần tuân thủ quy trình **5 Bước (Layered Workflow)** sau đây:

### Bước 1: Định nghĩa Data Schema (`app/types/`)
Xác định cấu trúc dữ liệu gửi đi và nhận về. Sử dụng **Zod** để validate.
*   *Ví dụ*: Tạo `app/types/attendance.schema.ts` định nghĩa `AttendanceRequest`.

### Bước 2: Tạo Service gọi API (`app/services/`)
Viết phương thức gọi API trong class service tương ứng. Luôn sử dụng instance `apiJava` từ `@/lib/axios`.
*   *Ví dụ*: `AttendanceService.checkIn(data)`.

### Bước 3: Quản lý Trạng thái & Logic (`Hooks/Mutations`)
Sử dụng **TanStack Query** (`useQuery`, `useMutation`) để xử lý các trạng thái: *Loading, Success, Error*.
*   *Quy tắc*: Không xử lý logic logic phức tạp trực tiếp trong hàm render của Component.

### Bước 4: Xây dựng Giao diện UI (`components/`)
Chia nhỏ giao diện thành các Component nhỏ tại thư mục `components/`.
*   *Yêu cầu*: Sử dụng **Tailwind CSS** (Mobile-First) và **React Hook Form** để kết nối với Schema ở Bước 1.

### Bước 5: Đăng ký Trang (`app/`)
Tạo thư mục trang tương ứng trong `app/` và gọi Component đã xây dựng ở Bước 4.
*   *Ví dụ*: `app/user/checkin/page.tsx`.

---

## 🚩 Quy tắc "Vàng" cho Team
1.  **Mobile-First**: Luôn code cho Mobile trước, dùng `lg:` cho Desktop sau.
2.  **Zero Hardcode**: Đưa các text/config dùng chung vào `lib/Constant.ts`.
3.  **Validation**: Luôn validate dữ liệu ở Frontend bằng Zod trước khi gửi lên API.
4.  **Security**: Mọi hành động POST/PUT nhạy cảm (Đăng nhập, Chấm công) đều phải có Captcha bảo vệ.

---

**Good Luck with your React Journey!** 🚀
