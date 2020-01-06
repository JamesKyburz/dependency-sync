var log = require('./log')('uninstall')
var spawn = require('./spawn')
var config = require('./config')
module.exports = uninstall

var yarn = config.yarn

function uninstall (modules, cb) {
  var args = modules.slice()
  if (!args.length) return cb()
  log.info('uninstalling', modules)
  args.unshift(yarn ? 'remove' : 'uninstall')
  if (yarn) {
    if (yarn.args) args.push.apply(args, yarn.args)
  } else {
    args.push('-S')
  }
  return spawn(yarn ? 'yarn' : 'npm', args, cb)
}
