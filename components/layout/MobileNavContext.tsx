'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

type MobileNavContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null)

export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => {
      setIsMobile(mq.matches)
      if (!mq.matches) setOpen(false)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    if (open && isMobile) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [open, isMobile])

  const value: MobileNavContextValue = { open, setOpen, toggle, isMobile }

  return (
    <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>
  )
}

export function useMobileNav(): MobileNavContextValue {
  const ctx = useContext(MobileNavContext)
  if (!ctx) {
    throw new Error('useMobileNav moet binnen MobileNavProvider gebruikt worden')
  }
  return ctx
}
