var log = require('./log')('install')
var spawn = require('./spawn')
var config = require('./config')
module.exports = install

var yarn = config.yarn

function install (modules, cb) {
  var args = modules.slice()
  if (!args.length) return cb()
  log.info('installing', modules)
  args.unshift(yarn ? 'add' : 'install')
  if (yarn) {
    if (yarn.args) args.push.apply(args, yarn.args)
  } else {
    args.push('-S')
  }
  return spawn(yarn ? 'yarn' : 'npm', args, cb)
}
