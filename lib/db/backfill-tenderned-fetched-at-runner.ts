import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { backfillTenderNedFetchedAt } from './backfill-tenderned-fetched-at'

backfillTenderNedFetchedAt()
  .then((r) => {
    console.log('Backfill tenderned_fetched_at:', r)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
