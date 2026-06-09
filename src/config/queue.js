const { Queue } = require('bullmq')
const env = require('./env')

const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: Number(new URL(env.REDIS_URL).port) || 6379,
}

const mintCoinsQueue = new Queue('mint-coins', { connection })

module.exports = { mintCoinsQueue, connection }