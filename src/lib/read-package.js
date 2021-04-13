const packageJson = process.cwd() + '/package.json'
const fs = require('fs')

module.exports = get

function get (cb) {
  fs.readFile(packageJson, (err, data) => {
    if (err) return cb(err)
    cb(null, JSON.parse(data))
  })
}
