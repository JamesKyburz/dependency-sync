const queue = []
let listener

module.exports = create

function create (fn) {
  listener = fn
  setTimeout(processQueue)
  return { push }
}

function push (item) {
  queue.push(item)
}

function processQueue () {
  const item = queue.shift()
  if (item) {
    listener(item, processQueue)
  } else {
    setTimeout(processQueue, 1000)
  }
}
