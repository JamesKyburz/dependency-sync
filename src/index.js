#!/usr/bin/env node
const config = require('./lib/config')
const log = require('./lib/log')('index')
const readPackage = require('./lib/read-package')
const parse = require('./lib/parse')
const watch = require('./lib/watch')
const queue = require('./lib/queue')(update)
const compare = require('./lib/compare-dependencies')
const install = require('./lib/install')
const uninstall = require('./lib/uninstall')
const path = require('path')
const watchChanges = config.args.includes('--watch')
const keep = config.keep

log.debug(config)

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
    if (first && watchChanges) {
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

      Object.keys(deps).forEach(dep => {
        if (!dependencies[dep]) installModules.push(dep)
      })

      Object.keys(dependencies).forEach(dep => {
        if (!deps[dep] && keep.indexOf(dep) === -1) uninstallModules.push(dep)
      })
    } else {
      var updateDependencies = compare(fileDeps[file], newFileDeps[file])
      installModules = updateDependencies.install.filter(x => !dependencies[x])

      uninstallModules = updateDependencies.uninstall.filter(x => {
        return (
          keep.indexOf(x) === -1 &&
          !Object.keys(fileDeps)
            .filter(y => y !== file)
            .filter(y => fileDeps[y].indexOf(x) !== -1).length
        )
      })

      Object.keys(newFileDeps).forEach(x => {
        fileDeps[x] = newFileDeps[x]
      })
    }

    log.info({ installModules, uninstallModules })

    if (installModules.length || uninstallModules.length) {
      if (config.dryRun) {
        log.info('dry run, will not update')
        return
      }
      if (config.checkOnly) {
        log.error('failed check, modules not in sync')
        process.exit(1)
      }
    }

    install(installModules, err => {
      if (err) {
        log.error('failed to npm install', err, installModules)
        next()
      } else {
        if (installModules.length) {
          log.info('npm installed modules', installModules)
        } else {
          log.info('nothing to install')
        }
        uninstall(uninstallModules, err => {
          if (err) {
            log.error(
              'failed to remove modules from package.json',
              uninstallModules
            )
          } else {
            if (uninstallModules.length) {
              log.info('removed modules form package.json', uninstallModules)
            } else {
              log.info('nothing to remove')
            }
          }
          if (watchChanges) next()
        })
      }
    })
  })
}
