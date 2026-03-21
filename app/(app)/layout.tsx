import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { MobileNavProvider } from '@/components/layout/MobileNavContext'
import { ToastProvider } from '@/components/ui/Toast'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MobileNavProvider>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
            <TopBar />
            <main
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                background: '#F7F6F2',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </MobileNavProvider>
    </ToastProvider>
  )
}
