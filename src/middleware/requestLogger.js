const logger = require('../config/logger')

module.exports = (req, res, next) => {
  logger.info('Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  })

  next()
}