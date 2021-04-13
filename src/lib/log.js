const debug = require('debug')

module.exports = createLog

function createLog (context) {
  const prefix = 'dependency-sync'
  return {
    info: debug(`${prefix}/${context}:info`),
    debug: debug(`${prefix}/${context}:debug`),
    error: debug(`${prefix}/${context}:error`)
  }
}
