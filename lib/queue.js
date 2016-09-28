var queue = []
var listener
var timer
var completed

module.exports = create

function create (fn) {
  listener = fn
  timer = setTimeout(processQueue)
  return { push, complete }
}

function push (item) {
  queue.push(item)
}

function complete () {
  clearTimeout(timer)
  completed = true
}

function processQueue () {
  if (completed) return
  var item = queue.shift()
  if (item) {
    listener(item, processQueue)
  } else {
    timer = setTimeout(processQueue, 1000)
  }
}
