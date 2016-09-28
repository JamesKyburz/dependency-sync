var packageJson = process.cwd() + '/package.json'
var fs = require('fs')

module.exports = get

function get (cb) {
  fs.readFile(packageJson, (err, data) => {
    if (err) return cb(err)
    cb(null, JSON.parse(data))
  })
}
