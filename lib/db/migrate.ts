import path from 'path'
import { config } from 'dotenv'
config({ path: path.resolve(process.cwd(), '.env.local') })

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

async function runMigrations() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle') })
  console.log('Migrations complete')
}

runMigrations().catch(console.error)
