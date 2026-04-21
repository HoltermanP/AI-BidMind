import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { syncAbiantJobTitles } from './sync-abiant-jobtitles'

syncAbiantJobTitles()
  .then((r) => {
    console.log('Functietitels bijgewerkt voor', r.updated, 'Abiant-profielen')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
