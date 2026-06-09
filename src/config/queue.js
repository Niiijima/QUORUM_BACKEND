import { Queue } from 'bullmq'
import env from './env.js'

const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: Number(new URL(env.REDIS_URL).port) || 6379,
}

const mintCoinsQueue = new Queue('mint-coins', { connection })

export { mintCoinsQueue, connection }
