import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse, NextFetchEvent } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

// UI-only modus: geen redirect naar sign-in, request mag doorgaan (auth() in API routes werkt)
const isUiOnly = process.env.NEXT_PUBLIC_UI_ONLY === 'true'

const clerkWithAuth = clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return
  if (isUiOnly) return
  const { userId } = await auth()
  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(signInUrl)
  }
})

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  return clerkWithAuth(request, event)
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
