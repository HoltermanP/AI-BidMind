'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMobileNav } from '@/components/layout/MobileNavContext'

export default function TopBar() {
  const { setOpen, isMobile } = useMobileNav()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
    if (e.key === 'Escape') setSearchOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <header
        className="app-top-bar"
        style={{
          minHeight: 52,
          background: 'var(--off-white)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          paddingInline: isMobile ? 12 : 24,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          gap: isMobile ? 10 : 16,
          position: 'sticky',
          top: 0,
          zIndex: 30,
          flexWrap: 'nowrap',
        }}
      >
        {isMobile && (
          <button
            type="button"
            aria-label="Menu openen"
            onClick={() => setOpen(true)}
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              border: '1px solid var(--border)',
              borderRadius: 4,
              background: 'white',
              cursor: 'pointer',
              color: 'var(--navy)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="app-top-bar-search"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '8px 12px',
            cursor: 'pointer',
            color: 'var(--muted)',
            fontSize: 13,
            fontFamily: 'IBM Plex Sans, sans-serif',
            minWidth: isMobile ? 0 : 220,
            flex: 1,
            maxWidth: '100%',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Zoeken...</span>
          {!isMobile && (
            <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px', flexShrink: 0 }}>⌘K</span>
          )}
        </button>
        <a
          href="/tenders/new"
          className="app-top-bar-cta"
          style={{
            background: 'var(--amber)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: isMobile ? '8px 10px' : '6px 14px',
            fontSize: isMobile ? 12 : 13,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {isMobile ? 'Nieuw' : 'Nieuwe tender'}
        </a>
      </header>

      {/* Global search overlay */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 54, 93, 0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: 'max(24px, env(safe-area-inset-top))',
            paddingLeft: 12,
            paddingRight: 12,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <div style={{
            background: 'white',
            borderRadius: 8,
            width: '100%',
            maxWidth: 560,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            marginTop: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek tenders, documenten, vragen..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  color: 'var(--text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query) {
                    router.push(`/tenders?q=${encodeURIComponent(query)}`)
                    setSearchOpen(false)
                    setQuery('')
                  }
                }}
              />
              <button
                onClick={() => setSearchOpen(false)}
                style={{ background: 'var(--slate-blue-light)', border: 'none', borderRadius: 3, padding: '2px 6px', fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                ESC
              </button>
            </div>
            <div style={{ padding: '8px 0', minHeight: 80 }}>
              <p style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: 13, fontFamily: 'IBM Plex Sans, sans-serif' }}>
                {query ? `Druk Enter om te zoeken naar "${query}"` : 'Begin met typen om te zoeken...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
