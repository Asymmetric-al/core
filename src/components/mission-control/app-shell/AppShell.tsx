'use client'

import { memo, type ReactNode } from 'react'
import { SidebarNav } from './SidebarNav'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: ReactNode
}

export const AppShell = memo(function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <div className="hidden lg:flex">
        <SidebarNav />
      </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            {children}
          </main>
        </div>
    </div>
  )
})