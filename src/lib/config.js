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
  process.env.DEBUG =
    (process.env.DEBUG || '') +
    ' dependency-sync*info*' +
    ' dependency-sync*error*' +
    (config.args.includes('--verbose') ? ' dependency-sync*debug*' : '')
}

if (config.args.includes('--yarn') && !config.yarn) {
  config.yarn = { args: [] }
}

if (config.args.includes('--dry-run')) {
  config.dryRun = true
}

if (config.args.includes('--check-only')) {
  config.checkOnly = true
}

config.args = [
  ...config.args.filter(x => !/^--/.test(x)),
  ...config.args.filter(x => /^--/.test(x))
]

if (!config.args.find(x => x.startsWith('.'))) {
  config.args.unshift('.')
}

module.exports = config
