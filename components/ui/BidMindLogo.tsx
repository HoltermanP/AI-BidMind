'use client'

/**
 * BidMind-logo: AI-hersenen — brein met neurale netwerk-elementen (knooppunten + verbindingen).
 * - Linker hersenhelft: donkerblauw (#1A2540)
 * - Rechter hersenhelft: oranje (#F5A623)
 * - Neuronen (cirkels) en lijnen voor duidelijke AI-associatie
 */
interface BidMindLogoProps {
  width?: number
  height?: number
  className?: string
  /** Alleen het brein-icoon (twee helften), voor sidebar e.d. */
  iconOnly?: boolean
}

/* Van Gelder huisstijl: donkergrijs + rood (vangelder.com) */
const APP_NAVY = '#58595b'
const APP_ORANGE = '#e31e24'
const APP_ORANGE_LIGHT = '#ea4b50'
const APP_ORANGE_DARK = '#b0181e'

/* Brein-silhouet (symmetrisch om x=90 in 0 0 180 80) */
const BRAIN_PATH =
  'M90 8c-24 0-44 12-44 28 0 6 2 12 6 16-3 3-6 8-6 13 0 10 8 18 18 18 3 0 6-.8 9-2 2 3 6 6 10 7 10 3 21 3 31 0 4-1 8-4 10-7 3 1 6 2 9 2 10 0 18-8 18-18 0-5-3-10-6-13 4-4 6-10 6-16 0-16-20-28-44-28z'

/* Neurale knooppunten op het brein (iconOnly viewBox 24x24) */
const ICON_NODES = [
  { cx: 6, cy: 8, r: 1.2 },
  { cx: 9, cy: 12, r: 1 },
  { cx: 6, cy: 16, r: 1 },
  { cx: 15, cy: 8, r: 1.2 },
  { cx: 18, cy: 12, r: 1 },
  { cx: 15, cy: 16, r: 1 },
]
const ICON_LINES = [
  [6, 8, 9, 12], [9, 12, 6, 16], [9, 12, 12, 14],
  [15, 8, 18, 12], [18, 12, 15, 16], [18, 12, 12, 14],
]

/* Neurale knooppunten voor full logo (viewBox 180x80) */
const FULL_NODES = [
  { cx: 55, cy: 22, r: 3 }, { cx: 70, cy: 35, r: 2.5 }, { cx: 52, cy: 48, r: 2 },
  { cx: 125, cy: 22, r: 3 }, { cx: 110, cy: 35, r: 2.5 }, { cx: 128, cy: 48, r: 2 },
]
const FULL_LINES = [
  [55, 22, 70, 35], [70, 35, 52, 48], [70, 35, 90, 38],
  [125, 22, 110, 35], [110, 35, 128, 48], [110, 35, 90, 38],
]

export function BidMindLogo({ width = 180, height, className, iconOnly = false }: BidMindLogoProps) {
  const h = height ?? (iconOnly ? width : 80)
  const viewBox = iconOnly ? '0 0 24 24' : '0 0 180 80'

  return (
    <svg
      width={width}
      height={h}
      viewBox={viewBox}
      fill="none"
      className={className}
      aria-hidden
      style={{ display: 'block' }}
    >
      <defs>
        <filter id="bm-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="bm-text-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#58595b" floodOpacity="0.4" />
        </filter>
        <linearGradient id="bm-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6d6e70" />
          <stop offset="100%" stopColor={APP_NAVY} />
        </linearGradient>
        <linearGradient id="bm-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={APP_ORANGE_LIGHT} />
          <stop offset="50%" stopColor={APP_ORANGE} />
          <stop offset="100%" stopColor={APP_ORANGE_DARK} />
        </linearGradient>
        <clipPath id="bm-left-half">
          <rect x="0" y="0" width="90" height="80" />
        </clipPath>
        <clipPath id="bm-right-half">
          <rect x="90" y="0" width="90" height="80" />
        </clipPath>
        {/* Voor iconOnly: viewBox 24x24, midden 12 */}
        <clipPath id="bm-icon-left">
          <rect x="0" y="0" width="12" height="24" />
        </clipPath>
        <clipPath id="bm-icon-right">
          <rect x="12" y="0" width="12" height="24" />
        </clipPath>
      </defs>

      {iconOnly ? (
        <g filter="url(#bm-glow)">
          <path
            fill="url(#bm-left)"
            clipPath="url(#bm-icon-left)"
            d="M12 2.5C8.5 2.5 5.5 5 5.5 8.5c0 1.2.3 2.3.9 3.2-.4.5-.7 1.1-.7 1.8 0 1.7 1.3 3 3 3 .4 0 .8-.1 1.1-.2.3.5.7 1 1.2 1.2.9.4 1.9.5 2.9.5s2-.1 2.9-.5c.5-.2.9-.7 1.2-1.2.3.1.7.2 1.1.2 1.7 0 3-1.3 3-3 0-.7-.3-1.3-.7-1.8.6-.9.9-2 .9-3.2C18.5 5 15.5 2.5 12 2.5z"
          />
          <path
            fill="url(#bm-right)"
            clipPath="url(#bm-icon-right)"
            d="M12 2.5C8.5 2.5 5.5 5 5.5 8.5c0 1.2.3 2.3.9 3.2-.4.5-.7 1.1-.7 1.8 0 1.7 1.3 3 3 3 .4 0 .8-.1 1.1-.2.3.5.7 1 1.2 1.2.9.4 1.9.5 2.9.5s2-.1 2.9-.5c.5-.2.9-.7 1.2-1.2.3.1.7.2 1.1.2 1.7 0 3-1.3 3-3 0-.7-.3-1.3-.7-1.8.6-.9.9-2 .9-3.2C18.5 5 15.5 2.5 12 2.5z"
          />
          {/* AI-neuronen: verbindingslijnen */}
          {ICON_LINES.map(([x1, y1, x2, y2], i) => (
            <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" strokeLinecap="round" />
          ))}
          {/* AI-neuronen: knooppunten */}
          {ICON_NODES.map((n, i) => (
            <circle key={`n-${i}`} cx={n.cx} cy={n.cy} r={n.r} fill="rgba(255,255,255,0.85)" />
          ))}
        </g>
      ) : (
        <>
          {/* Witte omtrek */}
          <path
            stroke="#fff"
            strokeWidth="2.5"
            fill="none"
            d={BRAIN_PATH}
          />
          {/* Linker helft: donkerblauw */}
          <path fill="url(#bm-left)" clipPath="url(#bm-left-half)" d={BRAIN_PATH} />
          {/* Rechter helft: oranje */}
          <path fill="url(#bm-right)" clipPath="url(#bm-right-half)" d={BRAIN_PATH} />
          {/* AI-neuronen: verbindingslijnen */}
          {FULL_LINES.map(([x1, y1, x2, y2], i) => (
            <line key={`fl-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeLinecap="round" />
          ))}
          {/* AI-neuronen: knooppunten */}
          {FULL_NODES.map((n, i) => (
            <circle key={`fn-${i}`} cx={n.cx} cy={n.cy} r={n.r} fill="rgba(255,255,255,0.9)" />
          ))}
          {/* Tekst */}
          <text
            x="90"
            y="52"
            textAnchor="middle"
            fill="#fff"
            filter="url(#bm-text-shadow)"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 20,
              fontStyle: 'italic',
              letterSpacing: '-0.02em',
            }}
          >
            BidMind
          </text>
        </>
      )}
    </svg>
  )
}
