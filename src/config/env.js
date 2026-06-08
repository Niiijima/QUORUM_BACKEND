import 'dotenv/config'

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  //MONGO_URL: process.env.MONGO_URL = "mongodb://maloney:malone7@ac-rpo2guk-shard-00-00.muxyvwp.mongodb.net:27017,ac-rpo2guk-shard-00-01.muxyvwp.mongodb.net:27017,ac-rpo2guk-shard-00-02.muxyvwp.mongodb.net:27017/UserDB?ssl=true&replicaSet=atlas-10ouso-shard-0&authSource=admin&appName=Cluster0",
  //JWT_SECRET: process.env.JWT_SECRET = "0b223c570a956798070c33357fc44244fbbdac2900a07949f6dcf64a0a41ccff7fd8ad03",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY,
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}

const required = ['MONGO_URL', 'JWT_SECRET']
for (const key of required) {
  if (!env[key]) {
    console.error(`Missing required env variable: ${key}`)
    process.exit(1)
  }
}

export default env
