# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (Next.js)
npm run build        # Production build (outputs to dist/)
npm run start        # Start production server
npm run lint         # ESLint validation
npm run prettier     # Check code formatting
npm run prettier:fix # Auto-format code
```

No test runner is configured in this project.

## Architecture Overview

**PointTrack** is a GPS-based employee attendance and shift management system. The frontend is a Next.js 15 App Router application that proxies auth calls through Next.js API routes to a Spring Boot Java backend (default: `http://localhost:8081/api`).

### Routing Structure

- `app/(auth)/` — Public auth pages (login, reset-password)
- `app/auth/` — Protected auth flows (first-change-password, forced after login)
- `app/admin/` — Admin dashboard (customers, personnel, schedule, shift-templates, salary-levels, settings, attendance/explanations)
- `app/api/auth/` — Next.js API route handlers for auth only (cookie management proxy): `login`, `logout`, `refresh`, `me`, `me-token`, `clear-force-password`
- `middleware.ts` — Route protection using `accessToken`/`refreshToken` cookies; redirects to `/auth/first-change-password` if `forcePasswordChange` cookie is `true`

### API Layer (Dual Axios Instances)

`lib/axios.ts` exports two Axios instances:

- **`apiJava`** — Direct calls to Spring Boot backend. Used by all service files in `app/services/` for data fetching (employees, attendance, scheduling, etc.) and by Next.js API routes when proxying. Adds `Authorization: Bearer <token>` from localStorage on each request. Has a 401 interceptor that calls `/api/auth/refresh`, retries the request, then redirects to `/login` on failure.
- **`apiNext`** — Calls Next.js API routes at `/api/`, used only for auth operations (`AuthService` methods suffixed with `Next`). Uses `withCredentials: true` to forward HttpOnly cookies automatically.

The Next.js API routes at `app/api/auth/` exist solely to manage HttpOnly cookies — login sets `accessToken`, `refreshToken`, and optionally `forcePasswordChange` cookies; logout clears them.

### Authentication Flow

1. Login via `POST /api/auth/login` (Next.js proxy) → calls Spring Boot → decodes JWT expiry → sets HttpOnly cookies (`accessToken`, `refreshToken`, optionally `forcePasswordChange`)
2. `UserInitializer` component (rendered in root layout) calls `useCurrentUser()` hook on every page load
3. `useCurrentUser()` fetches tokens from `/api/auth/me-token`, then calls Spring Boot `GET auth/me` to hydrate Zustand store and `lib/tokenUtils` (localStorage)
4. Auth state in **Zustand** (`stores/useAuthStore.ts`, persisted to `auth-storage` in localStorage): `userInfo`, `accessToken`, `refreshToken`, `forcePasswordChange`
5. Token refresh: `apiJava` 401 interceptor POSTs to `/api/auth/refresh` (Next.js route), which reads the HttpOnly `refreshToken` cookie and calls Spring Boot
6. Password reset flow: phone number → OTP (SMS) → `resetToken` → new password. Uses `auth/password/forgot`, `auth/password/verify-otp`, `auth/password/reset`.

**`AuthService` naming convention**: methods ending in `Next` (`loginNext`, `logoutNext`, `meNext`, `meTokenNext`) use `apiNext` (cookie-based proxy); bare methods (`loginJava`, `logout`, `me`, `refresh`) call Spring Boot directly via `apiJava`.

**Error shape**: Both `apiJava` and `apiNext` normalize errors to `{ message, errorCode, response }` via response interceptors. Always destructure this shape when catching service errors.

### State Management

- **Zustand** (`stores/`) — Auth state (`useAuthStore`), sidebar state (`useSidebarStore`). Auth store persisted to localStorage.
- **TanStack React Query** — Server state (caching, refetching). Configured with `retry: 0`. Provider in `app/layoutClient.tsx`.

### Forms & Validation

React Hook Form + Zod schemas. Schemas in `app/types/*.schema.ts`. Vietnamese phone format: `/^0\d{9}$/`. Time fields use `HH:mm:ss` format. The `ApiResponse<T>` wrapper `{ success, message, data }` is used for most backend responses.

### UI Stack

Tailwind CSS + Radix UI primitives (via shadcn/ui, config in `components.json`). Dark mode via `next-themes` (class-based). Toast notifications via Sonner. Maps via Leaflet + React Leaflet (`components/maps/`) — `CheckinMap` for employee check-in, `LocationPickerMap`/`LocationPickerModal` for admin location setup, `MiniMapPreview` for display.

### Environment Variables

Key variables (see `.env`):
- `NEXT_PUBLIC_API_BASE_URL` — Spring Boot base URL
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile CAPTCHA
- AWS S3 credentials for file/avatar uploads
- Google OAuth credentials

### Build Output

`next.config.js` sets `output: 'standalone'` and `distDir: 'dist'`. Images are unoptimized. ESLint errors are ignored during builds.
