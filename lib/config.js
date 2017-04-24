var pkgConfig = require('pkg-config')
var path = require('path')

var config = Object.assign(
  {
    args: [],
    keep: [],
    ignore: [],
    yarn: false
  },
  pkgConfig('dependency-sync', { root: false, cwd: process.cwd() })
)

config.ignore = config.ignore.map((x) => path.relative(process.cwd(), x))

config.keep.push('dependency-sync')
config.args.push.apply(config.args, process.argv.slice(2))

if (config.args.indexOf('--debug') !== -1) {
  process.env.DEBUG = (process.env.DEBUG || '') + ' dependency-sync*'
}

if (config.args.indexOf('--yarn') !== -1 && !config.yarn) {
  config.yarn = { args: [] }
}

if (!config.args.filter((x) => !x.match(/^--/)).length) {
  config.args.unshift('.')
}

module.exports = config
