import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { resetUsersAbiant } from './reset-users-abiant'

resetUsersAbiant()
  .then((r) => {
    console.log('Klaar:', r)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
