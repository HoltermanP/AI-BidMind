interface SkeletonProps {
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
}

export default function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: 4,
        ...style,
      }}
    />
  )
}

export function SkeletonLine({ width = '100%' }: { width?: string | number }) {
  return <Skeleton width={width} height={14} style={{ marginBottom: 8 }} />
}

export function SkeletonCard() {
  return (
    <div style={{ padding: 20, background: 'white', border: '1px solid var(--border)', borderRadius: 4 }}>
      <Skeleton width="60%" height={20} style={{ marginBottom: 12 }} />
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
      <SkeletonLine width="90%" />
    </div>
  )
}
