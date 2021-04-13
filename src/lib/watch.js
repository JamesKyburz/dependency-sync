const chokidar = require('chokidar')

module.exports = watch

function watch (cb) {
  const w = chokidar.watch('.', { cwd: process.cwd(), ignored: /node_modules|\.git/, ignoreInitial: true })
  w.setMaxListeners(0)
  ;['change', 'add', 'unlink'].forEach((event) => {
    w.on(event, (file) => {
      if (!file.match(/jsx?$/i)) return
      cb(file, event)
    })
  })
}
