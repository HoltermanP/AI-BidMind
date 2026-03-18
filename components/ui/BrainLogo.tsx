'use client'

interface BrainLogoProps {
  size?: number
  className?: string
  /** When true, icon uses brand orange. Default: currentColor (e.g. white on orange). */
  variant?: 'white' | 'brand'
}

/**
 * Hersenlogo voor BidMind — minimal, herkenbaar icoon dat goed schaalt.
 * Twee hersenhelften met een lichte middenvouw.
 */
export function BrainLogo({ size = 24, className, variant = 'white' }: BrainLogoProps) {
  const fill = variant === 'brand' ? '#F5A623' : 'currentColor'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* Hersen-silhouet: twee lobben bovenaan, smallere basis */}
      <path
        fill={fill}
        d="M12 2.5C8.5 2.5 5.5 5 5.5 8.5c0 1.2.3 2.3.9 3.2-.4.5-.7 1.1-.7 1.8 0 1.7 1.3 3 3 3 .4 0 .8-.1 1.1-.2.3.5.7 1 1.2 1.2.9.4 1.9.5 2.9.5s2-.1 2.9-.5c.5-.2.9-.7 1.2-1.2.3.1.7.2 1.1.2 1.7 0 3-1.3 3-3 0-.7-.3-1.3-.7-1.8.6-.9.9-2 .9-3.2C18.5 5 15.5 2.5 12 2.5z"
      />
      {/* Middenvouw (subtiel) */}
      <path
        fill={variant === 'white' ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.2)'}
        d="M12 6.8c-.6 0-1.2.3-1.5.8-.2-.4-.4-.8-.4-1.3 0-1.1.9-2 2-2s2 .9 2 2c0 .5-.2.9-.4 1.3-.3-.5-.9-.8-1.5-.8z"
      />
    </svg>
  )
}
