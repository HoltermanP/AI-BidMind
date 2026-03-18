import { SignUp } from '@clerk/nextjs'
import { BidMindLogo } from '@/components/ui/BidMindLogo'

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0F1E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ marginBottom: 12 }}>
          <BidMindLogo width={200} height={80} />
        </div>
        <p style={{ color: '#6B7FA8', fontSize: 14, fontFamily: 'IBM Plex Sans, sans-serif' }}>
          AI voor winnende aanbestedingen
        </p>
      </div>
      <SignUp />
    </div>
  )
}
