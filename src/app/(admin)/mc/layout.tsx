import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { MCShell } from './mc-shell'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function MCLayout({ children }: { children: ReactNode }) {
  return <MCShell>{children}</MCShell>
}
