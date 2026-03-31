'use client'

import { useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { UserInitializer } from '@/components/providers/UserInitializer'
import Navigation from '@/components/common/Navigation'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSidebarStore } from '@/stores/useSidebarStore'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const AUTH_PATHS = ['/login', '/signup', '/reset-password', '/forgot-password', '/auth/first-change-password'];

export default function LayoutClient({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClientRef = useRef<QueryClient>()
  const { userInfo: authUser } = useAuthStore()
  const { isCollapsed } = useSidebarStore()
  const pathname = usePathname()

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 0
        }
      }
    })
  }

  const isAuthPath = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isAdminPath = pathname.startsWith('/admin');
  const showNavigation = !!authUser && !isAuthPath && !isAdminPath;

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
        <UserInitializer />
        <div className="flex min-h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Navigation (Sidebar on Desktop, BottomBar on Mobile) */}
            <Navigation />

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-500",
                showNavigation 
                    ? (!isCollapsed ? "lg:pl-[280px]" : "lg:pl-[88px]") 
                    : "lg:pl-0"
            )}>
                <div className="flex-1 flex flex-col w-full max-w-[1920px] mx-auto">
                    {children}
                </div>
            </main>
        </div>

        <Toaster position='top-right' richColors closeButton expand={true} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
