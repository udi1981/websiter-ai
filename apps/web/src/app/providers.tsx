'use client'

import { type ReactNode } from 'react'
import { LocaleProvider } from '@/lib/locale-context'

/** Client-side providers wrapper — used by the root layout */
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <LocaleProvider>
      {children}
    </LocaleProvider>
  )
}
