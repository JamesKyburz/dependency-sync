const log = require('./log')('install')
const spawn = require('./spawn')
const config = require('./config')
module.exports = install

const yarn = config.yarn

function install (modules, cb) {
  const args = modules.slice()
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
