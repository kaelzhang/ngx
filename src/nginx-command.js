module.exports = {
  start: nginx,
  reload,
  stop,
  test
}


// @param {path} dest
function nginx (dest, destEntry, rest = []) {
  return ['nginx', ['-p', dest, '-c', destEntry, ...rest]]
}

function reload (dest) {
  return nginx(dest, ['-s', 'reload'])
}

function stop (dest) {
  return nginx(dest, ['-s', 'stop'])
}

function test (dest) {
  return nginx(dest, ['-t'])
}
