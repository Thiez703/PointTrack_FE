# GitHub Copilot Instructions for PointTrack

This file helps GitHub Copilot understand the PointTrack codebase architecture and conventions.

## Project Overview

**PointTrack** is a GPS-based employee attendance and shift management system for on-site service personnel (home cleaning, repairs, etc.). Frontend is built with Next.js 15 (App Router) + TypeScript, communicating with a Spring Boot Java backend.

## Commands

```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Production build (outputs to dist/)
npm run start        # Start production server
npm run lint         # ESLint validation
npm run prettier     # Check code formatting
npm run prettier:fix # Auto-format code
```

**No test runner is configured in this project.**

## High-Level Architecture

### Dual Axios Instance Pattern (`lib/axios.ts`)

The app uses **two separate Axios instances** for different purposes:

- **`apiJava`**: Direct calls to Spring Boot backend (`http://localhost:8080/api`). Used by all service files in `app/services/` for data fetching. Adds `Authorization: Bearer <token>` from localStorage. Has a 401 interceptor that calls `/api/auth/refresh`, retries the request, then redirects to `/login` on failure.

- **`apiNext`**: Calls Next.js API routes at `/api/`, used **only for auth operations** (`AuthService` methods suffixed with `Next`). Uses `withCredentials: true` to automatically forward HttpOnly cookies.

**When to use which:**
- Use `apiJava` for all business logic (employees, attendance, scheduling, customers, etc.)
- Use `apiNext` only for auth operations that need HttpOnly cookie management

### Authentication Flow

1. **Login**: `POST /api/auth/login` (Next.js proxy) → calls Spring Boot → decodes JWT expiry → sets HttpOnly cookies (`accessToken`, `refreshToken`, optionally `forcePasswordChange`)

2. **Initialization**: `UserInitializer` component (in root layout) calls `useCurrentUser()` on every page load → fetches tokens from `/api/auth/me-token` → calls Spring Boot `GET auth/me` → hydrates Zustand store and localStorage

3. **State Storage**: Auth state lives in **Zustand** (`stores/useAuthStore.ts`, persisted to `auth-storage` in localStorage): `userInfo`, `accessToken`, `refreshToken`, `forcePasswordChange`

4. **Token Refresh**: When `apiJava` gets a 401, the interceptor POSTs to `/api/auth/refresh` (Next.js route), which reads the HttpOnly `refreshToken` cookie and calls Spring Boot. On success, updates tokens; on failure, redirects to `/login`

5. **Route Protection**: `middleware.ts` checks for `accessToken`/`refreshToken` cookies. Redirects unauthenticated users to `/login` and users with `forcePasswordChange=true` to `/auth/first-change-password`

### Routing Structure

- `app/(auth)/` — Public auth pages (login, signup, reset-password, forgot-password)
- `app/auth/` — Protected auth flows (first-change-password, forced after login)
- `app/admin/` — Admin dashboard (customers, personnel, schedule, shift-templates, salary-levels, settings)
- `app/api/auth/` — Next.js API route handlers for auth **only** (cookie management proxy to Spring Boot)
- `middleware.ts` — Route protection based on cookies

### Layered Workflow (5-Step Pattern)

When adding new features, follow this strict separation of concerns:

1. **Data Layer** (`app/types/`): Define API Request/Response types and **Zod schemas** for validation. Example: `app/types/attendance.schema.ts`

2. **Service Layer** (`app/services/`): Encapsulate API logic in static class methods. Use `apiJava` for backend calls or `apiNext` for auth. Example: `AttendanceService.checkIn(data)`

3. **Global State** (`stores/`): Use **Zustand** for lightweight global state (Auth, Sidebar, etc.). Keep stores focused on data persistence, not complex logic.

4. **Logic & UI Components** (`components/`): Use **TanStack Query** (`useQuery`, `useMutation`) for server state. Use **React Hook Form** for forms. Follow **Mobile-First** CSS.

5. **Routing & Pages** (`app/`): Create page files that compose components from Step 4.

## Key Conventions

### Mobile-First CSS
Always write Tailwind classes for mobile dimensions first, then use `lg:` prefix for desktop overrides.

```tsx
// Good: mobile default, desktop override
<div className="text-sm lg:text-base">

// Bad: desktop-first thinking
<div className="text-base md:text-sm">
```

### Form Validation Pattern
Every form must use **React Hook Form** + **Zod schema** validation:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/app/types/auth.schema'

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' }
})
```

### Zero Hardcoding Rule
All shared strings, configurations, and constants must live in `lib/Constant.ts`. Never hardcode text, URLs, or config values in components.

```tsx
// Good
import { SITE_CONFIG } from '@/lib/Constant'
<p>{SITE_CONFIG.phone}</p>

// Bad
<p>1800 6324</p>
```

### Vietnamese Phone Validation
Phone number regex: `/^0\d{9}$/` (must start with 0, followed by exactly 9 digits)

### Time Format
All time fields use `HH:mm:ss` format (24-hour, zero-padded).

### API Response Wrapper
Most backend responses use `ApiResponse<T>` shape: `{ success: boolean, message: string, data: T }`

### Cloudflare Turnstile (Captcha)
Sensitive actions (Login, Reset Password, Attendance Check-in) **must** include Cloudflare Turnstile verification. Use `@marsidev/react-turnstile` component and validate the token server-side.

### Error Handling
- Use the unified error handler in `lib/axios.ts`
- Display errors via `sonner` (Toast notifications)
- Never use `alert()` or `console.error()` for user-facing errors

### TypeScript Strictness
- **No `any` types**. Use proper types from `app/types/` or create new ones.
- Prefer interfaces for object shapes, types for unions/primitives.

### State Management Split
- **Zustand**: Global auth state, UI state (sidebar), persisted user preferences
- **TanStack Query**: Server state (caching, refetching, mutations). Configured with `retry: 0`.
- **React Hook Form**: Form state (local to components)
- **Never mix concerns**: Don't put server data in Zustand, don't put global state in forms.

### UI Components
- Built on **Radix UI** primitives (via shadcn/ui, config in `components.json`)
- Use `lucide-react` for icons
- Dark mode via `next-themes` (class-based)
- Maps via **Leaflet** + **React Leaflet** for GPS features

## Environment Variables

Key variables (create `.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
# AWS S3 credentials for file/avatar uploads
# Google OAuth credentials
```

## Build Configuration

- `next.config.js` sets `output: 'standalone'` and `distDir: 'dist'`
- Images are unoptimized
- ESLint errors are ignored during production builds

## Service Layer Pattern

All API calls go through static class methods in `app/services/`. Example structure:

```tsx
// app/services/attendance.service.ts
export class AttendanceService {
  static async checkIn(data: CheckInRequest) {
    const response = await apiJava.post('/attendance/checkin', data)
    return response.data
  }
  
  static async getHistory(params: HistoryParams) {
    const response = await apiJava.get('/attendance/history', { params })
    return response.data
  }
}
```

Then consume in components via TanStack Query:

```tsx
const { mutate } = useMutation({
  mutationFn: AttendanceService.checkIn,
  onSuccess: (data) => { /* ... */ }
})
```
