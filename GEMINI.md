# PointTrack Gemini Context

Welcome to the **PointTrack** frontend repository. This document provides essential context, architectural patterns, and development standards for the project.

## 📌 Project Overview
**PointTrack** is a specialized Mobile-First Responsive Web platform for managing on-site service personnel (e.g., home cleaning, repairs). It solves the challenge of mobile workforce management through GPS-fenced attendance, shift scheduling, and automated payroll calculations.

### Core Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Security**: Cloudflare Turnstile (Captcha), JWT (Http-Only Cookies)

---

## 🚀 Building and Running

### Prerequisites
- Node.js 18.x+
- NPM or Yarn

### Key Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start the development server at `http://localhost:3000`.
- `npm run build`: Build the production application.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint checks.
- `npm run prettier:fix`: Format code using Prettier.

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key
```

---

## 🏗 Architectural Patterns

The project follows a **Layered Workflow** to ensure clean separation of concerns:

### 1. Data Layer (`app/types/`)
- Define all API Request/Response shapes and **Zod Schemas** for validation.
- *Example*: `app/types/auth.schema.ts`

### 2. Service Layer (`app/services/`)
- Encapsulate API logic in static class methods.
- Use `apiJava` (from `@/lib/axios`) for direct backend communication or `apiNext` for proxy calls (handling cookies).
- *Example*: `AuthService.login(data)`

### 3. Global State (`stores/`)
- Use **Zustand** for lightweight global state (Auth, Sidebar, etc.).
- Avoid putting complex logic in stores; keep them focused on data persistence.

### 4. Logic & UI Components (`components/`)
- Use **TanStack Query** (`useQuery`, `useMutation`) for all server state.
- Use **React Hook Form** for all form handling.
- Follow **Mobile-First** CSS (Tailwind default classes, use `lg:` for desktop).
- UI Kit: Built on Radix UI primitives (located in `components/ui`).

### 5. Routing & Pages (`app/`)
- Next.js App Router structure.
- Route protection is managed in `middleware.ts` based on token presence and user roles.

---

## 🛡 Development Conventions

### General Rules
- **Mobile-First**: Always code for mobile dimensions first.
- **Strict Typing**: No `any`. Use the types defined in `app/types/`.
- **Validation**: Every form must be validated by Zod before submission.
- **Zero Hardcoding**: Use `lib/Constant.ts` for all shared strings and configurations.
- **Error Handling**: Use the unified error handler in `lib/axios.ts` and `sonner` (Toast) for user feedback.

### API & Authentication
- **Http-Only Cookies**: Authentication tokens are primarily managed via Http-Only cookies for security.
- **Direct vs Proxy**:
    - `apiJava`: Direct calls to Spring Boot (requires manual token handling in headers).
    - `apiNext`: Calls via Next.js routes (automatically handles cookies).
- **Captcha**: Sensitive actions (Login, Reset Password, Attendance) **must** include Cloudflare Turnstile verification.

### Code Style
- Follow the existing Prettier and ESLint configurations.
- Use functional components and hooks.
- Prefer `lucide-react` for icons.

---

## 📂 Key Directory Map
- `app/`: Routing, Services, and Types.
- `components/`: UI Kit, common components, and feature-specific components.
- `hooks/`: Custom React hooks (e.g., `useCurrentUser`, `useGeolocation`).
- `lib/`: Utilities, Axios configuration, and Constants.
- `stores/`: Zustand state definitions.

