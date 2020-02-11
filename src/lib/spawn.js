var child = require('child_process')
var log = require('./log')('spawn')

module.exports = spawn

function spawn (program, args, cb) {
  var options = { stdio: 'inherit' }
  log.info('executing %s with %j', program, args)
  var proc = child.spawn(program, args, options)
  proc.on('exit', (exitCode) => {
    if (exitCode) {
      cb(new Error(`${program} failed`))
    } else {
      cb()
    }
  })
}
