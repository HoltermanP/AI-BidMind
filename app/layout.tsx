import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'BidMind – AI voor winnende aanbestedingen',
  description: 'BidMind – AI voor winnende aanbestedingen. Professioneel tendermanagement voor infrastructuuraannemers.',
}

const isUiOnly = process.env.NEXT_PUBLIC_UI_ONLY === 'true'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        {isUiOnly ? children : <ClerkProvider>{children}</ClerkProvider>}
      </body>
    </html>
  )
}
