import morgan from 'morgan'
import { createWriteStream } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const accessLogStream = createWriteStream(
  join(__dirname, '../../logs/access.log'),
  { flags: 'a' }
)

const requestLogger = morgan('dev')
const fileLogger = morgan('combined', { stream: accessLogStream })

export { requestLogger, fileLogger }