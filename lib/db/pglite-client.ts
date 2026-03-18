/**
 * PGlite in-memory Postgres client for demo mode (no DATABASE_URL needed).
 * The global singleton persists across HMR cycles in Next.js dev mode.
 */
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import * as schema from './schema'

declare global {
  // eslint-disable-next-line no-var
  var __pglite: PGlite | undefined
  // eslint-disable-next-line no-var
  var __pglite_ready: boolean | undefined
}

function getClient(): PGlite {
  if (!global.__pglite) {
    global.__pglite = new PGlite()
    global.__pglite_ready = false
  }
  return global.__pglite
}

export const pgliteClient = getClient()
export const demoDB = drizzle(pgliteClient, { schema })

export function isPgliteReady(): boolean {
  return !!global.__pglite_ready
}

export function markPgliteReady(): void {
  global.__pglite_ready = true
}
