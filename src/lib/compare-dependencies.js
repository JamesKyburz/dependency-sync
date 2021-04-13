module.exports = compare

function compare (before, after) {
  const install = []
  const uninstall = []
  before = before || []
  after = after || []
  before.forEach((x) => {
    if (after.indexOf(x) === -1) uninstall.push(x)
  })
  after.forEach((x) => {
    if (before.indexOf(x) === -1) install.push(x)
  })
  return { install, uninstall }
}
