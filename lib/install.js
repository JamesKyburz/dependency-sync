var log = require('./log')('install')
module.exports = install

var spawn = require('child_process').spawn

function install (modules, cb) {
  modules = modules.slice()
  if (!modules.length) return cb()
  log.info('installing', modules)
  modules.unshift('install')
  modules.push('-S')
  var proc = spawn('npm', modules, { stdio: 'inherit' })
  proc.on('exit', (exitCode) => {
    if (exitCode) {
      cb('npm install failed')
    } else {
      cb()
    }
  })
}
