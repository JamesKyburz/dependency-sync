var pkgConfig = require('pkg-config')

module.exports = Object.assign(
  {
    keep: [],
    yarn: false
  },
  pkgConfig('dependency-sync', { root: false, cwd: process.cwd() })
)
