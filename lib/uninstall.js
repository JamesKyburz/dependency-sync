var packageJson = process.cwd() + '/package.json'
var readPackage = require('./read-package')
var spawn = require('./spawn')
var config = require('./config')
var fs = require('fs')

var yarn = config.yarn

module.exports = uninstall

function uninstall (modules, cb) {
  modules = modules.slice()
  if (!modules.length) return cb()
  if (yarn) {
    var args = modules
    args.unshift('remove')
    return spawn('yarn', args, cb)
  }
  readPackage((err, json) => {
    if (err) return cb(err)
    modules.forEach((module) => {
      delete json.dependencies[module]
    })
    fs.writeFile(packageJson, JSON.stringify(json, null, 2), (err) => {
      if (err) {
        cb(`failed to remove dependencies ${err}`)
      } else {
        cb()
      }
    })
  })
}
