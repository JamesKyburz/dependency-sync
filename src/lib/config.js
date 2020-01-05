const pkgConfig = require('pkg-config')
const path = require('path')

const config = {
  args: [],
  keep: [],
  ignore: [],
  yarn: false,
  ...pkgConfig('dependency-sync', { root: false, cwd: process.cwd() })
}

config.ignore = config.ignore.map(x => path.relative(process.cwd(), x))

config.keep.push('dependency-sync')
config.args.push.apply(config.args, process.argv.slice(2))

if (!config.args.includes('--quiet')) {
  process.env.DEBUG = (process.env.DEBUG || '') + ' dependency-sync*'
}

if (config.args.includes('--yarn') && !config.yarn) {
  config.yarn = { args: [] }
}

config.args = [
  ...config.args.filter(x => !/^--/.test(x)),
  ...config.args.filter(x => /^--/.test(x))
]

if (!config.args.filter(x => !x.match(/^--/)).length) {
  config.args.unshift('.')
}

module.exports = config
