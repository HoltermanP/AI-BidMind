interface AvatarProps {
  name?: string | null
  src?: string | null
  size?: number
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getColor(name: string): string {
  const colors = ['#4A7FA5', '#059669', '#7C3AED', '#B45309', '#DC2626', '#0891B2']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export default function Avatar({ name, src, size = 28 }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || ''}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    )
  }

  const initials = name ? getInitials(name) : '?'
  const color = name ? getColor(name) : '#9CA3AF'

  return (
    <div
      title={name || undefined}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 600,
        fontFamily: 'IBM Plex Sans, sans-serif',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  )
}
