import path from 'path'
import { config } from 'dotenv'

config({ path: path.resolve(process.cwd(), '.env.local') })

import { removeJanDeVries } from './remove-jan'

removeJanDeVries()
  .then((r) => {
    console.log(r)
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
