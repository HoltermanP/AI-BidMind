import path from 'path'
import type { Config } from 'drizzle-kit'
import { config } from 'dotenv'

// Laad .env.local zodat DATABASE_URL beschikbaar is bij db:push / db:generate
config({ path: path.resolve(process.cwd(), '.env.local') })

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
