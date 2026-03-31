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

**PointTrack** is a GPS-based employee attendance and shift management system. The frontend is a Next.js 15 App Router application that proxies API calls to a Spring Boot Java backend (default: `http://localhost:8080/api`).

### Routing Structure

- `app/(auth)/` — Public auth pages (login, reset-password)
- `app/auth/` — Protected auth flows (first-change-password, forced after login)
- `app/admin/` — Admin dashboard (customers, personnel, schedule, shift-templates)
- `app/api/` — Next.js API route handlers (proxy to Spring Boot)
- `middleware.ts` — Route protection: guards `/`, `/profile`, `/checkin`, `/calendar`, `/exchange`, `/holiday`, `/admin/*`; redirects to `/auth/first-change-password` if `forcePasswordChange` cookie is set

### API Layer (Dual Axios Instances)

`lib/axios.ts` exports two Axios instances:
- **`apiJava`** — Direct calls to Spring Boot backend, used in Next.js API routes (server-side). Reads `NEXT_PUBLIC_API_BASE_URL`.
- **`apiNext`** — Calls Next.js API routes at `/api`, used from client components. Handles HttpOnly cookie forwarding automatically.

Service files in `app/services/` use `apiNext` for client-side calls. Next.js API routes in `app/api/` use `apiJava` for server-side proxying and set HttpOnly cookies.

### Authentication Flow

1. Login via `POST /api/auth/login` (Next.js proxy) → calls Spring Boot → decodes JWT → sets HttpOnly cookies (`accessToken`, `refreshToken`)
2. Auth state stored in **Zustand** (`stores/useAuthStore.ts`): userId, fullName, role, email, phone, avatar, tokens
3. Tokens also synced to localStorage via `lib/tokenUtils`
4. On page load, `components/providers/UserInitializer.tsx` calls `useCurrentUser()` hook to restore session from cookies
5. Token refresh: Axios 401 interceptor calls `POST /api/auth/refresh` and retries the original request

### State Management

- **Zustand** (`stores/`) — Auth state (`useAuthStore`), sidebar state (`useSidebarStore`). Auth store is persisted to localStorage.
- **TanStack React Query** — Server state (caching, refetching). Configured with `retry: 0`. Provider lives in `app/layoutClient.tsx`.

### Forms & Validation

React Hook Form + Zod schemas. Schemas are defined in `app/types/*.schema.ts`. Phone numbers use Vietnamese format: `/^0\d{9}$/`.

### UI Stack

Tailwind CSS + Radix UI primitives (via shadcn/ui, config in `components.json`). Dark mode via `next-themes` (class-based). Toast notifications via Sonner. Maps via Leaflet + React Leaflet (for GPS check-in).

### Environment Variables

Key variables (see `.env`):
- `NEXT_PUBLIC_API_BASE_URL` — Spring Boot base URL
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile CAPTCHA
- AWS S3 credentials for file/avatar uploads
- Google OAuth credentials

### Build Output

`next.config.js` sets `output: 'standalone'` and `distDir: 'dist'`. Images are unoptimized. ESLint errors are ignored during builds.
