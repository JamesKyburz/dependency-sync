var debug = require('debug')

module.exports = createLog

function createLog (context) {
  var prefix = 'dependency-sync'
  return {
    info: debug(`${prefix}/${context}:info`),
    error: debug(`${prefix}/${context}:error`)
  }
}
