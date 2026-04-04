'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { BidMindLogo } from '@/components/ui/BidMindLogo'
import { useMobileNav } from '@/components/layout/MobileNavContext'

const UserButton = dynamic(
  () => import('@clerk/nextjs').then((m) => m.UserButton),
  { ssr: false }
)
const isUiOnly = process.env.NEXT_PUBLIC_UI_ONLY === 'true'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/tenders',
    label: 'Tenders',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href: '/kalender',
    label: 'Kalender',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    href: '/team',
    label: 'Team',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/handleiding',
    label: 'Handleiding',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="8" y1="7" x2="16" y2="7"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
  },
  {
    href: '/bedrijfsinformatie',
    label: 'Bedrijfsinformatie',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/instellingen',
    label: 'Instellingen',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { open, setOpen, isMobile } = useMobileNav()
  const navCollapsed = !isMobile && collapsed

  return (
    <>
      {isMobile && open && (
        <button
          type="button"
          aria-label="Menu sluiten"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            border: 'none',
            padding: 0,
            margin: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            cursor: 'pointer',
          }}
        />
      )}
      <motion.aside
        initial={false}
        animate={
          isMobile
            ? { x: open ? 0 : '-100%', width: 280 }
            : { x: 0, width: collapsed ? 56 : 220 }
        }
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--navy-mid)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: isMobile ? 'fixed' : 'sticky',
          left: isMobile ? 0 : undefined,
          top: isMobile ? 0 : undefined,
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: isMobile ? 50 : 40,
        }}
      >
      {/* Logo: AI-Group (huisstijlgids) + BidMind + slogan */}
      <div style={{
        padding: navCollapsed ? '16px 10px' : '14px 12px 16px',
        borderBottom: '1px solid var(--navy-mid)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: navCollapsed ? 'center' : 'stretch',
        gap: navCollapsed ? 0 : 12,
        minHeight: navCollapsed ? 64 : undefined,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: navCollapsed ? 'center' : 'flex-start',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <img
            src="/ai-group-logo-sidebar.svg"
            alt="AI-Group.nl"
            width={navCollapsed ? 36 : 196}
            height={navCollapsed ? 36 : 44}
            style={{ objectFit: 'contain', width: navCollapsed ? 36 : '100%', maxWidth: 196, height: 'auto' }}
          />
        </div>
        <AnimatePresence>
          {!navCollapsed && (
            <>
              {/* BidMind logo volledig (brein + tekst) */}
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingTop: 4,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <BidMindLogo width={140} height={62} iconOnly={false} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-tagline)',
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--sidebar-text)',
                  lineHeight: 1.3,
                }}
              >
                AI voor winnende aanbestedingen
              </motion.p>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: navCollapsed ? '10px 0' : '10px 20px',
                justifyContent: navCollapsed ? 'center' : 'flex-start',
                position: 'relative',
                color: isActive ? 'var(--off-white)' : 'var(--sidebar-text)',
                textDecoration: 'none',
                transition: 'color 0.15s, background 0.15s',
                background: isActive ? 'rgba(45, 111, 232, 0.14)' : 'transparent',
                marginBottom: 2,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text-hover)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text)'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: 'var(--ai-blue)',
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <AnimatePresence>
                {!navCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Bottom: collapse toggle + user */}
      <div style={{
        borderTop: '1px solid var(--navy-mid)',
        padding: navCollapsed ? '12px 0' : '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: navCollapsed ? 'center' : 'stretch',
      }}>
        <div style={{ display: 'flex', justifyContent: navCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
          {!navCollapsed && (
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
              {isUiOnly ? (
                <div
                  title="UI-only modus (geen inloggen)"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--navy-mid)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sidebar-text)',
                    fontSize: 14,
                  }}
                >
                  ?
                </div>
              ) : (
                <UserButton />
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => (isMobile ? setOpen(false) : setCollapsed(!collapsed))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--sidebar-text)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            title={isMobile ? 'Menu sluiten' : navCollapsed ? 'Uitklappen' : 'Inklappen'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: !isMobile && navCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
        {navCollapsed && (
          <div style={{ transform: 'scale(0.85)' }}>
            {isUiOnly ? (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#1A2540',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sidebar-text)',
                  fontSize: 14,
                }}
              >
                ?
              </div>
            ) : (
              <UserButton />
            )}
          </div>
        )}
      </div>
    </motion.aside>
    </>
  )
}
