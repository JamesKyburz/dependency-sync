var argv = process.argv.slice(2)
var spawn = require('child_process').spawn
var concat = require('concat-stream')
var builtins = require('builtins')
var path = require('path')
var log = require('./log')('parse')

module.exports = parse

function parse (file, localDeps, cb) {
  var args = file ? [file] : argv
  var filePath = file ? path.resolve(process.cwd(), file) : null
  localDeps = localDeps || []
  var firstArgIndex = argv.findIndex((x) => x[0] === '-')
  if (firstArgIndex !== -1) args.push.apply(args, argv.slice(firstArgIndex))
  var exclude = []
  localDeps
  .filter((x) => filePath !== x)
  .forEach((x) => exclude.push('-x', x))

  args.push.apply(args, exclude)
  args = args.concat(['--node', '--deps', '--no-builtins', '--no-bundle-external'])

  var browserify = spawn('browserify', args)
  browserify.stderr.pipe(process.stderr)
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
    log.info('browserify complete')
    cb(deps, fileDeps, localDeps)
  }))
}