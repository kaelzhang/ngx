module.exports = {
  start: nginx,
  reload,
  stop,
  test
}


const path = require('path')

// @param {path} dest
function nginx (dest, entry, rest = []) {
  return ['nginx', ['-p', dest, '-c', path.join(dest, entry), ...rest]]
}

function reload (dest, entry) {
  return nginx(dest, entry, ['-s', 'reload'])
}

function stop (dest, entry) {
  return nginx(dest, entry, ['-s', 'stop'])
}

function test (dest, entry) {
  return nginx(dest, entry, ['-t'])
}
