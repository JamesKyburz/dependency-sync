#!/usr/bin/env node
var spawn = require('cross-spawn')
var fs = require('fs')
var packageJson = process.cwd() + '/package.json'
var debug = require('debug')
var concat = require('concat-stream')
var pkgConfig = require('pkg-config')
var builtins = require('builtins')
var argv = process.argv.slice(2)
var chokidar = require('chokidar')
var path = require('path')

var keep = (pkgConfig('dependency-sync', { root: false, cwd: process.cwd() }) || { keep: [] }).keep

var log = { info: debug('dependency-sync:info'), error: debug('dependency-sync:error') }

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
    var uninstall = createUninstall(json)
    var dependencies = json.dependencies || {}
    parse((deps, fileDeps, localDeps) => {
      var installModules = []
      var uninstallModules = []

      Object.keys(deps).forEach((dep) => {
        if (!dependencies[dep]) installModules.push(dep)
      })
      Object.keys(dependencies).forEach((dep) => {
        if (!deps[dep] && !keep[dep]) uninstallModules.push(dep)
      })

      watch((file) => {
        parse(file, localDeps, (newDeps, newFileDeps, newLocalDeps) => {
          log.info('file %s changed', file)
          localDeps = Object.keys(newLocalDeps.concat(localDeps).reduce((sum, key) => {
            sum[key] = true
            return sum
          }, {}))
          var newDependencies = compareDependencies(fileDeps[file], newFileDeps[file])
          newDependencies.install = newDependencies.install.filter((x) => !dependencies[x])
          if (newDependencies.install.length) {
            npmInstall(newDependencies)
          }
          newDependencies.uninstall = newDependencies.uninstall.filter((x) => {
            return !Object.keys(fileDeps)
            .filter((y) => y !== file)
            .filter((y) => fileDeps[y].indexOf(x) !== -1)
            .length
          })
          if (newDependencies.uninstall.length) {
            uninstall(newDependencies.uninstall)
          }
          log.info(newDependencies)
          Object.keys(newFileDeps)
          .forEach((x) => {
            fileDeps[x] = newFileDeps[x]
          })
          Object.keys(newFileDeps)
          .forEach((x) => {
            fileDeps[x] = newFileDeps[x]
          })
        })
      })

      if (installModules.length) {
        npmInstall(installModules, uninstall.bind(null, uninstallModules))
      } else {
        log.info('nothing to install')
        uninstall(uninstallModules)
      }
    })
  })
}

function parse (file, localDeps, cb) {
  var args
  if (arguments.length === 1) {
    args = argv
    cb = file
    localDeps = []
  } else {
    args = [file]
    var firstArgIndex = argv.findIndex((x) => x[0] === '-')
    if (firstArgIndex !== -1) args.push.apply(args, argv.slice(firstArgIndex))
    var exclude = []
    localDeps.forEach((x) => exclude.push('-x', x))
    args.push.apply(args, exclude)
  }

  var browserify = spawn('browserify', args.concat(['--node', '--deps', '--no-builtins', '--no-bundle-external']))
  browserify.stderr.resume()
  browserify.stdout.pipe(concat((data) => {
    var deps = {}
    var fileDeps = {}
    var localDeps = []
    JSON.parse(data).forEach((item) => {
      var filePath = path.relative(process.cwd(), require.resolve(item.file))
      fileDeps[filePath] = []
      Object.keys(item.deps)
      .filter((x) => builtins.indexOf(x) === -1)
      .filter((x) => x !== 'browserify')
      .forEach((x) => {
        if (x[0] === '.') {
          localDeps.push(item.deps[x])
          return
        }
        if (x[0] !== '@') x = x.split('/')[0]
        deps[x] = true
        fileDeps[filePath].push(x)
      })
    })
    cb(deps, fileDeps, localDeps)
  }))
}

function watch (cb) {
  var w = chokidar.watch('.', { cwd: process.cwd(), ignored: /node_modules|\.git/, ignoreInitial: true })
  w.setMaxListeners(0)
  ;['change', 'add'].forEach((event) => {
    w.on(event, (file) => {
      if (!file.match(/jsx?$/i)) return
      cb(file)
    })
  })
}

function createUninstall (json) {
  return uninstall
  function uninstall (modules) {
    if (!modules.length) return
    uninstall.uninstalling = true
    modules.forEach((module) => {
      delete json.dependencies[module]
    })
    fs.writeFile(packageJson, JSON.stringify(json, null, 2), (err) => {
      uninstall.uninstalling = false
      if (err) {
        log.error('failed to remove dependencies from package.json', err)
      } else {
        log.info('removed dependencies from package.json', modules)
      }
    })
  }
}

function npmInstall (install, cb) {
  if (cb) return cb(null)
  return
  if (npmInstall.installing) return setTimeout(npmInstall.bind(null, install, cb))
  npmInstall.installing = true
  log.info('installing', install)
  install.unshift('install')
  install.push('-S')
  var proc = spawn('npm', install)
  proc.on('exit', (exitCode) => {
    npmInstall.installing = false
    if (exitCode) {
      log.error('failed to npm install')
    } else {
      log.info('installed')
    }
    if (cb) cb()
  })
}

function compareDependencies (before, after) {
  before = before || []
  after = after || []
  var install = []
  var uninstall = []
  before.forEach((x) => {
    if (after.indexOf(x) === -1) uninstall.push(x)
  })
  after.forEach((x) => {
    if (before.indexOf(x) === -1) install.push(x)
  })
return { install, uninstall }
}
