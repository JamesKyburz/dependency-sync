var pkgConfig = require('pkg-config')

var config = Object.assign(
  {
    args: [],
    keep: [],
    yarn: false
  },
  pkgConfig('dependency-sync', { root: false, cwd: process.cwd() })
)

config.keep.push('dependency-sync')
config.args.push.apply(config.args, process.argv.slice(2))

if (config.args.indexOf('--debug') !== -1) {
  process.env.DEBUG = (process.env.DEBUG || '') + ' dependency-sync*'
}

if (config.args.indexOf('--yarn') !== -1 && !config.yarn) {
  config.yarn = { args: [] }
}

module.exports = config
