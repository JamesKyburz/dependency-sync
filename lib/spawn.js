var child = require('child_process')

module.exports = spawn

function spawn (program, args, cb) {
  var options = { stdio: 'inherit' }
  var proc = child.spawn(program, args, options)
  proc.on('exit', (exitCode) => {
    if (exitCode) {
      cb(`${program} failed`)
    } else {
      cb()
    }
  })
}
