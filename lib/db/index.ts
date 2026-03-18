import path from 'path'
import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Bij standalone scripts (db:seed, db:migrate) wordt .env.local niet automatisch geladen
if (typeof process !== 'undefined' && !process.env.DATABASE_URL) {
  config({ path: path.resolve(process.cwd(), '.env.local') })
}

const url = process.env.DATABASE_URL
const sql = url ? neon(url) : null
export const db = sql ? drizzle(sql, { schema }) : null
export const isDbAvailable = !!db

export type DB = NonNullable<typeof db>
