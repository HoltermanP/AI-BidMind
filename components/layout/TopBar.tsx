'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function TopBar() {
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
      <header style={{
        height: 52,
        background: 'var(--off-white)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 24,
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}>
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--muted)',
            fontSize: 13,
            fontFamily: 'IBM Plex Sans, sans-serif',
            minWidth: 220,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Zoeken...
          <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--off-white)', border: '1px solid var(--border)', borderRadius: 3, padding: '1px 5px' }}>⌘K</span>
        </button>
        <div style={{ flex: 1 }} />
        <a
          href="/tenders/new"
          style={{
            background: 'var(--amber)',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'IBM Plex Sans, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            textDecoration: 'none',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nieuwe tender
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
            paddingTop: 80,
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
