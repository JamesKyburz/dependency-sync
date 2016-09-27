#!/usr/bin/env node
var spawn = require('cross-spawn')
var fs = require('fs')
var packageJson = process.cwd() + '/package.json'
var debug = require('debug')
var concat = require('concat-stream')
var pkgConfig = require('pkg-config')
var builtins = require('builtins')

var keep = (pkgConfig('install-missing', { root: false, cwd: process.cwd() }) || { keep: [] }).keep

var log = { info: debug('install-missing:info'), error: debug('install-missing:error') }

log.info.log = console.log.bind(console)
log.error.log = console.error.bind(console)

fs.stat(packageJson, (err) => {
  if (err) fs.writeFileSync(packageJson, '{}')
  sync()
})

function sync () {
  fs.readFile(packageJson, (err, data) => {
    if (err) throw err
    var json = JSON.parse(data)
    var dependencies = json.dependencies || {}
    var browserify = spawn('browserify', process.argv.slice(2).concat(['--no-bf', '--deps', '--no-bundle-external']))
    browserify.stderr.resume()
    browserify.stdout.pipe(concat((data) => {
      var deps = {}
      JSON.parse(data).forEach((item) => {
        Object.keys(item.deps)
        .filter((x) => x[0] !== '.')
        .filter((x) => builtins.indexOf(x) === -1)
        .filter((x) => x !== 'browserify')
        .forEach((x) => {
          if (x[0] !== '@') x = x.split('/')[0]
          deps[x] = true
        })
      })

      var install = []
      var uninstall = []

      Object.keys(deps).forEach((dep) => {
        if (!dependencies[dep]) install.push(dep)
      })
      Object.keys(dependencies).forEach((dep) => {
        if (!deps[dep] && !keep[dep]) uninstall.push(dep)
      })

      if (install.length) {
        log.info('installing', install)
        install.unshift('install')
        install.push('-S')
        var proc = spawn('npm', install)
        proc.on('exit', (exitCode) => {
          if (exitCode) {
            log.error('failed to npm install')
          } else {
            log.info('installed')
          }
        })
      } else {
        log.info('nothing to install')
      }

      if (uninstall.length) {
        uninstall.forEach((module) => {
          delete json.dependencies[module]
        })
        fs.writeFile(packageJson, JSON.stringify(json, null, 2), (err) => {
          if (err) {
            log.error('failed to remove dependencies from package.json', err)
          } else {
            log.info('removed dependencies from package.json', uninstall)
          }
        })
      }
    }))
  })
}
