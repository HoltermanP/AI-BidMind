import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'amber'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const variants = {
  primary: {
    background: 'var(--slate-blue)',
    color: 'white',
    border: '1px solid var(--slate-blue)',
  },
  amber: {
    background: 'var(--amber)',
    color: 'white',
    border: '1px solid var(--amber)',
  },
  secondary: {
    background: 'white',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--error-bg)',
    color: 'var(--error)',
    border: '1px solid #FECACA',
  },
}

const sizes = {
  sm: { padding: '5px 10px', fontSize: 12 },
  md: { padding: '7px 14px', fontSize: 13 },
  lg: { padding: '10px 20px', fontSize: 14 },
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyle = variants[variant]
  const sizeStyle = sizes[size]

  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: 4,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        transition: 'opacity 0.15s, background 0.15s',
        opacity: disabled || loading ? 0.6 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.opacity = disabled || loading ? '0.6' : '1'
      }}
    >
      {loading ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
            <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.8s" repeatCount="indefinite"/>
          </path>
        </svg>
      ) : icon}
      {children}
    </button>
  )
}
