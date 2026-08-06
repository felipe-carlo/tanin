import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })
console.log('ok', Object.keys(payload.collections).length)
process.exit(0)
