const config = require('./config')
const spawn = require('cross-spawn')
const concat = require('concat-stream')
const builtins = require('builtins')()
const path = require('path')
const log = require('./log')('parse')
const bin = require('bin-path')(require)
const argv = config.args
const { browserify: browserifyBin } = bin('browserify')

module.exports = parse

function parse (file, localDeps, cb) {
  let args = file ? [file] : argv
  const filePath = file ? path.resolve(process.cwd(), file) : null
  localDeps = localDeps || []
  const firstArgIndex = argv.findIndex(x => x[0] === '-')
  if (firstArgIndex !== -1) args.push.apply(args, argv.slice(firstArgIndex))
  const exclude = []

  localDeps.filter(x => filePath !== x).forEach(x => exclude.push('-x', x))

  args.push.apply(args, exclude)
  args = args.concat([
    '--node',
    '--deps',
    '--no-builtins',
    '--no-bundle-external'
  ])

  const browserify = spawn(browserifyBin, args)
  browserify.stderr.pipe(process.stderr)
  browserify.stdout.pipe(
    concat(data => {
      let json
      try {
        json = JSON.parse(data)
      } catch (e) {
        return cb(new Error(`Error in browserify ${e}`))
      }
      const deps = {}
      const fileDeps = {}
      const localDeps = []
      json.forEach(item => {
        const filePath = path.relative(process.cwd(), require.resolve(item.file))
        if (config.ignore.find(x => x === filePath)) return
        fileDeps[filePath] = []
        Object.keys(item.deps)
          .filter(x => builtins.indexOf(x) === -1)
          .forEach(x => {
            if (x[0] === '.') {
              localDeps.push(item.deps[x])
              return
            }
            if (x[0] !== '@') x = x.split('/')[0]
            if (x) {
              deps[x] = true
              fileDeps[filePath].push(x)
            }
          })
      })
      log.info('browserify complete')
      cb(null, deps, fileDeps, localDeps)
    })
  )
}
