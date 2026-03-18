import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Skeleton width={140} height={24} style={{ marginBottom: 6 }} />
        <Skeleton width={260} height={14} />
      </div>

      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 4, minHeight: 100 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={40} style={{ flex: 1, borderRadius: 4 }} />
          ))}
        </div>
      </div>

      <div className="dashboard-kpi-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="dashboard-kpi-card">
            <Skeleton width={48} height={22} style={{ marginBottom: 6 }} />
            <Skeleton width={80} height={12} />
          </div>
        ))}
      </div>

      <div className="dashboard-cols">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
