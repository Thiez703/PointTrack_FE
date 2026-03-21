'use client'

import { useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'

export default function LayoutClient({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClientRef = useRef<QueryClient>()

  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 0
        }
      }
    })
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ThemeProvider attribute='class' defaultTheme='light' enableSystem disableTransitionOnChange>
        
        <div className="flex min-h-[100dvh] flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-x-hidden">
            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>

        <Toaster position='top-right' richColors closeButton expand={true} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
