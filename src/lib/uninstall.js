const log = require('./log')('uninstall')
const spawn = require('./spawn')
const config = require('./config')
module.exports = uninstall

const yarn = config.yarn

function uninstall (modules, cb) {
  const args = modules.slice()
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
