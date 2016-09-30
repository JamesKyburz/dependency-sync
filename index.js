#!/usr/bin/env node
var log = require('./lib/log')('index')
var readPackage = require('./lib/read-package')
var parse = require('./lib/parse')
var watch = require('./lib/watch')
var queue = require('./lib/queue')(update)
var compare = require('./lib/compare-dependencies')
var install = require('./lib/install')
var uninstall = require('./lib/uninstall')
var pkgConfig = require('pkg-config')
var path = require('path')

var keep = (pkgConfig('dependency-sync', { root: false, cwd: process.cwd() }) || { keep: [] }).keep
var once = process.argv.slice(2).indexOf('--once') !== -1

processFile()

var deps
var fileDeps
var localDeps
var first = true

function processFile (file, event) {
  if (event === 'unlink' || event === 'add') {
    var filePath = path.resolve(process.cwd(), file)
    if (event === 'unlink') delete localDeps[filePath]
    if (event === 'add') localDeps.push(filePath)
  }
  if (file) log.info('process %s %s', file, event)
  parse(file, localDeps, (err, newDeps, newFileDeps, newLocalDeps) => {
    if (first && err) throw err
    if (first && !once) {
      watch(processFile)
      log.info('watching')
      first = false
    }
    if (!err) {
      queue.push({ file: file, newDeps, newFileDeps, newLocalDeps })
    }
  })
}

function update (item, next) {
  var { file, newDeps, newFileDeps, newLocalDeps } = item
  readPackage((err, json) => {
    if (err) throw err
    var dependencies = json.dependencies || {}
    var installModules = []
    var uninstallModules = []

    if (!deps) {
      deps = newDeps
      fileDeps = newFileDeps
      localDeps = newLocalDeps

      Object.keys(deps).forEach((dep) => {
        if (!dependencies[dep]) installModules.push(dep)
      })

      Object.keys(dependencies).forEach((dep) => {
        if (!deps[dep] && keep.indexOf(dep) === -1) uninstallModules.push(dep)
      })
    } else {
      var updateDependencies = compare(fileDeps[file], newFileDeps[file])
      installModules = updateDependencies
      .install
      .filter((x) => !dependencies[x])

      uninstallModules = updateDependencies
      .uninstall
      .filter((x) => {
        return keep.indexOf(x) === -1 &&
        !Object.keys(fileDeps)
        .filter((y) => y !== file)
        .filter((y) => fileDeps[y].indexOf(x) !== -1)
        .length
      })

      Object.keys(newFileDeps)
      .forEach((x) => {
        fileDeps[x] = newFileDeps[x]
      })
    }

    log.info({ installModules, uninstallModules })

    install(installModules, (err) => {
      if (err) {
        log.error('failed to npm install', err, installModules)
        next()
      } else {
        if (installModules.length) {
          log.info('npm installed modules', installModules)
        } else {
          log.info('nothing to install')
        }
        uninstall(uninstallModules, (err) => {
          if (err) {
            log.error('failed to remove modules from package.json', uninstallModules)
          } else {
            if (uninstallModules.length) {
              log.info('removed modules form package.json', uninstallModules)
            } else {
              log.info('nothing to remove')
            }
          }
          if (!once) next()
        })
      }
    })
  })
}
