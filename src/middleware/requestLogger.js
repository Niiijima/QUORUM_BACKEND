import logger from '../config/logger.js'

export default (req, res, next) => {
  logger.info('Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  })
  next()
}