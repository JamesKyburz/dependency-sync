var log = require('./log')('install')
module.exports = install

var spawn = require('child_process').spawn

var yarn = process.argv.slice(2).indexOf('--yarn') !== -1

function install (modules, cb) {
  modules = modules.slice()
  if (!modules.length) return cb()
  log.info('installing', modules)
  modules.unshift(yarn ? 'add' : 'install')
  modules.push('-S')
  var proc = spawn(yarn ? 'yarn' : 'npm', modules, { stdio: 'inherit' })
  proc.on('exit', (exitCode) => {
    if (exitCode) {
      cb(`${yarn ? 'yarn' : 'npm'} install failed`)
    } else {
      cb()
    }
  })
}
