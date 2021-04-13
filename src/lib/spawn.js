const child = require('child_process')
const log = require('./log')('spawn')

module.exports = spawn

function spawn (program, args, cb) {
  const options = { stdio: 'inherit' }
  log.info('executing %s with %j', program, args)
  const proc = child.spawn(program, args, options)
  proc.on('exit', (exitCode) => {
    if (exitCode) {
      cb(new Error(`${program} failed`))
    } else {
      cb()
    }
  })
}
