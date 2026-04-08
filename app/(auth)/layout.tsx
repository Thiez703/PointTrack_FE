import React from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] w-full max-w-full bg-background overflow-x-hidden">{children}</div>
}

